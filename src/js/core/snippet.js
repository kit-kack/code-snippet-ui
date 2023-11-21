import {defaultHelpSnippet} from "../some";
import {match} from "../utils/fuzzy";
import {createOrUpdate, remove_utools_feature} from "./base";
import {tagColorManager} from "./tag";
import {configManager} from "./config";
import {formatManager} from "./func";
import {convertValidFileSuffix} from "../utils/language";
import JSZip from "jszip";

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
        for (const doc of utools.db.allDocs(CODE_PREFIX)) {
            const payload = doc.data;
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
        codeSnippet.id = Date.now();
        codeSnippet.count = codeSnippet.count??0;
        codeSnippet.createTime = Date.now()
        codeSnippet.time = codeSnippet.time??codeSnippet.createTime;
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix);
            this.snippetMap.set(codeSnippet.id,codeSnippet);
            createOrUpdate(SUB_CODE_PREFIX+prefix+"#"+codeSnippet.id,codeSnippet)
        }else{
            this.rootSnippetMap.set(codeSnippet.id,codeSnippet);
            createOrUpdate(CODE_PREFIX+codeSnippet.id,codeSnippet)
        }
        this.addTagInfo(codeSnippet,true)
        return true;
    },

    /**
     *
     * @param {string} id
     * @param {string | null} prefix
     * @returns {boolean} - is success
     */
    del(id,prefix){
        if(id === defaultHelpSnippet.id){
            configManager.set('readme_close',true)
            return true;
        }
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix);
            const codeSnippet = this.snippetMap.get(id);
            if(codeSnippet){
                utools.db.remove(SUB_CODE_PREFIX+prefix+"#"+codeSnippet.id)
                this.snippetMap.delete(id)
                return true;
            }
        }else{
            // 先查询是否存在
            const codeSnippet = this.rootSnippetMap.get(id);
            if(codeSnippet){
                utools.db.remove(CODE_PREFIX+id)
                this.rootSnippetMap.delete(id)
                if(codeSnippet.feature){
                    remove_utools_feature(codeSnippet.name)
                }
                return true;
            }
        }
        return false;

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
     * @return {boolean} - is success
     */
    update(codeSnippet,prefix){
        if(prefix){
            this.prepareForPrefixSnippetMap(prefix)
            if(this.snippetMap.has(codeSnippet.id)) {
                createOrUpdate(SUB_CODE_PREFIX+prefix+"#"+codeSnippet.id, codeSnippet)
                this.snippetMap.set(codeSnippet.id, codeSnippet)
                this.addTagInfo(codeSnippet, true)
                return true;
            }
        }else{
            if(this.rootSnippetMap.has(codeSnippet.id)) {
                createOrUpdate(CODE_PREFIX + codeSnippet.id, codeSnippet)
                this.rootSnippetMap.set(codeSnippet.id, codeSnippet)
                this.addTagInfo(codeSnippet, true)
                return true;
            }
        }
        return false;
    },
    /**
     * 满足多种查询要求
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
        // 1.name
        if(name !== null){
            for (const codeSnippet of map.values()) {
                const result = match(name,codeSnippet.name)
                if(result !== null){
                    codeSnippet.temp = result;
                    list.push(codeSnippet)
                }
            }
        }else{
            for (let codeSnippet of map.values()) {
                codeSnippet.temp = undefined;
                list.push(codeSnippet)
            }
        }
        // 进行排序处理
        return list;
    },
    store(path){
        // - code-snippet-data.json
        // - code-snippet-tag.json
        // - code-snippet-func.json
        // - data
        // - data / README.md,...
        const zip = new JSZip();
        zip.file("code-snippet-tag.json",JSON.stringify({
            tags: tagColorManager.tags
        }))
        zip.file("code-snippet-func.json",JSON.stringify({
            funcs: formatManager.funcMap
        }))
        const snippets = [];
        // snippet
        for (let codeSnippet of this.rootSnippetMap.values()) {
            const snippet = {...codeSnippet};
            if(snippet.code){
                const path = `code/${snippet.name}.${convertValidFileSuffix(snippet.type??'txt')}`
                zip.file(path,snippet.code)
                snippet.code = path;
            }
            delete snippet.id;
            // TODO 置顶处理
            // if(configManager.getTopList().includes(codeSnippet.id)){
            //     snippets.top = true;
            // }
            snippets.push(snippet)
        }
        zip.file("code-snippet-data.json",JSON.stringify({
            snippets: snippets
        }))
        window.preload.generateZip(zip,path);

    },
    async load(path){
        const repeatCodeSnippets = [];
        const data = window.preload.readFile(path);
        const zip = await JSZip.loadAsync(data);
        // data
        try{
            const obj = JSON.parse(await zip.file("code-snippet-data.json").async("string"))
            let count = 0;
            if(obj && obj.snippets && Array.isArray(obj.snippets)){
                for (const snippet of obj.snippets) {
                    if(snippet.code){
                        snippet.code = await zip.file(snippet.code).async('string');
                    }
                    if(this.contain(snippet.name)){
                        repeatCodeSnippets.push(snippet)
                    }else{
                        count++;
                        // TODO:置顶处理
                        this.add(snippet)
                        // if(this.add(snippet) && snippet.top){
                        //     configManager.addTopItem(snippet.id)
                        // }
                    }
                }
            }
            utools.showNotification('共成功导入'+count+'条数据')
        }catch (e){
            utools.showNotification("解析code-snippet-data.json及相关data时发生异常，原因为"+e.message)
        }
        // tag
        try{
            const obj = JSON.parse(await zip.file("code-snippet-tag.json").async("string"))
            if(obj && obj.tags){
                for (const tag in obj.tags) {
                    tagColorManager.tags[tag] = obj.tags[tag]
                }
                tagColorManager.writeToDB()
            }
        }catch (e){
            utools.showNotification("解析code-snippet-tag.json时发生异常，原因为"+e.message)
        }
        // func
        try{
            const obj = JSON.parse(await zip.file("code-snippet-func.json").async("string"))
            if(obj && obj.funcs){
                for (const func in obj.funcs) {
                    formatManager.funcMap[func] = obj.funcs[func]
                }
                createOrUpdate(GLOBAL_FUNC,formatManager.funcMap)
            }
        }catch (e){
            utools.showNotification("解析code-snippet-func.json时发生异常，原因为"+e.message)
        }
        if(repeatCodeSnippets.length > 0){
            $dialog.info({
                title: '重复代码片段×'+repeatCodeSnippets.length,
                content: '由于代码片段名不允许重复，所以请您选择下面对应操作',
                positiveText: '全部覆盖',
                negativeText: '全部丢弃',
                onPositiveClick: ()=>{
                    for (let snippet of repeatCodeSnippets) {
                        // TODO 置顶处理
                        this.add(snippet)
                        // if(this.add(snippet) && snippet.top){
                        //     configManager.addTopItem(snippet.id)
                        // }
                    }
                }
            })
        }
    },
    empty() {
        for (let id of this.rootSnippetMap.keys()) {
            this.del(id,null)
        }
    },
    getByName(name) {
        for (let codeSnippet of this.rootSnippetMap.values()) {
            if(codeSnippet.name === name){
                return codeSnippet;
            }
        }
        return null;
    }
}