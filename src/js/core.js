// 全局便利常量和函数

const utools = window.utools;
const setDBItem = utools.dbStorage.setItem
const getDBItem = utools.dbStorage.getItem
const removeDBItem = utools.dbStorage.removeItem

// 存入数据库的 键前缀
const CS_ROOT_ID = "#kitkack.code-snippet-root#"; // 存储所有标签的键
const CS_CONFIG_ID = "#kitkack.code-snippet-config#"  // 配置项前缀
const CS_CODE_ID = "#kitkack.code-snippet-code#";  // 新版标记
const CS_HISTORY_ID = "#kitkack.code-snippet-history#"; // 历史记录（新版本未使用到）
const CS_TAG_COLOR_ID = "#kitkack.code-snippet-tag-color#"; // 标签颜色
// 旧版本标记，兼容性，后续版本可能会被移除
const CS_MARK_ID = "#kitkack.code-snippet#";      // 标签及代码片段部分前缀
const CS_DOC_ID = "#kitkack.code-snippet-doc#";   // 描述部分前缀


const funcUtils = {
    mapToJson(map) {
        return JSON.stringify([...map]);
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
    result: '',
    isInited: false,

    init() {
        if (this.isInited) {
            return;
        }
        // 读取标签数据
        this.result = getDBItem(CS_ROOT_ID);
        if (this.result == null) {
            this.result = '';
        }
        if (this.result.trim() !== '') {
            let list = this.result.split('\0');
            if (this.result[0] === '\0') {
                list.shift()
            }
            // 初始化所有值
            for (const name of list) {
                let payload = {};
                // 兼容操作，逐渐舍弃原标志
                let code = getDBItem(CS_MARK_ID + name);
                if (code != null) {
                    payload.name = name;
                    payload.code = code;
                    removeDBItem(CS_MARK_ID + name)
                    let doc = getDBItem(CS_DOC_ID + name)
                    if (doc != null) {
                        payload.desc = doc;
                        removeDBItem(CS_DOC_ID + name)
                    }
                    setDBItem(CS_CODE_ID + name, JSON.stringify(payload))
                } else {
                    payload = JSON.parse(getDBItem(CS_CODE_ID + name))
                }
                if (payload.count == null) {
                    payload.count = 0;
                }
                this.codeMap.set(name, payload)
            }
        }
        console.log('codeSnippetManager init, and size is'+this.codeMap.size)
        this.isInited = true;
    },
    rebuild(){
        // 重新构建 result
        this.result = '';
        for (const key of this.codeMap.keys()) {
            if(key != null){
                this.result += ('\0'+key);
            }
        }
        setDBItem(CS_ROOT_ID,this.result);
    },


    /**
     * @param {CodeSnippet} codeSnippet
     */
    add(codeSnippet){
        codeSnippet.count = codeSnippet.count??0;
        codeSnippet.time = codeSnippet.time??Date.now();
        this.codeMap.set(codeSnippet.name,codeSnippet);
        this.result+= ('\0'+codeSnippet.name);
        setDBItem(CS_ROOT_ID,this.result);
        setDBItem(CS_CODE_ID+codeSnippet.name,JSON.stringify(codeSnippet))
        console.log('now code snippet size:'+this.codeMap.size)
    },

    /**
     *
     * @param {string} name
     * @returns {boolean} - is success
     */
    del(name){
        // 先查询是否存在
        if(this.codeMap.has(name)){
            removeDBItem(CS_CODE_ID+name);
            this.codeMap.delete(name)
            // 重新构建 result
            this.rebuild()

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
            setDBItem(CS_CODE_ID+codeSnippet.name,JSON.stringify(codeSnippet))
            this.codeMap.set(codeSnippet.name,codeSnippet)
            console.log(codeSnippet)
            return true;
        }else{
            return false;
        }
    },
    replace(newName,codeSnippet){
        // 先查询是否存在
        if(this.codeMap.has(codeSnippet.name)){
            removeDBItem(CS_CODE_ID+codeSnippet.name)
            // 处理 topList
            let index = configManager.getTopList().indexOf(codeSnippet.name);
            if(index!==-1){
                configManager.replaceTopItem(index,newName)
            }
            // 替换 codeMap
            this.codeMap.delete(codeSnippet.name)
            codeSnippet.name = newName;
            this.codeMap.set(codeSnippet.name,codeSnippet);
            setDBItem(CS_CODE_ID+codeSnippet.name,JSON.stringify(codeSnippet))
            this.codeMap.set(codeSnippet.name,codeSnippet)
            this.rebuild();
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
                        setDBItem(CS_CODE_ID+codeSnippet.name,JSON.stringify(codeSnippet))
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
    tagMap: new Map(),
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        let data = getDBItem(CS_TAG_COLOR_ID)
        if( data != null){
            this.tagMap = funcUtils.jsonToMap(data)
        }
        console.log('tagColorManager init, and size is'+this.tagMap.size)
        this.isInited = true;
    },

    /**
     * @param {string} tag
     * @return {string} - color string
     */
    get(tag){
        if(this.tagMap.has(tag)){
            return this.tagMap.get(tag)?? configManager.getDefaultColor();
        }else{
            return configManager.getDefaultColor();
        }
    },
    update(tag,color){
        this.tagMap.set(tag,color)
        setDBItem(CS_TAG_COLOR_ID,funcUtils.mapToJson(this.tagMap))
    },
    del(tag){
        this.tagMap.delete(tag)
        setDBItem(CS_TAG_COLOR_ID,funcUtils.mapToJson(this.tagMap))
    },
    all(){
        return Array.from(this.tagMap.keys())
    }
}


const configManager = {
    configMap: new Map(),
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        let data = getDBItem(CS_CONFIG_ID)
        if( data != null){
            this.configMap = funcUtils.jsonToMap(data)
        }
        console.log('configManager init, and size is'+this.configMap.size)
        this.isInited = true;
    },
    writeToDB(){
        setDBItem(CS_CONFIG_ID,funcUtils.mapToJson(this.configMap))
    },
    /**
     *
     * @param { ConfigItem } config
     * @return {any}
     */
    get(config){
        return this.configMap.get(config)
    },
    /**
     *
     * @param {ConfigItem} config
     * @param value
     */
    set(config,value){
        this.configMap.set(config,value)
        this.writeToDB();
    },
    getDefaultColor(){
        return this.configMap.get("defaultColor")??'#707070FF';
    },
    getGlobalColor(){
        if(utools.isDarkColors()){
            return this.configMap.get("darkGlobalColor")??'#F4B23CEB'; //'#b4a0ff';
        }else{
            return this.configMap.get("lightGlobalColor")?? '#18A058FF'; // #5c2d91
        }
    },
    setGlobalColor(color){
        if(utools.isDarkColors()){
            this.configMap.set("darkGlobalColor",color);
        }else{
            this.configMap.set("lightGlobalColor",color);
        }
        this.writeToDB();
    },
    getSortKey(){
        return this.configMap.get("sortKey")?? 0;
    },
    getTopList(){
        return this.configMap.get("topList")??[];
    },
    addTopItem(name){
        let list = this.getTopList();
        list.push(name)
        this.configMap.set("topList",list);
        this.writeToDB();
        return list.length-1;
    },
    delTopItem(index){
        let list = this.getTopList();
        list.splice(index,1);
        this.configMap.set("topList",list);
        this.writeToDB();
    },
    replaceTopItem(index,name){
        let list = this.getTopList();
        list.splice(index,1,name)
        this.configMap.set("topList",list);
        this.writeToDB();
    }

}


export {
    codeSnippetManager,
    tagColorManager,
    configManager
}