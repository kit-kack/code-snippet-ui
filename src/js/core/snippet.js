import {nanoid} from "nanoid";
import {defaultHelpSnippet} from "../some";
import {fuzzyCompare} from "../utils/fuzzy";
import {
    CODE_PREFIX, createOrUpdate,
    CS_CODE_ID,
    CS_DOC_ID,
    CS_MARK_ID,
    CS_ROOT_ID,
    getDBItem, GLOBAL_FORMAT,
    GLOBAL_ROOT_TAGS,
    removeDBItem
} from "./common";
import {tagColorManager} from "./tag";
import {configManager} from "./config";
import {formatManager} from "./format";
import {lowercaseIncludes} from "../utils/common";


/**
 * MD解析：识别MD中CodeSnippet中的代码块起始符号`号数量
 * @param line
 * @return {{prefix: string, type: string} | {prefix: string, type: null} | null} - prefix对应```数量 type对应语言类型
 * @private
 */
function _recongizeCodeBlock(line){
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
}
/**
 * MD解析：识别MD中的一个CodeSnippet片段
 * @param {string[]} lines
 * @param {number} cur
 * @private
 */
function _recongzieCodeSnippet(lines,cur){
    const snippet = {};
    let top = false;
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
            }else if(str.startsWith("tags:")) {
                let tags = str.substring(5).trim().split(' ').filter(value => value.length > 0);
                if (tags != null && tags.length > 0) {
                    snippet.tags = tags;
                }
            }else if(str.startsWith('local:')) {
                snippet.path = str.substring(6).trim()
                snippet.local = true;
            }else if(str.startsWith('network:')){
                snippet.path = str.substring(8).trim()
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
            }else if(str.startsWith('🧩')){
                const sections = str.substring(2).trim().split(' ').filter(value => value.length>0);
                if(sections && sections.length > 0){
                    snippet.sections = sections.map(v =>v.split('-',2).map(x=>parseInt(x)))
                }
            }else if(str.startsWith('🔰top')){
                top = true;
            }
        }else{
            let pair = _recongizeCodeBlock(str);
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
                        top: top,
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
}


/**
 * MD生成：识别代码的起始符号`号数量
 * @param {string} code
 * @private
 */
function _getMaxMarkCount(code){
    if(code != null){
        let max = 0;
        let temp = 0;

        for (let ch of code) {
            if(ch === '`'){
                temp ++;
            }else{
                if(temp > max){
                    max = temp;
                }
                temp = 0;
            }
        }
        return max;
    }else{
        return 0;
    }
}
/**
 * 根据属性产生对应的排序函数
 * @param {string} property
 * @private
 */
function _compare(property){
    return function (a,b){
        if(a[property] == null){
            return (b[property] == null)? a.name.localeCompare(b.name) : 1;
        }else if(b[property] == null){
            return -1;
        }else{
            if( a[property] > b[property]){
                return -1;
            }else if(a[property] < b[property]){
                return 1;
            }else{
                return a.name.localeCompare(b.name);
            }
        }
    }
}


/**
 *  获取排序后的数组
 * @param {CodeSnippet[]} list
 * @return {CodeSnippet[]}
 * @private
 */
function _getSortedArray(list){
    // 筛选出 置顶列表中的片段
    let topSnippets = [];
    let topList = configManager.getTopList();
    list = list.filter(snippet =>{
        let index = topList.indexOf(snippet.id);
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
            list.sort(_compare('createTime'))
            break;
        case 1:   // 最近访问时间
            list.sort(_compare('time'))
            break;
        case 2:  // 粘贴使用次数
            list.sort(_compare('count'))
            break;
        default:  // 自然排序
            list.sort((a,b)=>a.name.localeCompare(b.name))
            break;
    }
    return topSnippets.concat(list);
}



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
            return;
        }
        codeSnippet.id = nanoid();
        codeSnippet.count = codeSnippet.count??0;
        codeSnippet.createTime = Date.now()
        codeSnippet.time = codeSnippet.time??codeSnippet.createTime;
        this.codeMap.set(codeSnippet.id,codeSnippet);
        createOrUpdate(CODE_PREFIX+codeSnippet.id,codeSnippet)
        this.addTagInfo(codeSnippet,true)
        console.log('now code snippet size: '+this.codeMap.size)
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
        if(this.codeMap.has(id)){
            utools.db.remove(CODE_PREFIX+id)
            this.codeMap.delete(id)
            // 处理 topList
            let index = configManager.getTopList().indexOf(id)
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
        if(name !== null){
            // 0. 搜索词需要同样被替换
            for (const codeSnippet of this.codeMap.values()) {
                const query = codeSnippet.name.toLowerCase();
                // 2.比较 查询缓存
                if(configManager.get('enabledFuzzySymbolQuery')){
                    const offsets = fuzzyCompare(name,query);
                    if(offsets){
                        // 拆分替换
                        const charArray = codeSnippet.name.split('')
                        for (let offset of offsets) {
                            charArray[offset] = `<span style="color: ${configManager.getGlobalColor()}">${charArray[offset]}</span>`
                        }
                        codeSnippet.temp = charArray.join('');
                        list.push(codeSnippet)
                    }
                }else{
                    if(query.includes(name)){
                        codeSnippet.temp = codeSnippet.name.replace(new RegExp(name,"i"),`<span style="color: ${configManager.getGlobalColor()}">$&</span>`)
                        list.push(codeSnippet)
                    }
                }
            }
        }else{
            for (let codeSnippet of this.codeMap.values()) {
                codeSnippet.temp = undefined;
                list.push(codeSnippet)
            }
        }
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
        if(type !== null){
            type = type.toLowerCase();
            list = list.filter(codeSnippet=>codeSnippet.type === type)
        }
        // 进行排序处理
        return _getSortedArray(list);
    },
    store(path){
        // store yaml header
        let header = {
            tags: tagColorManager.all(),
            vars: formatManager.all()
        }
        header = window.preload.encodeBase64(JSON.stringify(header))
        window.preload.writeConfig(path,'---\n'+header+'\n---\n> 上面为Base64编码后的 变量与标签 数据\n\n',true);

        // snippet
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
            if(codeSnippet.path != null){
                if(codeSnippet.local){
                    str += `> local: ${codeSnippet.path}\n> \n`
                }else{
                    str += `> network: ${codeSnippet.path}\n> \n`
                }
            }
            if(codeSnippet.sections && codeSnippet.sections.length > 0){
                str+= '> 🧩';
                for (const section of codeSnippet.sections) {
                    str+= ` ${section[0]}-${section[1]}`
                }
                str+='\n';
            }
            if(configManager.getTopList().includes(codeSnippet.id)){
                str += '> 🔰top \n';
            }
            // output code
            const max = _getMaxMarkCount(codeSnippet.code)
            let block = '```';
            for (let i = 3; i <= max; i++) {
                block+='`'
            }
            str+=`${block}${codeSnippet.type??'plaintext'}\n${codeSnippet.code}\n${block}\n`
            window.preload.writeConfig(path,str);
        }
    },
    load(path){
        const lines = window.preload.readConfig(path).split('\n');
        let cur = 0;   // 当前扫描行
        let msg = null;
        let count = 0;
        let header = false;

        while (cur < lines.length){
            // 先识别 三级标题
            let str = lines[cur].trim();
            if(!header && str==='---'){
                // 识别header
                let temp = ''
                cur++;
                while (cur< lines.length && lines[cur].trim()!=='---'){
                    temp+= lines[cur]
                    cur++;
                }
                console.log(temp)
                // parse
                try{
                    const data = JSON.parse(window.preload.decodeBase64(temp))
                    if(data.tags){
                        for (const tag of data.tags) {
                            tagColorManager.tags[tag] = data.tags[tag]
                        }
                        tagColorManager.writeToDB()
                    }
                    if(data.vars){
                        for (const v in data.vars) {
                            formatManager.set(v,data.vars[v],true)
                        }
                        createOrUpdate(GLOBAL_FORMAT,formatManager.data)
                    }
                    header=true;
                }catch (e){
                    utools.showNotification('解析YAML头失败：'+e.message)
                }
                cur++;
                continue;
            }
            if(str === '' || !str.startsWith('### ')){
                cur++;
                continue;
            }
            // 识别一个CodeSnippet
            let result = _recongzieCodeSnippet(lines,cur)
            if(result.snippet != null){
                count++;
                if(result.snippet.path){
                    result.snippet.code = undefined;
                }
                this.add(result.snippet)
                if(result.top){
                    configManager.addTopItem(result.snippet.id)
                }
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