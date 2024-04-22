import {$normal, $reactive, switchToFullUIMode} from "../store";
import {copyOrPaste} from "../utils/copy";
import {utools_db_store} from "./base";
import {nanoid} from "nanoid";
import dayjs from "dayjs";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {toString as _toString} from "lodash-es";
import {desktopPath} from "../some";

const GLOBAL_FUNC = "func";
const GLOBAL_FUNC_PREFIX = "func/";
const COMMAND_FLAG = {
    UNKNOWN: -1,
    ACTIVE_INPUT: 0,
    ACTIVE_SELECT: 1,
    NORMAL_COMMAND: 10,
    PARAM_AS_FUNC: 11,
    CHAIN: 100
}
/**
 *
 *
 */
const DEFAULT_FUNCS = {
    '主动输入':{
        name: "主动输入",
        desc: `弹出输入框，用户主动输入值;
{{input}}可选参数：任意值（作为输入框默认值）
{{select}}必需参数：字符串数组,例如<i>['a','b','c']</i>
额外说明：
1.如果没有使用变量接收，默认输入的值会被保存到名为<i>变量X</i>的变量，故请勿将自定义的变量设置为<i>变量X</i>的形式
2.【主动输入】占位符不能放置于管道操作后面，只能放置于首位`,
        commands:{
          "input": "输入",
          "select": "选择"
        },
        expression: '内置提供，无函数实现',
        default: true,
        sort: 0
    },
    '系统与日期时间': {
        name: "系统与日期时间",
        desc: `获取系统信息以及日期时间；
{{pattern}}需要携带格式化参数，例如<i>HH:mm:ss</i>`,
        commands: {
            "clipboard": "剪切板",
            "ip": "内网IP",
            "now": "时间戳",
            "date": "日期",
            "time": "时间",
            "pattern": "自定义格式"
        },
        sort: 1,
        expression: `\
switch (command){
    case "now": // 时间戳
        return Date.now();
    case "date": // 日期
        return new Date().toLocaleDateString();
    case "time": // 时间
        return new Date().toLocaleTimeString();
    case "pattern": // 自定义
        return $._dayjs().format(param)
    case "clipboard": // 剪切板
        return require('electron').clipboard.readText();
    default: // ip地址
        const os = require('os');
        const ifaces = os.networkInterfaces();
        for (const dev in ifaces) {
            const iface = ifaces[dev]
            for (let i = 0; i < iface.length; i++) {
                const {family, address, internal} = iface[i]
                if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                    return address
                }
            }
        }
        return "127.0.0.1";
}`
    },
    "随机":{
        name: "随机",
        desc: `获取随机数/nanoid/uuid;
{{random}}可选参数：<i>min..max</i>（来指定范围） 
{{nanoid}}可选参数：<i>size</i>(来指定id字符数量)
{{uuid}}可选参数：<i>len,radix</i>（len对应uuid长度，radix对应uuid选取字符数量）`,
        commands: {
            "random": "随机数",
            "nanoid": null,
            "uuid": null
        },
        sort: 3,
        expression: `\
switch (command){
    case "nanoid":
        if(param){
            const num = +param;
            if(isNaN(num)){
                throw "[nanoid]参数要求为数字，非法传入：" + param
            }
            return $._nanoid(num);
        }
        return $._nanoid();
    case "uuid":
        if(param){
            const aspects = param.split(",",2);
            if(aspects.length === 2){
                const len = +aspects[0]
                const radix = +aspects[1];
                if(isNaN(len) || isNaN(radix)){
                    throw "[uuid]参数要求为 len,radix，且两者皆为数字，非法传入：" + param
                }
                return $._uuid(len,radix);
            }
        }
        return $._uuid();
    default: // random
        const num = Math.random();
        if(param){
            const aspects = param.split("..",2);
            if(aspects && aspects.length === 2){
                let min = +aspects[0];
                let max = +aspects[1];
                if(isNaN(min) || isNaN(max)){
                    throw "[random]参数要求为 min..max,且两者皆为数字，非法传入：" + param
                }
                if(min > max){
                    return Math.trunc(num * (min-max)+max)
                }
                return Math.trunc(num * (max-min)+min)
            }else{
                throw "[random]参数要求为 min..max,且两者皆为数字，非法传入：" + param
            }
        }else{
            return num;
        }
}`
    },
    "文本处理":{
        name: "文本处理",
        desc: `对传入的参数进行文本处理`,
        commands: {
            "lowercase": "转小写",
            "uppercase": "转大写",
            "trim": "去空格",
            "camelcase": "转小驼峰",
            "pascalcase": "转大驼峰",
            "snakecase": "转下划线",
            "kebabcase": "转短横线",
        },
        sort: 4,
        expression: `\
if(!param){
    return param;
}
/**
 * @param {string} text
 */
function resolveAspects(text){
    const aspects = [];
    /**
     * mode:
     * -1 未知
     * 1 小写
     * 2 大写
     * 3 首字母大写
     * 4 特殊符号
     * @type {number}
     */
    let mode = -1;
    let start = 0;
    const specicalChars = ['_','-'];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if(mode === -1){
            if(specicalChars.includes(char)){
                start = i+1;
                continue;
            }
            start = i;
            const code = char.charCodeAt(0);
            if(code >= 65 && code <= 90){
                mode = 3;
            }else if(code >= 97 && code <= 122){
                mode = 1;
            }else{
                mode = 4;
            }
        }else{
            if(specicalChars.includes(char)){
                aspects.push(text.slice(start,i));
                start = i+1;
                mode = -1;
                continue;
            }

            const code = char.charCodeAt(0);
            let newMode;
            if(code >= 65 && code <= 90){
                newMode = 2;
            }else if(code >= 97 && code <= 122){
                newMode = 1;
            }else{
                continue
            }
            if(mode ===3 ||mode === 4){
                // 沿用后面
                mode = newMode;
                continue;
            }
            if(mode !== newMode){
                aspects.push(text.slice(start,i));
                start = i;
                mode = newMode;
                if(mode === 2){
                    mode = 3
                }
            }
        }
    }
    // last char
    const last = text.at(-1);
    if(specicalChars.includes(last)){
        if(mode !== -1){
            aspects.push(text.slice(start,-1));
        }
    }else{
        const code = last.charCodeAt(0);
        let newMode;
        if(code >= 65 && code <= 90){
            newMode = 2;
        }else if(code >= 97 && code <= 122){
            newMode = 1;
        }else{
            newMode = 4;
        }
        if(mode === -1){
            aspects.push(last);
        }else if(mode === 3 || mode === 4 || newMode === 4 || mode === newMode){
            aspects.push(text.slice(start))
        }else{
            aspects.push(text.slice(start,-1));
            aspects.push(last);
        }
    }
    return aspects;
}
switch(command){
    case 'lowercase': // 转小写
        return param.toLowerCase();
    case 'uppercase': // 转大写
        return param.toUpperCase();
    case 'trim': // 去空格
        return param.trim();
    case 'camelcase': // 转小驼峰
        return resolveAspects(param).map((v,index)=>{
            if(index === 0){
                return v.toLowerCase()
            }
            return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
        }).join('')
    case 'pascalcase': // 转大驼峰
        return resolveAspects(param).map(v =>{
            return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
        }).join('')
    case 'snakecase': // 转下划线
        return resolveAspects(param).map(v => v.toUpperCase()).join('_')
    case 'kebabcase': // 转短横线
        return resolveAspects(param).map(v => v.toLowerCase()).join('-');
    default:
        return param
}`
    }
}

/**
 * 生成UUID
 * @param {number} len
 * @param {number} radix
 * @return {string}
 * @private
 */
function _uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}


/**
 * 解析 [variable::]command1[:param] | command2 | command3
 * #var=value
 * @param {string} text
 * @param {boolean} [isInRenderMode]
 * @return ParseResult
 * @private
 */
function _newParseWithMultiCommands(text,isInRenderMode){
    /**
     * @type {ParseResult}
     */
    const result = {};
    let index = text.indexOf(':');
    let chainOperateIndex = text.indexOf(' | ');
    if(index === -1 && chainOperateIndex === -1){
        // only command
        result.command = text;
        return result;
    }
    if(index === -1){
        if(chainOperateIndex === -1){
            // only command
            result.command = text;
            return result;
        }else{
            // command1 | command2
            return _parse_command_chain(text,-1,result);
        }
    }else if(chainOperateIndex === -1){
        // [variable::]command1[:param]
        return _parse_variable_command_param(text,index,result);
    }else if(chainOperateIndex < index){
        // command1 | command2
        return _parse_command_chain(text,-1,result);
    }
    return _parse_command_chain(text,index,result);
}

function _parse_command_chain(text,index,result){
    const aspects = text.split(' | ');
    result.chain = aspects.map(c => ({
        command: c,
    }))
    if(index !== -1){
        result.chain[0] = _parse_variable_command_param(aspects[0],index,result.chain[0]);
    }
    return result
}

function _parse_variable_command_param(text,index,result){
    if(index === text.length-1){ // last
        // command :
        result.command = text.slice(0,index)
        result.param= "";
    }else{
        if(text[index+1] === ':'){
            // variable :: command [:param]
            result._var = text.slice(0,index)
            const newText = text.slice(index+2);
            index = newText.indexOf(':')
            if(index !== -1){
                // command: param
                result.command = newText.slice(0,index)
                result.param = newText.slice(index+1)
            }else{
                // command
                result.command = newText;
            }
        }else{
            // command : param
            result.command = text.slice(0,index)
            result.param= text.slice(index+1);
        }
    }
    return result;
}

/**
 * @param {ParseResult} result
 */
function trimResult(result){
    if(result.chain){
        result.chain.forEach(trimResult);
        return;
    }
    if(result.command){
        result.command = result.command.trim();
    }
    if(result.param){
        result.param = result.param.trim();
    }
    if(result._var){
        result._var = result._var.trim();
    }

}


/**
 * 获取command对应的键，如果返回null则代表该占位符不存在
 * @param {string} command
 * @private
 * @param {boolean} [needDesc]
 */
function _get_command_key(command,needDesc){
    // 1.first $
    if(command.startsWith('$')){
        // first query from current hierarchy
        command = command.slice(1);
        const funcs = GLOBAL_HIERARCHY.currentConfig.funcs?? {};
        if(command in funcs){
            return {
                command: command
            }
        }
    }
    // 2. normal funcMap
    for (const key in formatManager.funcMap) {
        if(command in formatManager.funcMap[key].commands){
            if(needDesc){
                return {
                    command: command,
                    desc: formatManager.funcMap[key].commands[command]
                }
            }else{
                return {
                    command: command,
                    key: key
                }
            }
        }
    }
    return null;
}

export const formatManager = {
    funcMap:{},
    codeBuffer : null,  // 为输入变量设置的暂时缓存
    isInited: false,
    globalVar:{},  // 全局超级变量
    dynamicFuncRunStack:[],  // $.func 运行栈

    init(){
        if(this.isInited){
            return;
        }
        let data = utools.db.get(GLOBAL_FUNC)?.data;
        if(data){
            this._old_version_data_mirgate(data);
            utools.db.remove(GLOBAL_FUNC);
        }else{
            const docs = utools.db.allDocs(GLOBAL_FUNC_PREFIX);
            if(docs && docs.length > 0){
                docs.sort((a,b) => a.data.sort - b.data.sort);
                data = {
                    "主动输入": DEFAULT_FUNCS['主动输入']
                }
                for (const doc of docs) {
                    const func = doc.data;
                    if(!func.default){
                        data[func.name] = func;
                    }
                }
                this.funcMap = data;
            }else{
                this._mirgate(structuredClone(DEFAULT_FUNCS));
            }
        }
        this.isInited = true;
        console.log('formatManager init');
    },
    _mirgate(newFuncMap){
        this.funcMap ={
            "主动输入": DEFAULT_FUNCS['主动输入']
        }
        for (const funcKey  in newFuncMap) {
            const func = newFuncMap[funcKey];
            if(!func.default){
                this._storeFunc(func);
            }
        }
    },
    _old_version_data_mirgate(oldVersionFuncMap){
        // 必须先执行 this.mirgate
        this._mirgate(structuredClone(DEFAULT_FUNCS));
        const backupForMirgate = {};
        for (const funcKey  in oldVersionFuncMap) {
            const func = oldVersionFuncMap[funcKey];
            // check name repeat
            let mirgateFlag = false;
            if(this.checkNameRepeat(func.name)){
                mirgateFlag = true;
                func.mirgateErrorMessage = '分组名与 新内置分组名 重复，无法判断实现代码一致'
            }
            if(!mirgateFlag){
                // check command repeat
                // 旧版本 func.commands 为 [ one ,two ]
                if(Array.isArray(func.commands)){
                    for (const command of func.commands) {
                        if(this.checkCommandRepeat(command,func.name)){
                            mirgateFlag = true;
                            func.mirgateErrorMessage = '占位符与 新内置占位符 重复，无法判断实现代码一致'
                            break;
                        }
                    }
                }else {
                    for (const command in func.commands) {
                        if(this.checkCommandRepeat(command,func.name)){
                            mirgateFlag = true;
                            func.mirgateErrorMessage = '占位符与 新内置占位符 重复，无法判断实现代码一致'
                            break;
                        }
                    }
                }

            }
            if(mirgateFlag){
                const commands = {};
                if(Array.isArray(func.commands)){
                    for (const command of func.commands) {
                        commands[command] = null
                    }
                }
                func.commands = commands;
                backupForMirgate[funcKey] = func;
            }else{
                // store
                this._storeFunc(func)
            }
        }

        // generate file
        if(Object.keys(backupForMirgate).length > 0){
            window.preload.writeFile(desktopPath + 'code-snippet-func.json',
                JSON.stringify(backupForMirgate,null,2)
            )
            utools.showNotification('占位符存储发生变化，旧数据生成于桌面/code-snippet-func.json，请自行迁移')
        }
    },
    /**
     * @param {Func} func
     * @private
     */
    _storeFunc(func){
        if(func.sort === undefined){
            func.sort = Date.now();
        }
        this.funcMap[func.name] = func;
        utools_db_store(GLOBAL_FUNC_PREFIX + func.name,func)
    },
    reset() {
        // remove
        utools.db.allDocs(GLOBAL_FUNC_PREFIX).forEach(doc => utools.db.remove(doc._id));
        // use default
        this._mirgate(structuredClone(DEFAULT_FUNCS))
    },
    /**
     * 检查 Func中的Command是否重复
     */
    checkCommandRepeat(command,currentFuncName){
        for (let key in this.funcMap) {
            const func = this.funcMap[key];
            if(command in func.commands && currentFuncName!==func.name){
                return true
            }
        }
        return false;
    },
    /**
     * 检查Name是否重复
     * @param {string} name
     * @param {string} [oldName]
     */
    checkNameRepeat(name,oldName){
        if(name){
            if(name !== oldName){
                if(name in this.funcMap){
                    return true
                }
            }
            return false
        }else{
            return true
        }
    },
    /**
     * 是否检验通过
     * @param {Func} func
     * @param {string} [oldName]
     */
    check(func,oldName){
        // check name repeat
        if(this.checkNameRepeat(func.name,oldName)){
            $message.warning(`标识符[${func.name}]已存在`)
            return false
        }
        // check num
        if(func.commands && Object.keys(func.commands).length >= 1){
            // check command repeat
            for (const command in func.commands) {
                if(this.checkCommandRepeat(command,func.name)){
                    $message.warning("占位符["+command+"]已被使用")
                    return false;
                }
            }
            // check expression
            if(func.expression){
                return true;
            }else{
                $message.warning("函数实现不能为空")
            }
        }else{
            $message.warning("至少提供一个占位符")
            return false;
        }
    },
    /**
     * 添加InnerFunc
     * @param {Func} func
     */
    add(func){
        if(!this.check(func)){
            return false;
        }
        // 保存
        this._storeFunc(func);
        return true
    },
    /**
     * 更新Func
     * @param {Func} func
     * @param {string} [oldName]
     */
    update(func,oldName){
        if(func.default){
            $message.warning("内置函数无法修改");
            return false
        }
        if(!this.check(func,oldName)){
            return false;
        }
        // 保存
        if(func.name !== oldName){
            delete this.funcMap[oldName];
            utools.db.remove(GLOBAL_FUNC_PREFIX + oldName)
        }
        this._storeFunc(func);
        return true
    },
    /**
     * 删除Func
     */
    del(name){
        const func = this.funcMap[name];
        if(func){
            if(func.default){
                $message.warning("内置函数无法移除")
            }else{
                // 移除
                delete this.funcMap[name]
                utools.db.remove(GLOBAL_FUNC_PREFIX + name)
            }
        }
    },
    /**
     *
     * @param {ParseResult} result
     * @private
     * @return {Promise<any | string>}
     * @param  [runtimeParam]
     * @throws {Error}
     */
    async _expression_invoker_for_command(result,runtimeParam){
        if(result.flag === COMMAND_FLAG.PARAM_AS_FUNC){
            return await window.preload.dynamicRunCode(result.param,undefined,undefined,this.globalVar);
        }else{
            // 看param是否为@variable形式
            if(runtimeParam === undefined){
                if(result.param in this.globalVar){
                    result.param = _toString(this.globalVar[result.param]);
                }
            }else{
                result.param = runtimeParam
            }
            if(result.key){
                return await window.preload.dynamicRunCode(this.funcMap[result.key].expression,result.command,result.param,this.globalVar);
            }else{
                return await GLOBAL_HIERARCHY.currentConfig.funcs[result.command](result.param);
            }
        }
    },
    /**
     *
     * @return {Promise<any | string>}
     * @param {string} cAspect
     * @param {string} [pAspect]
     */
    async dynamicRunFunc(cAspect,pAspect){
        const newCommand = cAspect ? cAspect.trim() : '';
        if(!newCommand){
            throw "SyntaxError: $.func(...)执行command不能为空";
        }
        const result = {
            command: newCommand,
            param: _toString(pAspect)
        }
        if(this._checkCommand(result,false) === COMMAND_FLAG.NORMAL_COMMAND){
            // 判断 调用自己判断
            if(this.dynamicFuncRunStack.includes(newCommand)){
                throw `RecursiveError: 递归调用[ ${newCommand} ]，请修改相关占位符代码实现`
            }
            // 入栈
            this.dynamicFuncRunStack.unshift(newCommand);
            const value = await this._expression_invoker_for_command(result);
            // 出栈
            this.dynamicFuncRunStack.shift();
            return value;
        }
        throw `CommandNotFoundError: 未找到对应占位符[ ${newCommand} ]`
    },
    /**
     *
     * @param {ParseResult} result
     * @private
     */
    async _expression_invoker_for_chain(result){
        let value;
        let i = 0;
        try{
            for (; i < result.chain.length; i++) {
                if(i === 0){
                    const first = result.chain[i];
                    if(first.flag === COMMAND_FLAG.ACTIVE_INPUT || first.flag === COMMAND_FLAG.ACTIVE_SELECT){
                        value = _toString(this.globalVar['@'+first._var]);
                    }else{
                        value = _toString(await this._expression_invoker_for_command(result.chain[i]));
                    }
                }else{
                    value = _toString(await this._expression_invoker_for_command(result.chain[i],value));
                }
            }
        }catch (e){
            return  `{{ Error: 运行[ ${result.chain[i].command ?? result.param} ]时抛出异常 => ${e} }}`
        }
        return value
    },
    _initForEachRegex(){
        const func = this.dynamicRunFunc.bind(this)
        this.globalVar = {
            _nanoid: nanoid,
            _dayjs: dayjs,
            _clipboard: window.preload._clipboard,
            _uuid: _uuid,
            func: func
        }
        this.activeInputCount = 0;
        /**
         * key: 存放【主动输入】的变量名
         * value: 主动输入类型 input select
         */
        this.inputVars = {};
        /**
         * 对应【主动输入】中的默认值
         */
        this.inputVarsDefaultValue = {};
        this.dynamicFuncRunStack = [];
    },
    /**
     * @param {ParseResult} result
     * @private
     */
    _resolveCommandWhenInput(result){
        if(!result._var){
            result._var = '变量'+ this.activeInputCount;
        }
        this.inputVars[result._var]= "input"
        if(result.param){
            // 因为在globalVar中变量键是@key形式的
            // 所以当param设置为@key形式时，会优先从globalVar来解析数据
            // 后续才会作为普通字符串进行解析
            if(result.param in this.globalVar ){
                this.inputVarsDefaultValue[result._var] = this.globalVar[result.param]?.toString();
            }else{
                this.inputVarsDefaultValue[result._var] = result.param;
            }
        }
        this.activeInputCount++;
    },

    /**
     * @param {ParseResult} result
     * @private
     */
    _resolveCommandWhenSelect(result){
        if(!result._var){
            result._var = '变量'+ this.activeInputCount;
        }
        this.inputVars[result._var]= "select"
        if(result.param){
            // 1. 判断 globalVar是否存在相应元素
            if(result.param in this.globalVar ){
                const value = this.globalVar[result.param]
                // for select,need convert param to array
                if(value){
                    if(Array.isArray(value)){
                        this.inputVarsDefaultValue[result._var] = value;
                    }else{
                        this.inputVarsDefaultValue[result._var] = [value];
                    }
                }
            }else{
                try{
                    let value = new Function('return '+ result.param)()
                    if(value){
                        if(!Array.isArray(value)){
                            value = [value];  // defaultVarValue[result._var] = value;
                        }
                        // for
                        for (let i = 0; i < value.length; i++) {
                            value[i] = _toString(value[i])
                        }
                        this.inputVarsDefaultValue[result._var] = value
                    }
                }catch (e){
                    $message.error(`{{${name}}}中的select param部分解析错误，原因为${e.message}`)
                }
            }
        }
        this.activeInputCount++;
    },
    /**
     * @param {ParseResult} result
     * @private
     * @param {boolean} syncActiveInput
     * @return {number}
     */
    _checkCommand(result,syncActiveInput){
        // -1:unknown 0:active input 1:normal command 2:func param
        let commandFlag = COMMAND_FLAG.UNKNOWN;
        // 2. deal with active input
        if(result.command === "input"){
            commandFlag = COMMAND_FLAG.ACTIVE_INPUT;
            syncActiveInput && this._resolveCommandWhenInput(result);
        }else if(result.command === "select"){
            commandFlag = COMMAND_FLAG.ACTIVE_SELECT;
            syncActiveInput && this._resolveCommandWhenSelect(result);
        }


        // 3.check command valid
        if(commandFlag === COMMAND_FLAG.UNKNOWN){
            if(result.command){
                const command_key = _get_command_key(result.command);
                if(command_key){
                    commandFlag = COMMAND_FLAG.NORMAL_COMMAND;
                    result.command = command_key.command;
                    result.key = command_key.key;
                }
            }else{
                // param将作为command实现函数处理
                if(result.param){
                    commandFlag = COMMAND_FLAG.PARAM_AS_FUNC;
                }
            }
        }
        result.flag = commandFlag
        return commandFlag
    },

    /**
     *
     * @param {string} code
     * @private
     */
    async _format(code){
        const formatBlocks = code.matchAll(/{{.+?}}\n?/gs)
        // 判断是否存在inputVars，并且同时进行切分
        /**
         *
         * @type {ParseResult[]}
         */
        const target = [];
        // {{...}}x   的x位置
        let last = 0;
        for (const formatBlock of formatBlocks) {
            // 判断是否为inputVar
            let name = formatBlock[0]
            // {{...}}xxxxx{{...}} 中的 xxxxx部分直接添加进target
            target.push({
                code: code.slice(last,formatBlock.index)
            })
            // 变更{{...}}x的x位置
            last = formatBlock.index + name.length;
            // {{...}}\n判断最后一个是否为\n，当占位符为{{#...}}\n形式时移除后面的换行符
            /**
             * {{...}}\n判断最后一个是否为\n，
             * 默认情况下都会移除\n
             * 所以正常情况下都需要执行
             * if(line) last--; 来保留\n
             * 当占位符为{{#...}}\n形式时移除后面的换行符,故不需要执行上述语句
             */
            const line = name.at(-1) === '\n'
            name = name.slice(2,line? -3: -2).trim()
            if(name.startsWith('@')) {  // var
                target.push({
                    variable: name.slice(1)
                })
                if(line){
                    last--;
                }
            }else{
                let assignFlag = false;
                if(name.startsWith('#')){
                    name = name.slice(1);
                    assignFlag = true;
                }
                // 1.parse
                const result = _newParseWithMultiCommands(name);
                // trim
                trimResult(result);
                // assign：必须有变量赋值
                if(assignFlag){
                    const _var = result.chain ? result.chain[0]._var : result._var
                    if(!_var){
                        target.push({
                            code: `{{ SyntaxError: #开头语句必须有变量接收 => #${name} }}`  // 不解析
                        })
                        if(line){  // 保留\n
                            last--;
                        }
                        continue
                    }
                    // 由于移除 #variable=value 语法，故此处不进行直接赋值
                    // else if(result.assign){
                    //     this.globalVar['@'+result._var] = result.param;
                    //     continue;
                    // }
                }
                // check command
                if(result.chain){
                    let allRightCommands = true;
                    let errorMessage;
                    let existActiveInputFlag = COMMAND_FLAG.UNKNOWN;
                    for (let i = 0; i < result.chain.length; i++) {
                        const item = result.chain[i];
                        const flag = this._checkCommand(item,false);
                        if(flag === COMMAND_FLAG.UNKNOWN){
                            allRightCommands = false;
                            errorMessage = `CommandNotFoundError: 未找到对应占位符[ ${item.command} ]`
                            break;
                        }else if(flag === COMMAND_FLAG.ACTIVE_INPUT){
                            if(i > 0){
                                allRightCommands = false;
                                errorMessage = `SyntaxError: 【主动输入】占位符无法放置于管道操作后面，只能放置于首位`
                                break;
                            }else{
                                existActiveInputFlag = COMMAND_FLAG.ACTIVE_INPUT;
                            }
                        }else if(flag === COMMAND_FLAG.ACTIVE_SELECT){
                            if(i > 0){
                                allRightCommands = false;
                                errorMessage = `SyntaxError: 【主动输入】占位符无法放置于管道操作后面，只能放置于首位`
                                break;
                            }else{
                                existActiveInputFlag = COMMAND_FLAG.ACTIVE_SELECT;
                            }
                        }
                    }
                    if(allRightCommands){
                        // 处理唯一的【主动输入】
                        if(existActiveInputFlag === COMMAND_FLAG.ACTIVE_INPUT){
                            this._resolveCommandWhenInput(result.chain[0]);
                        }else if(existActiveInputFlag === COMMAND_FLAG.ACTIVE_SELECT){
                            this._resolveCommandWhenSelect(result.chain[0]);
                        }
                        if(assignFlag){
                            if(existActiveInputFlag === COMMAND_FLAG.UNKNOWN){
                                this.globalVar['@'+result.chain[0]._var] = await this._expression_invoker_for_chain(result);
                                continue;
                            }
                            // TODO: xxx
                            result.assign = true;
                        }
                        result.flag = COMMAND_FLAG.CHAIN;
                        target.push(result)
                        if(line && !result.assign){ // 非赋值下 保留\n
                            last--;
                        }
                    }else{
                        // fail
                        target.push({
                            code: `{{ ${errorMessage} => ${name} }}`  // 不解析
                        })
                        if(line){  // 保留\n
                            last--;
                        }
                    }
                    // TODO
                    continue;
                }
                const flag = this._checkCommand(result,true);
                if(flag === COMMAND_FLAG.UNKNOWN){
                    target.push({
                        code: `{{ CommandNotFoundError: 未找到对应占位符${result.command} => ${name} }}`  // 不解析
                    })
                    if(line) {  // 保留\n
                        last--;
                    }
                }else{
                    if(assignFlag){
                        // 立即解析，而不是等到【主动输入】完成后才解析
                        if(flag >= COMMAND_FLAG.NORMAL_COMMAND){
                            try{
                                this.globalVar['@'+result._var] = await this._expression_invoker_for_command(result);
                            }catch (e){
                                this.globalVar['@'+result._var] = `{{ Error: 运行[ ${result.command} ]时抛出异常 => ${e} }}`
                            }
                            continue;
                        }
                        result.assign = true;
                    }
                    target.push(result)
                    if(line && !result.assign){ // 非赋值下 保留\n
                        last--;
                    }
                }
            }
        }
        if(last === 0){
            return {
                code: code,
                parse: false
            };
        }else if(last < code.length){
            target.push({
                code: code.slice(last)
            })
        }
        if(Object.keys(this.inputVars).length > 0){
            return {
                parse: true,
                vars: Object.entries(this.inputVars),
                defaultValues: this.inputVarsDefaultValue,
                code: target
            }
        }else{
            return {
                parse:true,
                code: target
            }
        }
    },

    /**
     *
     * @param {ParseResult[]} codes
     */
    async _expression(codes){
        // first deal with command
        for (const element of codes) {
            if(element.flag === undefined){
                continue
            }
            switch (element.flag){
                case COMMAND_FLAG.ACTIVE_INPUT:
                case COMMAND_FLAG.ACTIVE_SELECT:
                    if(element.assign){
                        element.code = ''
                    }else{
                        element.code = this.globalVar['@'+element._var];
                    }
                    break;
                case COMMAND_FLAG.CHAIN:
                    element.code = await this._expression_invoker_for_chain(element);
                    // var
                    if(element.chain[0]._var){
                        this.globalVar['@'+element.chain[0]._var] = element.code;
                    }
                    if(element.assign){
                        element.code = ''
                    }
                    break;
                default:
                    try{
                        element.code = await this._expression_invoker_for_command(element);
                    }catch (e){
                        element.code = `{{ Error: 运行[ ${element.command ?? element.param} ]时抛出异常 => ${e} }}`
                    }
                    // var
                    if(element._var){
                        this.globalVar['@'+element._var] = element.code;
                    }
                    break
            }
        }
        // then deal with variable
        return codes.map(element=>{
            if(element.variable){
                const _var = '@'+element.variable;
                if(_var in this.globalVar){
                    element.code = this.globalVar[_var];
                }else {
                    element.code ="undefined"
                }
            }
            return element.code;
        }).join('')
    },
    /**
     * 解析
     * @param {string} code - 待解析的代码
     * @param {boolean} [noView] - 通过utools关键字访问，此时还没有UI界面
     * @return {Promise<FormatResult>}
     */
    async parse(code,noView){
        this._initForEachRegex();
        const result = await this._format(code)
        if(result.parse){
            if(result.vars){  // input 解析
                // 判断是否仅含有一个input
                if($normal.mainPush){ // mainPush场景下忽略 下面input
                    $normal.mainPush = false
                }else if(noView){
                    if(result.vars.length === 1 && result.vars[0][1] === 'input'){
                        // only
                        this.codeBuffer = result.code;
                        return {
                            type: 'input',
                            variable: result.vars[0][0],
                            defaultValue: result.defaultValues[result.vars[0][0]]
                        }
                    }
                }
                switchToFullUIMode()
                this.codeBuffer = result.code;
                $normal.funcs.variables = result.vars;
                $normal.funcs.defaultValues = result.defaultValues;
                $normal.funcs.snippetName = $reactive.currentSnippet.name
                $reactive.common.variableActive = true;
                return {
                    type: 'entry'
                };
            }else{
                return {
                    type: 'code',
                    code: await this._expression(result.code)
                };
            }
        }else{
            return {
                type: 'code',
                code: result.code
            };

        }
    },


    /**
     * @param {boolean} [noView]
     */
    async continueFormat(noView){
        if(this.codeBuffer){
            const code = await this._expression(this.codeBuffer)
            this.codeBuffer = null
            copyOrPaste(code,noView)
        }
    },
    backup(zip, filename,dirname) {
        const funcs = {};
        for(const key in formatManager.funcMap){
            const func = formatManager.funcMap[key];
            if(func.default){
                continue
            }
            funcs[key] = {
                name: func.name,
                desc: func.desc,
                commands: func.commands,
                sort: func.sort
            }
            // store
            zip.file(`${dirname}/${func.name}.func.js`,func.expression)
        }
        zip.file(filename,JSON.stringify({
            funcs: funcs
        }))
    },
    async load(zip, filename,dirname) {
        // func
        try{
            const obj = JSON.parse(await zip.file(filename).async("string"))
            if(obj && obj.funcs){
                for (const key in obj.funcs) {
                    const func = obj.funcs[key];
                    func.expression = await zip.file(`${dirname}/${func.name}.func.js`).async("string");
                    if(func.default || func.name=== '主动输入'){
                       continue;
                    }
                    const commands = func.commands;
                    if('input' in commands || 'select' in commands){
                        continue;
                    }
                    this._storeFunc(func);
                }
            }
        }catch (e){
            utools.showNotification(`解析${filename}时发生异常，原因为${e.message}`)
        }
    }
}


/**
 *
 * @param {string} command
 * @param {number} index
 * @return {string}
 * @private
 */
function _getCommandClass(command,index) {
    const newCommand = command.trim();
    if(newCommand === 'input' || newCommand === 'select'){
        return index === 0 ? 'kitx-right-command': 'kitx-error-command';
    }
    return _get_command_key(newCommand) ? 'kitx-right-command': 'kitx-error-command';
}


/**
 * [variable::]command[:param]
 * variable:::param
 * @param {ParseResult} result
 * @param {number} index
 * @return {string}
 */
function buildResultElement(result,index){
    let html = '';
    if(result.command){
        const newCommand = result.command.trim();
        let className = 'kitx-error-command';
        let title='';
        const res = _get_command_key(newCommand,true);
        if(res){
            if(newCommand === 'input' || newCommand==='select'){
                if(index === 0){
                    className = 'kitx-right-command'
                }
            }else{
                className = 'kitx-right-command'
            }
            if(res.desc){
                title = `title="${res.desc}"`
            }
        }

        html = `<span class="${className}" ${title}>${result.command}</span>`
    }
    if(result._var !== undefined){
        if(result._var){
            html = `<span class="kitx-var">${result._var}</span>::${html}`
        }else{
            // 空字符串
            html = `::${html}`
        }
    }
    if(result.param !== undefined){
        if(result.param){
            html = `${html}:<span class="${result.param.startsWith('@') ? 'kitx-reference' : 'kitx-param' }">${result.param}</span>`
        }else{
            // 空字符串
            html = `${html}:`
        }
    }

    return html;

}

/**
 *
 * @param {string} text
 * @private
 */
function _colorResult2(text) {
    const result = _newParseWithMultiCommands(text);
    if(result.chain){
        return result.chain.map((r,index) => buildResultElement(r,index))
            .join(' | ');
    }else{
        return buildResultElement(result,0)
    }
}
/**
 * 渲染formatBlock
 * @param selector
 * @param normal
 */
export function renderFormatBlock(selector,normal){
    const codeViewer = document.querySelector(selector)
    if(codeViewer){
        codeViewer.innerHTML = replaceRenderBlock(codeViewer.innerHTML);
    }
}
export function replaceRenderBlock(code){
    return code.replace(/{{.+?}}/gs,(substring)=>{
        const text = substring.slice(2,-2);
        let html = '<span class="kitx-snippet">{{';
        if(text.startsWith('#')) {
            html+= '#' +  _colorResult2(text.slice(1));
        }else if(text.startsWith('@')){
            html+= `<span class="kitx-reference">${text}</span>`
        }else{
            html+= _colorResult2(text);
        }
        return html + '}}</span>'
    })
}