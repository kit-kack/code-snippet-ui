import {nanoid} from "nanoid";
import {defaultHelpSnippet} from "../some";
import {fuzzyCompare, match} from "../utils/fuzzy";
import {
    CODE_PREFIX,
    createOrUpdate,
    CS_CODE_ID,
    CS_DOC_ID,
    CS_MARK_ID,
    CS_ROOT_ID,
    getDBItem,
    GLOBAL_FUNC,
    GLOBAL_ROOT_TAGS,
    removeDBItem
} from "./base";
import {tagColorManager} from "./tag";
import {configManager} from "./config";
import {formatManager} from "./func";
import {convertValidFileSuffix, fullAlias} from "../utils/language";
import {lowercaseIncludes} from "../utils/common";
import {utools_feature_del} from "../utils/feature";
import JSZip from "jszip";


export const codeSnippetManager = {
    // Code Snippet Map (key is its id)
    codeMap: new Map(),
    isInited: false,

    init() {
        if (this.isInited) {
            return;
        }
        // 读取标签数据
        let data = getDBItem(CS_ROOT_ID);
        if(data != null){
            // 旧版本过渡(v2)
            let list = data.split('\0');
            if (data[0] === '\0') {
                list.shift()
            }
            // 初始化所有值
            for (const name of list) {
                let payload = {};
                // 兼容操作，逐渐舍弃原标志
                let code = getDBItem(CS_MARK_ID + name);
                if (code != null) {  // v1
                    payload.name = name;
                    payload.code = code;
                    // refactor: id
                    payload.id = nanoid();
                    removeDBItem(CS_MARK_ID + name)
                    let doc = getDBItem(CS_DOC_ID + name)
                    if (doc != null) {
                        payload.desc = doc;
                        removeDBItem(CS_DOC_ID + name)
                    }
                    // 标签处理
                    this.addTagInfo(payload)
                    // 设置 新标签
                    createOrUpdate(CODE_PREFIX+payload.id,payload)
                } else {    // v2
                    payload = JSON.parse(getDBItem(CS_CODE_ID + name));
                    if(payload != null){
                        // refactor: id
                        payload.id = nanoid();
                        // 标签处理
                        this.addTagInfo(payload)
                        // 移除旧标签，转移到新标签
                        createOrUpdate(CODE_PREFIX+payload.id,payload)
                        removeDBItem(CS_CODE_ID+name)
                    }else{
                        payload = utools.db.get("code#"+name).data;
                        // refactor: id
                        payload.id = nanoid();
                        payload.createTime = Date.now();
                        createOrUpdate(CODE_PREFIX+payload.id,payload)
                        removeDBItem("code#"+name);
                    }
                }
                if (payload.count == null) {
                    payload.count = 0;
                }
                this.codeMap.set(payload.id, payload)
                // 新版本过渡
                removeDBItem(CS_ROOT_ID)
                tagColorManager.writeToDB();
            }
        }else{
            data = utools.db.get(GLOBAL_ROOT_TAGS)?.data;
            // 保持原有顺序
            let time = 100;
            if( data != null){// v2
                for (let name of data) {
                    let payload = utools.db.get("code#"+name).data;
                    if (payload.count == null) {
                        payload.count = 0;
                    }
                    delete payload.query;
                    // refactor: id
                    payload.id = nanoid();
                    payload.createTime = time;
                    removeDBItem("code#"+name)
                    createOrUpdate(CODE_PREFIX+payload.id,payload)

                    this.codeMap.set(payload.id, payload)
                    time+=100;
                }
                removeDBItem(GLOBAL_ROOT_TAGS)
            }else{ // new version
                for (const doc of utools.db.allDocs(CODE_PREFIX)) {
                    const payload = doc.data;
                    if(payload.count == null){
                        payload.count = 0;
                    }
                    if(payload.createTime == null){
                        payload.createTime = Date.now();
                    }
                    this.codeMap.set(payload.id, payload)
                }
            }
        }
        console.log('codeSnippetManager init, and size is '+this.codeMap.size)
        this.isInited = true;
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
     */
    add(codeSnippet){
        if(codeSnippet.help){
            $message.error("用户无法主动创建内置说明片段")
            return false;
        }
        codeSnippet.id = nanoid();
        codeSnippet.count = codeSnippet.count??0;
        codeSnippet.createTime = Date.now()
        codeSnippet.time = codeSnippet.time??codeSnippet.createTime;
        this.codeMap.set(codeSnippet.id,codeSnippet);
        createOrUpdate(CODE_PREFIX+codeSnippet.id,codeSnippet)
        this.addTagInfo(codeSnippet,true)
        console.log('now code snippet size: '+this.codeMap.size)
        return true;
    },

    /**
     *
     * @param {string} id
     * @returns {boolean} - is success
     */
    del(id){
        if(id === defaultHelpSnippet.id){
            configManager.set('closeHelpSnippet',true)
            return true;
        }
        // 先查询是否存在
        const codeSnippet = this.codeMap.get(id);
        if(codeSnippet){
            utools.db.remove(CODE_PREFIX+id)
            this.codeMap.delete(id)
            if(codeSnippet.feature){
                utools_feature_del(codeSnippet.name)
            }
            // 处理 topList
            let index = configManager.getTopList().indexOf(id)
            if(index !== -1){
                configManager.delTopItem(index)
            }
            return true;
        }
        return false;

    },
    /**
     *
     * @param {string} id
     * @return {CodeSnippet}
     */
    get(id){
        if(id === defaultHelpSnippet.id){
            return defaultHelpSnippet;
        }
        return this.codeMap.get(id);
    },

    /**
     *
     * @param {string} name
     * @return {boolean}
     */
    contain(name){
        for (const snippet of this.codeMap.values()) {
            if(snippet.name === name){
                return true
            }
        }
        return false
    },
    /**
     *
     * @param { CodeSnippet } codeSnippet
     * @return {boolean} - is success
     */
    update(codeSnippet){
        // 先查询是否存在
        if(this.codeMap.has(codeSnippet.id)){
            createOrUpdate(CODE_PREFIX+codeSnippet.id,codeSnippet)
            this.codeMap.set(codeSnippet.id,codeSnippet)
            this.addTagInfo(codeSnippet,true)
            return true;
        }else{
            return false;
        }
    },
    /**
     * 满足多种查询要求
     * @param {string | null} name
     * @param {string[] | null} tags
     * @param {string | null} type
     * @return {CodeSnippet[]}
     */
    queryForMany(name,tags,type){
        /**
         * @type {CodeSnippet[]}
         */
        let list = [];
        // 1.name
        if(name !== null){
            for (const codeSnippet of this.codeMap.values()) {
                const result = match(name,codeSnippet.name)
                if(result !== null){
                    codeSnippet.temp = result;
                    list.push(codeSnippet)
                }
            }
        }else{
            for (let codeSnippet of this.codeMap.values()) {
                codeSnippet.temp = undefined;
                list.push(codeSnippet)
            }
        }
        // 2.tags
        if(tags !== null && tags.length > 0){
            tags = tags.map(value => value.toLowerCase())
            list = list.filter(codeSnippet=>{
                if(codeSnippet.tags == null){
                    return false;
                }
                for(const tag of tags){
                    if(lowercaseIncludes(codeSnippet.tags,tag)){
                        return true;
                    }
                }
                return false;
            })
        }
        // 3.type
        if(type !== null){
            type = fullAlias(type.toLowerCase());
            list = list.filter(codeSnippet=>fullAlias(codeSnippet.type) === type)
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
        for (let codeSnippet of this.codeMap.values()) {
            const snippet = {...codeSnippet};
            if(snippet.code){
                const path = `code/${snippet.name}.${convertValidFileSuffix(snippet.type??'txt')}`
                zip.file(path,snippet.code)
                snippet.code = path;
            }
            delete snippet.id;
            if(configManager.getTopList().includes(codeSnippet.id)){
                snippets.top = true;
            }
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
                        if(this.add(snippet) && snippet.top){
                            configManager.addTopItem(snippet.id)
                        }
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
                        if(this.add(snippet) && snippet.top){
                            configManager.addTopItem(snippet.id)
                        }
                    }
                }
            })
        }
    },
    empty() {
        for (let id of this.codeMap.keys()) {
            this.del(id)
        }
    },
    getByName(name) {
        for (let codeSnippet of this.codeMap.values()) {
            if(codeSnippet.name === name){
                return codeSnippet;
            }
        }
        return null;
    }
}