import {localConfigDirPath} from "../some";
import {match} from "../utils/fuzzy";
import {utools_db_store} from "./base";
import {tagColorManager} from "./tag";
import {batch_delete_utools_keyword, delete_utools_keyword, register_utools_keyword} from "./keyword";
import {configManager} from "./config";

const CODE_PREFIX = "code/";
const SUB_CODE_PREFIX = "#code/"
const GLOBAL_FUNC = "func";
export const codeSnippetManager = {
    // Code Snippet Map (key is its id)
    rootSnippetMap: new Map(),
    snippetMap: null,
    snippetKey: null,
    isInited: false,

    init() {
        if (this.isInited) {
            return;
        }
        const nativeId = utools.getNativeId();
        for (const doc of utools.db.allDocs(CODE_PREFIX)) {
            const payload = doc.data;
            if(payload.nativeId){
                if(payload.nativeId !== nativeId){
                    continue;
                }
            }
            if(payload.count == null){
                payload.count = 0;
            }
            if(payload.createTime == null){
                payload.createTime = Date.now();
            }
            this.rootSnippetMap.set(payload.id, payload)
        }
        console.log('codeSnippetManager init, and size is '+this.rootSnippetMap.size)
        this.isInited = true;
    },
    prepareForPrefixSnippetMap(prefix){
        if(this.snippetKey === prefix){
            return;
        }
        this.snippetKey = prefix;
        this.snippetMap = new Map();
        for (const doc of utools.db.allDocs(SUB_CODE_PREFIX+prefix + "#" )) {
            const payload = doc.data;
            if(payload.count == null){
                payload.count = 0;
            }
            if(payload.createTime == null){
                payload.createTime = Date.now();
            }
            this.snippetMap.set(payload.id, payload)
        }
    },
    addTagInfo(payload,flag){
        if(payload.tags != null){
            payload.tags.forEach(t => tagColorManager.add(t))
        }
        if(flag){
            tagColorManager.writeToDB();
        }
    },

    /**
     * @param {CodeSnippet} codeSnippet
     * @param {string | null} [prefix]
     */
    add(codeSnippet,prefix){
        if(codeSnippet.help){
            $message.error("用户无法主动创建内置说明片段")
            return false;
        }
        codeSnippet.id = Date.now().toString();
        codeSnippet.count = codeSnippet.count??0;
        codeSnippet.createTime = Date.now()
        codeSnippet.time = codeSnippet.time??codeSnippet.createTime;
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix);
            this.snippetMap.set(codeSnippet.id,codeSnippet);
            utools_db_store(SUB_CODE_PREFIX+prefix+"#"+codeSnippet.id,codeSnippet)
        }else{
            this.rootSnippetMap.set(codeSnippet.id,codeSnippet);
            utools_db_store(CODE_PREFIX+codeSnippet.id,codeSnippet)
        }
        // keyword
        if(codeSnippet.keyword){
            register_utools_keyword(codeSnippet,prefix)
        }
        this.addTagInfo(codeSnippet,true)
        return true;
    },

    /**
     *
     * @param {string} id
     * @param {string | null} prefix
     */
    del(id,prefix){
        let snippet = null;
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix);
            snippet = this.snippetMap.get(id);
            if(snippet){
                utools.db.remove(SUB_CODE_PREFIX+prefix+"#"+id)
                this.snippetMap.delete(id)
            }
        }else{
            // 先查询是否存在
            snippet= this.rootSnippetMap.get(id);
            if(snippet){
                utools.db.remove(CODE_PREFIX+id)
                this.rootSnippetMap.delete(id)
            }
        }
        if(snippet){
            // delete current keyword
            if(snippet.keyword){
                delete_utools_keyword(snippet,prefix)
            }
            if(snippet.dir){
                // delete sub snippets keyword
                batch_delete_utools_keyword(prefix ? (prefix+'/'+id) : id)
            }
        }


    },
    /**
     *
     * @param {string} name
     * @return {boolean}
     * @param {string | null} prefix
     */
    contain(name,prefix){
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix)
            for (const snippet of this.snippetMap.values()) {
                if(snippet.name === name){
                    return true
                }
            }
        }else{
            for (const snippet of this.rootSnippetMap.values()) {
                if(snippet.name === name){
                    return true
                }
            }
        }
        return false
    },
    /**
     *
     * @param { CodeSnippet } codeSnippet
     * @param {string | null} prefix
     */
    update(codeSnippet,prefix){
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix)
            if(this.snippetMap.has(codeSnippet.id)) {
                utools_db_store(SUB_CODE_PREFIX+prefix+"#"+codeSnippet.id, codeSnippet)
                this.snippetMap.set(codeSnippet.id, codeSnippet)
                this.addTagInfo(codeSnippet, true)
                if(codeSnippet.keyword){
                    register_utools_keyword(codeSnippet,prefix)
                }else{
                    delete_utools_keyword(codeSnippet,prefix)
                }
            }
        }else{
            if(this.rootSnippetMap.has(codeSnippet.id)) {
                utools_db_store(CODE_PREFIX + codeSnippet.id, codeSnippet)
                this.rootSnippetMap.set(codeSnippet.id, codeSnippet)
                this.addTagInfo(codeSnippet, true)
                if(codeSnippet.keyword){
                    register_utools_keyword(codeSnippet,prefix)
                }else{
                    delete_utools_keyword(codeSnippet,prefix)
                }
            }
        }
    },
    /**
     * 指定目录层级搜索
     * @param {string | null} name
     * @param {string | null} prefix
     * @return {CodeSnippet[]}
     */
    queryForMany(name,prefix){
        let map =  this.rootSnippetMap;
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix)
            map = this.snippetMap;
        }
        /**
         * @type {CodeSnippet[]}
         */
        let list = [];
        const betaDescSearch = !configManager.get('beta_wide_desc_close');
        const betaContentSearchClose = configManager.get('beta_wide_content_close');
        const betaSearch = configManager.get('beta_wide_snippet_search') && (betaDescSearch || !betaContentSearchClose);
        if(name){
            for (const codeSnippet of map.values()) {
                const result = match(name,codeSnippet.name)
                if(result !== null){
                    codeSnippet.temp = result;
                    codeSnippet.matchType = undefined;
                    list.push(codeSnippet)
                } else if(betaSearch){
                    // desc
                    if(betaDescSearch && codeSnippet.desc){
                        if(codeSnippet.desc.toLowerCase().includes(name)){
                            codeSnippet.matchType = 1;
                            list.push(codeSnippet)
                            continue
                        }
                    }
                    // pass
                    if(betaContentSearchClose || codeSnippet.dir || codeSnippet.path || codeSnippet.link){
                        continue;
                    }
                    // code 💛
                    if(codeSnippet.code && codeSnippet.code.toLowerCase().includes(name)){
                        codeSnippet.matchType = 2;
                        list.push(codeSnippet)
                    }
                }
            }
        }else{
            for (let codeSnippet of map.values()) {
                codeSnippet.temp = undefined;
                codeSnippet.matchType = undefined;
                list.push(codeSnippet)
            }
        }
        // 进行排序处理
        return list;
    },
    deepQuery(name){
        // first root
        const list = [];
        const betaDescSearch = !configManager.get('beta_wide_desc_close');
        const betaContentSearchClose = configManager.get('beta_wide_content_close');
        const betaSearch = configManager.get('beta_wide_snippet_search') && (betaDescSearch || !betaContentSearchClose);
        for (const codeSnippet of this.rootSnippetMap.values()) {
            if(!codeSnippet.dir && match(name,codeSnippet.name) !== null){
                codeSnippet.matchType = undefined;
                list.push(codeSnippet)
            }else if(betaSearch){
                // desc
                if(betaDescSearch && codeSnippet.desc){
                    if(codeSnippet.desc.toLowerCase().includes(name)){
                        codeSnippet.matchType = 1;
                        list.push(codeSnippet)
                        continue
                    }
                }
                // pass
                if(betaContentSearchClose || codeSnippet.dir || codeSnippet.path || codeSnippet.link){
                    continue;
                }
                // code 💛
                if(codeSnippet.code && codeSnippet.code.toLowerCase().includes(name)){
                    codeSnippet.matchType = 2;
                    list.push(codeSnippet)
                }
            }
        }
        // then sub
        for (const doc of utools.db.allDocs(SUB_CODE_PREFIX)) {
            const snippet = doc.data;
            if(!snippet.dir && match(name,snippet.name) !== null){
                snippet.matchType = undefined;
                list.push(snippet)
            }else if(betaSearch){
                // desc
                if(betaDescSearch && snippet.desc){
                    if(snippet.desc.toLowerCase().includes(name)){
                        snippet.matchType = 1;
                        list.push(snippet)
                        continue
                    }
                }
                // pass
                if(betaContentSearchClose || snippet.dir || snippet.path || snippet.link){
                    continue;
                }
                // code 💛
                if(snippet.code && snippet.code.toLowerCase().includes(name)){
                    snippet.matchType = 2;
                    list.push(snippet)
                }
            }
        }
        return list

    },

    backup(zip,dirname){
        let count = 0;
        for (const doc of utools.db.allDocs(CODE_PREFIX)) {
            if(doc.data.ref === "custom"){
                if(!doc.data.path.startsWith("plugin://")){
                    try{
                        zip.file(`${dirname}/custom/${count}.custom.js`,window.preload.readFile(doc.data.path).toString())
                    }catch (_){}
                }
            }
            zip.file(`${dirname}/${count}.json`,JSON.stringify({
                data: doc.data,
                _id: doc._id,
                count: count
            }))
            count++;
        }
        for (const doc of utools.db.allDocs(SUB_CODE_PREFIX)) {
            zip.file(`${dirname}/${count++}.json`,JSON.stringify({
                data: doc.data,
                _id: doc._id
            }))
        }
    },
    async load(zip,dirname){
        try{
            const zipItems = zip.file(new RegExp('^'+dirname+'/.+\\.json$'))
            for (const item of zipItems){
                if(item.dir){
                    continue;
                }
                const obj = JSON.parse(await item.async("string"))
                if(obj._id && obj.data){
                    if(obj.data.ref === "custom"){
                        if(!obj.data.path.startsWith("plugin://")){
                            const customJSZip = zip.file(`${dirname}/custom/${obj.count}.custom.js`)
                            if(customJSZip){
                                try{
                                    // 写入文件
                                    obj.data.path = window.preload.writeConfigFile(localConfigDirPath,`./${obj.count}.custom.js`,await customJSZip.async("string"))
                                }catch (_){
                                    obj.data.path = "not found"
                                }
                            }
                        }
                    }
                    // 注册关键字
                    if(obj.data.keyword){
                        if(obj._id.startsWith(CODE_PREFIX)){
                            const id = obj._id.slice(CODE_PREFIX.length)
                            register_utools_keyword(obj.data,obj._id.slice(CODE_PREFIX.length))
                        }else if(obj._id.startsWith(SUB_CODE_PREFIX)){
                            register_utools_keyword(obj.data,obj._id.slice(SUB_CODE_PREFIX.length))
                        }else{
                            obj.data.keyword = undefined;
                        }
                    }
                    utools_db_store(obj._id,obj.data)
                }
            }
        }catch (e){
            utools.showNotification(`解析${dirname}目录内容时发生异常，原因为${e.message}`)
        }
    },
    /**
     * @param {string} id
     * @param {string | null} prefix
     * @return {undefined}
     */
    get(id, prefix) {
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix)
            return this.snippetMap.get(id)
        }else{
            return this.rootSnippetMap.get(id)
        }
    }
}