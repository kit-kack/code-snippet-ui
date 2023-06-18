// 全局便利常量和函数

const utools = window.utools;
const setDBItem = utools.dbStorage.setItem
const getDBItem = utools.dbStorage.getItem
const removeDBItem = utools.dbStorage.removeItem

// 新版存储 键前缀
const CODE_PREFIX = "code#";
const GLOBAL_ROOT_TAGS = "root";
const GLOBAL_TAGS = "tags";
const GLOBAL_CONFIG = "config"


// 存入数据库的 键前缀 旧版本标记，兼容性，后续版本可能会被移除
const CS_ROOT_ID = "#kitkack.code-snippet-root#"; // 存储所有标签的键
const CS_CONFIG_ID = "#kitkack.code-snippet-config#"  // 配置项前缀
const CS_CODE_ID = "#kitkack.code-snippet-code#";  // 新版标记
const CS_HISTORY_ID = "#kitkack.code-snippet-history#"; // 历史记录（新版本未使用到）
const CS_TAG_COLOR_ID = "#kitkack.code-snippet-tag-color#"; // 标签颜色
// 旧版本标记，兼容性，后续版本可能会被移除
const CS_MARK_ID = "#kitkack.code-snippet#";      // 标签及代码片段部分前缀
const CS_DOC_ID = "#kitkack.code-snippet-doc#";   // 描述部分前缀


const funcUtils = {
    createOrUpdate(key,value){
        let result = utools.db.get(key)
        if(result == null){
            utools.db.put({
                _id: key,
                data: value
            })
        }else{
            utools.db.put({
                _id: key,
                data: value,
                _rev: result._rev
            })
        }
    },
    jsonToMap(jsonStr) {
         return new Map(JSON.parse(jsonStr));
    },
    /**
     *
     * @param {string[]} lines
     * @param {number} cur
     */
    recongzieCodeSnippet(lines,cur){
        const snippet = {};
        snippet.name  =lines[cur].substring(4).trim();
        let str = null;
        while (true){
            cur++;
            if(cur >= lines.length){
                break;
            }
            str = lines[cur].trim();
            if(str === '' || str === '>'){
                continue
            }
            if(str.startsWith('> ')){
                str = str.substring(2).trim();
                if(str===''){
                    continue;
                }
                if(str.startsWith("time:")){
                    let time =  parseInt(str.substring(5).trim());
                    if(!isNaN(time)){
                        snippet.time = time;
                    }
                }else if(str.startsWith("desc:")){
                    snippet.desc = str.substring(5).trim();
                }else if(str.startsWith("count:")){
                    let count =  parseInt(str.substring(6).trim());
                    if(!isNaN(count)){
                        snippet.count = count;
                    }
                }else if(str.startsWith("tags:")){
                    let tags = str.substring(5).trim().split(' ').filter(value => value.length>0);
                    if(tags!=null && tags.length> 0){
                        snippet.tags = tags;
                    }
                }else if(str.startsWith('🔖')){
                    let tags = str.substring(2).trim().split(' ').filter(value => value.length>0);
                    if(tags!=null && tags.length> 0){
                        snippet.tags = tags;
                    }
                }else if(str.startsWith('📢')){
                    snippet.desc = str.substring(2).trim();
                }else if(str.startsWith('⏰')){
                    let time =  parseInt(str.substring(2).trim());
                    if(!isNaN(time)){
                        snippet.time = time;
                    }
                }else if(str.startsWith('🎲')){
                    let count =  parseInt(str.substring(2).trim());
                    if(!isNaN(count)){
                        snippet.count = count;
                    }
                }

            }else{
                let pair = this.recongizeCodeBlock(str);
                if(pair == null){
                    //到达这里表明出现错误 遇到未识别行
                    return`在${cur}行发生解析错误：错误语法行，请符合要求`;
                }
                let code = '';
                cur++;
                while (cur < lines.length){
                    if(lines[cur].trim()===pair.prefix){
                        // successs
                        // 移除最后一个 \n 符号
                        snippet.code = code.substring(0,code.length-1)
                        snippet.type = pair.type??"plaintext";
                        return {
                            cur: cur,
                            snippet:snippet
                        };
                    }else{
                        code+=lines[cur]+"\n";
                    }
                    cur++;
                }
                // 到达这里表明出现错误：代码块没有结束部分
                return `在${cur}行发生解析错误：未扫描到代码块结束部分`;
            }
        }
        // 到达这里 表明出现错误
        return `在${cur}行发生解析错误：未扫描到代码块部分`
    },




    /**
     *
     * @param line
     * @return {{prefix: string, type: string}|{prefix: string, type: null}|null} - prefix对应```数量 type对应语言类型
     */
    recongizeCodeBlock(line){
        let prefix = '';
        let flag2 = false;
        let i;
        for (i = 0; i < line.length; i++) {
            if(flag2){
                if( line[i] !== ' '){
                    break;
                }
            } else if(prefix.length> 2){
                if(line[i] === '`'){
                    prefix+= '`';
                }else if(line[i] === ' '){
                    flag2 = true;
                }else{
                    break;
                }
            }else{
                if(line[i] === '`'){
                    prefix+= '`';
                }else{
                    return null;
                }
            }
        }
        if(i === line.length){
            return {
                prefix: prefix,
                type: null
            }
        }else{
            return {
                prefix: prefix,
                type: line.substring(i)
            }
        }
    },


    /**
     *
     * @param {CodeSnippet[]} list
     * @return {CodeSnippet[]}
     */
    getSortedArray(list){
        // 筛选出 置顶列表中的片段
        let topSnippets = [];
        let topList = configManager.getTopList();
        list = list.filter(snippet =>{
            let index = topList.indexOf(snippet.name);
            if(index === -1){
                return true;
            }else{
                snippet.index = index;
                topSnippets.push(snippet)
                return false;
            }
        })
        // 对 topSnippets进行排序
        topSnippets.sort((a,b)=> a.index - b.index)
        switch (configManager.getSortKey()){
            case 0:   // 创建时间
                break;
            case 1:   // 最近访问时间
                list.sort((a,b)=>{
                    if(a.time == null){
                        return (b.time == null)? a.name.localeCompare(b.name) : 1;
                    }else if(b.time == null){
                        return -1;
                    }else{
                        if( a.time > b.time){
                            return -1;
                        }else if(a.time < b.time){
                            return 1;
                        }else{
                            return a.name.localeCompare(b.name);
                        }
                    }
                })
                break;
            case 2:  // 粘贴使用次数
                list.sort((a,b)=>{
                    if(a.count == null){
                        return (b.count == null)? a.name.localeCompare(b.name) : 1;
                    }else if(b.count == null){
                        return -1;
                    }else{
                        if( a.count > b.count){
                            return -1;
                        }else if(a.count < b.count){
                            return 1;
                        }else{
                            return a.name.localeCompare(b.name);
                        }
                    }
                })
                break;
            default:  // 自然排序
                list.sort((a,b)=>a.name.localeCompare(b.name))
                break;
        }
        return topSnippets.concat(list);
    },
    /**
     *
     * @param {string} name
     */
    getFuzzyQueriedValue(name){
        name = name.trim().toLowerCase();
        let template = '';
        for (let char of name) {
            let ascii = char.charCodeAt(0);
            if((ascii >=20 && ascii <= 47) || (ascii>=58 && ascii<=64) || (ascii>=91 && ascii<=96) || (ascii>=123 && ascii<=126)){
                continue;
            }
            template+=char;
        }
        return template;
    }
}


const codeSnippetManager = {
    // Code Snippet Map (key is its name)
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
                    removeDBItem(CS_MARK_ID + name)
                    let doc = getDBItem(CS_DOC_ID + name)
                    if (doc != null) {
                        payload.desc = doc;
                        removeDBItem(CS_DOC_ID + name)
                    }
                    // 标签处理
                    this.addTagInfo(payload)
                    // 设置 新标签
                    funcUtils.createOrUpdate(CODE_PREFIX+name,payload)
                } else {    // v2
                    payload = JSON.parse(getDBItem(CS_CODE_ID + name));
                    if(payload != null){
                        // 标签处理
                        this.addTagInfo(payload)
                        // 移除旧标签，转移到新标签
                        funcUtils.createOrUpdate(CODE_PREFIX+name,payload)
                        removeDBItem(CS_CODE_ID+name)
                    }else{
                        payload = utools.db.get(CODE_PREFIX+name).data;
                    }
                }
                if (payload.count == null) {
                    payload.count = 0;
                }
                this.codeMap.set(name, payload)
                // 新版本过渡
                removeDBItem(CS_ROOT_ID)
                this.writeToDB();
                tagColorManager.writeToDB();
            }
        }else{
            data = utools.db.get(GLOBAL_ROOT_TAGS)?.data ?? [];
            for (let name of data) {
                let payload = utools.db.get(CODE_PREFIX+name).data;
                if (payload.count == null) {
                    payload.count = 0;
                }
                this.codeMap.set(name, payload)
            }
        }
        console.log('codeSnippetManager init, and size is '+this.codeMap.size)
        this.isInited = true;
    },
    writeToDB(){
        funcUtils.createOrUpdate(GLOBAL_ROOT_TAGS,Array.from(this.codeMap.keys()))
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
        codeSnippet.count = codeSnippet.count??0;
        codeSnippet.time = codeSnippet.time??Date.now();
        this.codeMap.set(codeSnippet.name,codeSnippet);
        funcUtils.createOrUpdate(CODE_PREFIX+codeSnippet.name,codeSnippet)
        this.writeToDB();
        this.addTagInfo(codeSnippet,true)
        console.log('now code snippet size: '+this.codeMap.size)
    },

    /**
     *
     * @param {string} name
     * @returns {boolean} - is success
     */
    del(name){
        // 先查询是否存在
        if(this.codeMap.has(name)){
            utools.db.remove(CODE_PREFIX+name)
            this.codeMap.delete(name)
            this.writeToDB();

            // 处理 topList
            let index = configManager.getTopList().indexOf(name)
            if(index !== -1){
                configManager.delTopItem(index)
            }
            return true;
        }else{
            return false;
        }
    },
    /**
     *
     * @param {string} name
     * @return {CodeSnippet}
     */
    get(name){
        return this.codeMap.get(name);
    },

    /**
     *
     * @param {string} name
     * @return {boolean}
     */
    contain(name){
        return this.codeMap.has(name)
    },
    /**
     *
     * @param { CodeSnippet } codeSnippet
     * @return {boolean} - is success
     */
    update(codeSnippet){
        // 先查询是否存在
        if(this.codeMap.has(codeSnippet.name)){
            funcUtils.createOrUpdate(CODE_PREFIX+codeSnippet.name,codeSnippet)
            this.codeMap.set(codeSnippet.name,codeSnippet)
            console.log(codeSnippet)
            this.addTagInfo(codeSnippet,true)
            return true;
        }else{
            return false;
        }
    },
    replace(newName,codeSnippet){
        // 先查询是否存在
        if(this.codeMap.has(codeSnippet.name)){
            utools.db.remove(CODE_PREFIX+codeSnippet.name)
            // 处理 topList
            let index = configManager.getTopList().indexOf(codeSnippet.name);
            if(index!==-1){
                configManager.replaceTopItem(index,newName)
            }
            // 替换 codeMap
            this.codeMap.delete(codeSnippet.name)
            codeSnippet.name = newName;
            this.codeMap.set(codeSnippet.name,codeSnippet);
            funcUtils.createOrUpdate(CODE_PREFIX+codeSnippet.name,codeSnippet)
            this.codeMap.set(codeSnippet.name,codeSnippet)
            this.writeToDB();
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
        if(name !== null){
            if(configManager.get('enabledFuzzySymbolQuery')){
                // 0. 搜索词需要同样被替换
                name = funcUtils.getFuzzyQueriedValue(name);
                console.log(name)
                for (const codeSnippet of this.codeMap.values()) {
                    // 1.首先检查 查询缓存
                    if(codeSnippet.query == null){
                        // 1.1 不存在查询缓存时生成缓存名
                        codeSnippet.query = funcUtils.getFuzzyQueriedValue(codeSnippet.name)
                        funcUtils.createOrUpdate(CODE_PREFIX+codeSnippet.name,codeSnippet)
                    }
                    // 2.比较 查询缓存
                    if(codeSnippet.query.includes(name)){
                        list.push(codeSnippet)
                    }
                }
            }else{
                // 0. 搜索词需要同样被替换
                name = name.trim().toLowerCase();
                for (const codeSnippet of this.codeMap.values()) {
                    if(codeSnippet.name.toLowerCase().includes(name)){
                        list.push(codeSnippet)
                    }
                }
            }
        }else{
            list = Array.from(this.codeMap.values())
        }
        if(tags !== null && tags.length > 0){
            tags = tags.map(value => value.toLowerCase())
            list = list.filter(codeSnippet=>{
                if(codeSnippet.tags == null){
                    return false;
                }
                for(const tag of tags){
                    if(!codeSnippet.tags.includes(tag)){
                        return false;
                    }
                }
                return true;
            })
        }
        if(type !== null){
            type = type.toLowerCase();
            list = list.filter(codeSnippet=>codeSnippet.type === type)
        }
        // 进行排序处理
        return funcUtils.getSortedArray(list);
    },
    store(path){
        for (let codeSnippet of this.codeMap.values()) {
            let str = '\n### '+codeSnippet.name+'\n';
            if(codeSnippet.desc != null){
                str += `> 📢 ${codeSnippet.desc}\n> \n`;
            }
            if(codeSnippet.time != null){
                str += `> ⏰ ${codeSnippet.time}\n> \n`;
            }
            if(codeSnippet.count != null){
                str += `> 🎲 ${codeSnippet.count}\n> \n`;
            }
            if(codeSnippet.tags != null && codeSnippet.tags.length > 0){
                str += `> 🔖 ${codeSnippet.tags.join(' ')}\n> \n`;
            }
            // output code
            str += "```"+(codeSnippet.type??"plaintext")+"\n"+codeSnippet.code+"\n```\n";
            window.preload.writeConfig(path,str);
        }
    },
    load(path){
        const lines = window.preload.readConfig(path).split('\n');
        let cur = 0;   // 当前扫描行
        let msg = null;
        let count = 0;

        while (cur < lines.length){
            // 先识别 三级标题
            let str = lines[cur].trim();
            if(str === '' || !str.startsWith('### ')){
                cur++;
                continue;
            }
            // 识别一个CodeSnippet
            let result = funcUtils.recongzieCodeSnippet(lines,cur)
            if(result.snippet != null){
                count++;
                this.add(result.snippet)
                cur = result.cur+1;
            }else{
                msg = result;
                break;
            }
        }
        if(msg == null){
            utools.showNotification('共成功导入'+count+'条数据')
        }else{
            utools.showNotification('已导入'+count+'条数据;'+msg+'，导致后续的数据不能被导入')
        }
    }
}

const tagColorManager={
    // tag Color Map
    // key: tag name
    // value: color
    tags: {},
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        let data = getDBItem(CS_TAG_COLOR_ID)
        if( data != null){
            this.tags = Object.fromEntries(funcUtils.jsonToMap(data).entries())
            console.log(this.tags)
            // 移除旧标签，转移到新标签
            removeDBItem(CS_TAG_COLOR_ID)
            this.writeToDB();
        }else{
            this.tags = utools.db.get(GLOBAL_TAGS)?.data ?? {}
        }
        this.isInited = true;
    },
    writeToDB(){
        funcUtils.createOrUpdate(GLOBAL_TAGS,this.tags)
    },

    /**
     * @param {string} tag
     * @return {string} - color string
     */
    get(tag){
        return this.tags[tag]?? configManager.getDefaultColor();
    },
    update(tag,color){
        this.tags[tag] = color;
        this.writeToDB();
    },
    clear(tag){
        if(this.tags[tag] === null){
            this.tags[tag] = undefined;
        }else{
            //处理 颜色
            this.tags[tag] = null;
        }
        this.writeToDB();
    },
    del(tag){
        this.tags[tag] = undefined;
        this.writeToDB();
    },
    add(tag){  // 仅适用旧版本
        if(this.tags[tag] === undefined){
            this.tags[tag]= null;
        }
    },
    all(){
        return Object.keys(this.tags).filter(t=> this.tags[t] !== undefined)
    }
}


const configManager = {
    configs: {},
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        let data = getDBItem(CS_CONFIG_ID)
        if( data != null){
            this.configs = Object.fromEntries(funcUtils.jsonToMap(data).entries())
            console.log(this.configs)
            // 移除旧标签，转移到新标签
            removeDBItem(CS_CONFIG_ID)
            this.writeToDB();
        }else{
            this.configs = utools.db.get(GLOBAL_CONFIG)?.data ?? {}
        }
        console.log('configManager init')
        this.isInited = true;
    },
    writeToDB(){
        funcUtils.createOrUpdate(GLOBAL_CONFIG,this.configs)
    },
    /**
     *
     * @param { ConfigItem } config
     * @return {any}
     */
    get(config){
        return this.configs[config]
    },
    /**
     *
     * @param {ConfigItem} config
     * @param value
     */
    set(config,value){
        this.configs[config] = value;
        this.writeToDB();
    },
    getDefaultColor(){
        return this.configs["defaultColor"]??'#707070FF';
    },
    getGlobalColor(){
        if(utools.isDarkColors()){
            return this.configs["darkGlobalColor"]??'#F4B23CEB'; //'#b4a0ff';
        }else{
            return this.configs["lightGlobalColor"]?? '#18A058FF'; // #5c2d91
        }
    },
    setGlobalColor(color){
        if(utools.isDarkColors()){
            this.configs["darkGlobalColor"] =color;
        }else{
            this.configs["lightGlobalColor"] =color;
        }
        this.writeToDB();
    },
    getSortKey(){
        return this.configs["sortKey"]?? 0;
    },
    getTopList(){
        return this.configs["topList"]??[];
    },
    addTopItem(name){
        let list = this.getTopList();
        list.push(name)
        this.configs["topList"] =list;
        this.writeToDB();
        return list.length-1;
    },
    delTopItem(index){
        let list = this.getTopList();
        list.splice(index,1);
        this.configs["topList"] =list;
        this.writeToDB();
    },
    replaceTopItem(index,name){
        let list = this.getTopList();
        list.splice(index,1,name)
        this.configs["topList"] =list;
        this.writeToDB();
    }

}
function init(){
    // first
    configManager.init();
    // two
    tagColorManager.init();
    // last
    codeSnippetManager.init();
}


export {
    codeSnippetManager,
    tagColorManager,
    configManager,
    init
}