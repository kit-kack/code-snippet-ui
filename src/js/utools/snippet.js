import {defaultHelpSnippet, localConfigDirPath} from "../some";
import {match} from "../utils/fuzzy";
import {utools_db_store} from "./base";
import {tagColorManager} from "./tag";
import {batch_delete_utools_keyword, delete_utools_keyword, register_utools_keyword} from "./keyword";
import {configManager} from "./config";
import {hierachyHubManager} from "./hub";
import {$reactive} from "../store";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";

export const CODE_PREFIX = "code/";
const SUB_CODE_PREFIX = "#code/"
const GLOBAL_FUNC = "func";
export const codeSnippetManager = {
    // Code Snippet Map (key is its id)
    /**
     * @type {Map<string, CodeSnippet>}
     */
    rootSnippetMap: new Map(),
    /**
     * @type {Map<string, CodeSnippet>}
     */
    snippetMap: null,
    /**
     * @type {Map<string, CodeSnippet>}
     */
    recycleRootSnippetMap: new Map(),
    /**
     * @type {Map<string, CodeSnippet>}
     */
    recycleSnippetMap: null,
    snippetKey: null,
    isInited: false,

    init() {
        if (this.isInited) {
            return;
        }
        hierachyHubManager.init();
        this.loadingData(null);
        console.log('codeSnippetManager init, and size is '+this.rootSnippetMap.size)
        this.isInited = true;
    },
    loadingData(prefix) {
        const {map,recycleMap} = this._getMaps(prefix);
        const nativeId = utools.getNativeId();
        const now = Date.now();
        const recycleBin = hierachyHubManager.currentHub.recycleBin;
        const utoolsDocPrefix = prefix ? (SUB_CODE_PREFIX+prefix + "#" ) : CODE_PREFIX;
        for (const doc of utools.db.allDocs(utoolsDocPrefix)) {
            /**
             * @type {CodeSnippet}
             */
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
            // compare recycle
            const key = payload.id ?? payload.name;
            if(recycleBin && key in recycleBin){
                // first add recycleMap
                recycleMap.set(key,payload)
                if(recycleBin[key].expired < now){
                    // remove snippet
                    GLOBAL_HIERARCHY.remove(payload,true)
                }
            }else{
                map.set(payload.id, payload)
            }
        }
    },
    prepareForPrefixSnippetMap(prefix){
        if(this.snippetKey === prefix){
            return;
        }
        this.snippetKey = prefix;
        this.snippetMap = new Map();
        this.recycleSnippetMap = new Map();
        this.loadingData(prefix);
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
     *
     * @param {string | null} prefix
     * @private
     * @return {{recycleMap: Map<string, CodeSnippet>, map: Map<string, CodeSnippet>}}
     */
    _getMaps(prefix){
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix)
            return {
                map: this.snippetMap,
                recycleMap: this.recycleSnippetMap
            }
        }
        return {
            map: this.rootSnippetMap,
            recycleMap: this.recycleRootSnippetMap
        }
    },
    /**
     * 在已经切换完毕的场景下使用
     * @param {CodeSnippet} snippet
     * @param {string | null} prefix
     * @private
     * @param {boolean} deleteMode
     * @param {boolean} recycleMode
     */
    _updateKeywordAndDatabase(snippet, prefix,deleteMode = false,recycleMode = false) {
        // editor
        // if(configManager.get('beta_special_tag')){
        //     SPECIAL_TAG_HANDLER.accept(snippet,(!deleteMode && !recycleMode))
        // }
        // keyword
        if(deleteMode){
            // delete current keyword
            if(snippet.keyword){
                delete_utools_keyword(snippet,prefix)
            }
            if(snippet.dir){
                // delete sub snippets keyword
                batch_delete_utools_keyword(prefix ? (prefix+'/'+snippet.id) : snippet.id)
            }
        }else if(snippet.keyword){
            register_utools_keyword(snippet,prefix);
        }else{
            delete_utools_keyword(snippet,prefix);
        }
        const path = prefix ? (SUB_CODE_PREFIX+prefix+"#"+snippet.id) : (CODE_PREFIX + snippet.id);
        if(deleteMode){
            utools.db.remove(path)
        }else{
            utools_db_store(path,snippet)
        }
    },

    /**
     * @param {CodeSnippet} codeSnippet
     * @param {string | null} [prefix]
     */
    async add(codeSnippet,prefix){
        if(codeSnippet.help){
            $message.error("用户无法主动创建内置说明片段")
            return false;
        }
        if(!$reactive.main.isRecycleConflict){
            // 恢复冲突场景
            codeSnippet.id = Date.now().toString();
            codeSnippet.count = codeSnippet.count??0;
            codeSnippet.createTime = Date.now()
            codeSnippet.time = codeSnippet.time??codeSnippet.createTime;
        }
        await this.uploadImage(codeSnippet);
        const { map,recycleMap} = this._getMaps(prefix);
        map.set(codeSnippet.id,codeSnippet);
        if($reactive.main.isRecycleConflict){
            // delete recyle
            recycleMap.delete(codeSnippet.id);
            hierachyHubManager.resumeElement(codeSnippet.id,true);
            $reactive.main.isRecycleBinActive = false;
        }
        this.addTagInfo(codeSnippet,true)
        // save
        this._updateKeywordAndDatabase(codeSnippet,prefix);
        return true;
    },

    /**
     *
     * @param {string} id
     * @param {string | null} prefix
     */
    del(id,prefix){
        if(id === defaultHelpSnippet.id){
            configManager.set('readme_close',true)
            return;
        }
        const {recycleMap} = this._getMaps(prefix);
        const snippet = recycleMap.get(id);
        if(!snippet){
            return;
        }
        this.removeImage(snippet);
        recycleMap.delete(id);
        this._updateKeywordAndDatabase(snippet,prefix,true);
    },
    /**
     *
     * @param {string} name
     * @return {boolean}
     * @param {string | null} prefix
     */
    contain(name,prefix){
        const {map} = this._getMaps(prefix);
        for (const snippet of map.values()) {
            if(snippet.name === name){
                return true
            }
        }
        return false;
    },
    /**
     * @param {CodeSnippet} snippet
     */
    async uploadImage(snippet){
        if(snippet.imgUrl){
            // upload
            const type = snippet.format ?? 'image/png';
            const id = 'attachment/'+Date.now() ;
            let result;
            if(snippet.nativeImage){
                result = utools.db.postAttachment(id,snippet.nativeImage.toPNG(),type)
            }else if(snippet.imageItem){
                console.log(snippet.imageItem)
                let data = await snippet.imageItem.arrayBuffer();
                result = utools.db.postAttachment(id, data,type)
                data = null;
            }else {
                throw "图片资源获取失败"
            }
            if(result.ok){
                this.removeImage(snippet);
                snippet.nativeImage = undefined;
                snippet.imgUrl  = undefined;
                snippet.imgId = id;
                snippet.format = undefined;
                snippet.imageItem = undefined;
            }else{
                // throw "图片体积过大，超过1M限制，保存失败！";
                throw  result.message;
            }
        }
    },
    removeImage(snippet){
      if(snippet.image && snippet.imgId){
        utools.db.remove(snippet.imgId);
        snippet.imgId = undefined;
        snippet.image = undefined;
      }
    },

    /**
     *
     * @param { CodeSnippet } codeSnippet
     * @param {string | null} prefix
     */
    async update(codeSnippet,prefix){
        const {map} = this._getMaps(prefix);
        if(map.has(codeSnippet.id)){
            await this.uploadImage(codeSnippet)
            map.set(codeSnippet.id,codeSnippet)
            this.addTagInfo(codeSnippet, true)
            this._updateKeywordAndDatabase(codeSnippet,prefix);
            return
        }
        throw "找不到对应的代码片段"
    },
    /**
     * 指定目录层级搜索
     * @param {string | null} name
     * @param {string | null} prefix
     * @return {CodeSnippet[]}
     */
    queryForMany(name,prefix){
        const entry= this._getMaps(prefix);
        let map = entry.map;
        if($reactive.main.isRecycleBinActive){
            map = entry.recycleMap
            // 过期判断
            const recycleBin = hierachyHubManager.currentHub.recycleBin;
            if(recycleBin && Object.keys(recycleBin).length > 0){
                const now = Date.now();
                let delFlag = false;
                for (const id in recycleBin) {
                    const snippet = map.get(id);
                    snippet.expired = recycleBin[id].expired - now;
                    if(snippet.expired < 0){
                        // 删除元素
                        delFlag = true;
                        delete recycleBin[id];
                        const snippet = map.get(id)
                        if(snippet){
                            GLOBAL_HIERARCHY.remove(snippet,true)
                        }
                    }
                }
                if(delFlag){
                    hierachyHubManager.store();
                }
            }

        }
        /**
         * @type {CodeSnippet[]}
         */
        let list = [];
        const betaDescSearch = !configManager.get('beta_wide_desc_close');
        const betaContentSearchClose = configManager.get('beta_wide_content_close');
        const betaSearch = (betaDescSearch || !betaContentSearchClose);
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
                        const index = codeSnippet.desc.toLowerCase().indexOf(name);
                        if(index !== -1){
                            codeSnippet.matchType = 1;
                            codeSnippet.temp = codeSnippet.desc.slice(0,index) + '<b>' + codeSnippet.desc.slice(index,index+name.length) + '</b>' + codeSnippet.desc.slice(index+name.length);
                            list.push(codeSnippet);
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
    /**
     * 恢复
     * @param {string | null} prefix
     * @param {string} id
     * @param {boolean | undefined} keywordFlag
     * @return {boolean} 是否成功恢复，如果返回false则恢复冲突，需要在编辑页面进行编辑
     */
    resume(id,prefix,keywordFlag){
        const {map,recycleMap} = this._getMaps(prefix);
        const snippet = recycleMap.get(id);
        if(snippet){
            if(keywordFlag){
                snippet.keyword = true;
            }
            if(this.contain(snippet.name,prefix)){
                return false;
            }
            delete snippet.expired;
            if(keywordFlag){
                this._updateKeywordAndDatabase(snippet,prefix,false);
            }
            map.set(id,snippet);
            recycleMap.delete(id);
        }
        return true;
    },
    /**
     * 回收
     * @param {string | null} prefix
     * @param {string} id
     */
    recycle(id,prefix){
        const {map,recycleMap} = this._getMaps(prefix);
        const snippet = map.get(id)
        let keywordFlag = false;
        if(snippet){
            if(snippet.keyword){
                keywordFlag = true;
                delete snippet.keyword;
                this._updateKeywordAndDatabase(snippet,prefix,false,true);
            }
            recycleMap.set(id,snippet);
            map.delete(id);
        }
        return keywordFlag;
    },

    deepQuery(name){
        // first root
        const list = [];
        const betaDescSearch = !configManager.get('beta_wide_desc_close');
        const betaContentSearchClose = configManager.get('beta_wide_content_close');
        const betaSearch = (betaDescSearch || !betaContentSearchClose);
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
            }else if(doc.data.image){
                try{

                    zip.file(`${dirname}/image/${count}.image.png`,utools.db.getAttachment(doc.data.imgId))
                }catch (_){}
            }
            zip.file(`${dirname}/${count}.json`,JSON.stringify({
                data: doc.data,
                _id: doc._id,
                count: count
            }))
            count++;
        }
        for (const doc of utools.db.allDocs(SUB_CODE_PREFIX)) {
            if(doc.data.image){
                try{

                    zip.file(`${dirname}/image/${count}.image.png`,utools.db.getAttachment(doc.data.imgId))
                }catch (_){}
            }
            zip.file(`${dirname}/${count}.json`,JSON.stringify({
                data: doc.data,
                _id: doc._id,
                count: count
            }))
            count++;
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
                    if(obj.data.image){
                        const imageZip = zip.file(`${dirname}/image/${obj.count}.image.png`)
                        if(imageZip){
                            try{
                                const attachment = utools.db.getAttachment(obj.data.imgId);
                                if(attachment){
                                    utools.db.remove(obj.data.imgId);
                                }
                                utools.db.postAttachment(obj.data.imgId, await imageZip.async("uint8array"),"image/png");
                            }catch (_){}
                        }
                    }
                    // 注册关键字
                    if(obj.data.keyword){
                        if(obj._id.startsWith(CODE_PREFIX)){
                            register_utools_keyword(obj.data,null)
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