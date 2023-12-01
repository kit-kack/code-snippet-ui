import {$normal, $reactive, switchToFullUIMode} from "../store";
import {copyOrPaste} from "../utils/copy";
import {utools_db_store} from "./base";
import {nanoid} from "nanoid";
import dayjs from "dayjs";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";

const GLOBAL_FUNC = "func";
/**
 *
 *
 */
const DEFAULT_FUNCS = {
    '主动输入':{
        name: "主动输入",
        desc: `弹出输入框，用户主动输入值;
[input/输入]可选参数：任意值（作为输入框默认值）
[select/选择]必需参数：字符串数组,例如<i>['a','b','c']</i>
额外说明：如果没有使用变量接收，默认输入的值会被保存到名为<i>位置X</i>的变量，故请勿将自定义的变量设置为<i>位置X</i>的形式
`,
        commands: ["input","输入","select","选择"],
        expression: '内置提供，无函数实现',
        default: true
    },
    '日期与时间':{
        name: "日期与时间",
        desc: `获取日期与时间;
【custom-time/自定义时间】需要携带格式化参数，例如<i>HH:mm:ss</i>`,
        commands: ["now", "时间戳", "date", "日期", "time", "时间","custom-time", "自定义时间"],
        expression: `\
switch (command) {
    case "now":
    case "时间戳":
        return Date.now();
    case "date":
    case "日期":
        return new Date().toLocaleDateString();
    case "time":
    case "时间":
        return new Date().toLocaleTimeString();
    default:
        try {
            return $._dayjs().format(param)
        } catch (e) {
            return e.message;
        }
}`,
    },
    '剪切板': {
        name: "剪切板",
        desc: `获取剪切板内容;
可选参数：<i>小写</i>/<i>lowercase</i>/<i>大写</i>/<i>uppercase</i>/<i>去空格</i>/<i>trim</i>
        `,
        commands: ["clipboard","剪切板"],
        expression: `\
const data = $._clipboard.readText();
switch (param){
    case '小写':
    case 'lowercase':
        return data.toLowerCase();
    case '大写':
    case 'uppercase':
        return data.toUpperCase();
    case '去空格':
    case 'trim':
        return data.trim();
    default:
        return data;
}`
    },
    "随机":{
        name: "随机",
        desc: `获取随机数/nanoid/uuid;
random可选参数：<i>min..max</i>（来指定范围） 
nanoid可选参数：<i>size</i>(来指定id字符数量)
uuid可选参数：<i>len,radix</i>（len对应uuid长度，radix对应uuid选取字符数量）  
`,
        commands: ["random", "nanoid","uuid"],
        expression: `\
switch (command){
    case "nanoid":
        if(param){
            return $._nanoid(+param);
        }
        return $._nanoid();
    case "uuid":
        if(param){
            const aspects = param.split(",",2);
            if(aspects.length === 2){
                const len = +aspects[0]
                const radix = +aspects[1];
                return $._uuid(len,radix);
            }
        }
        return $._uuid();
    default:
        const num = Math.random();
        if(param){
            const aspects = param.split("..",2);
            if(aspects && aspects.length === 2){
                let min = +aspects[0];
                let max = +aspects[1];
                if(min > max){
                    return Math.trunc(num * (min-max)+max)
                }
                return Math.trunc(num * (max-min)+min)
            }else{
                return "[随机数]：格式错误"
            }
        }else{
            return num;
        }
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
 *
 * @typedef {Object} Result
 * 不解析或者是已经解析好了
 * @property {string} [code] 代码
 * 引用变量
 * @property {string} [variable] 变量
 * 占位符解析
 * @property {string} [command] 占位符
 * @property {string} [param] 可选参数
 * @property {string} [_var] 待赋值的变量名
 * @property {string} [key] 对应占位符实现函数的key
 * @property {boolean} [func] param是否作为占位符函数实现
 * @property {boolean} [assign] 是否为assign
 * @private
 *
 */


/**
 * 解析 [variable::]command[:param]
 * @param {string} text
 * @return Result
 * @private
 */
function _parseVariable_Command_Param(text) {
    /**
     * @type {Result}
     */
    const result = {};
    let index = text.indexOf(':');
    if(index === -1){  // only command
        result.command = text;
    }else{
        if(index === text.length-1){ // last
            // command : param
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
    }
    // trim
    result.command = result.command?.trim();
    result.param = result.param?.trim();
    result._var = result._var?.trim();

    return result;
}

/**
 * 获取command对应的键，如果返回null则代表该占位符不存在
 * @param {string} command
 * @private
 */
function _get_command_key(command){
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
        const func = formatManager.funcMap[key];
        if(func.commands.includes(command)){
            return {
                command: command,
                key: key
            }
        }
    }
    return null;
}

export const formatManager = {
    // data:{
    //     pairs:{}, // 存放变量替换值
    //     inputs:[] // 表明是否为输入变量
    // },
    nameMapping:{},
    funcMap:{},
    initedVarSet : new Set(), // 变量是否已经解析
    codeBuffer : null,  // 为输入变量设置的暂时缓存
    pairBuffer : {},  // 每次解析时，存放上述pairs变量值解析结果
    isInited: false,
    globalVar:{},  // 全局超级变量

    init(){
        if(this.isInited){
            return;
        }
        this.funcMap = utools.db.get(GLOBAL_FUNC)?.data ?? {...DEFAULT_FUNCS};
        this.isInited = true;
        console.log('formatManager init');
    },
    reset() {
        this.funcMap = {...DEFAULT_FUNCS};
        utools.db.remove(GLOBAL_FUNC)
    },
    /**
     * 检查 Func中的Command是否重复
     */
    checkCommandRepeat(command,currentFuncName){
        for (let key in this.funcMap) {
            const func = this.funcMap[key];
            if(func.commands.includes(command) && currentFuncName!==func.name){
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
        if(func.commands && func.commands.length >= 1){
            // check command repeat
            for (let command of func.commands) {
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
        this.funcMap[func.name] = func;
        utools_db_store(GLOBAL_FUNC,this.funcMap)
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
        this.funcMap[func.name] = func;
        utools_db_store(GLOBAL_FUNC,this.funcMap)
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
                utools_db_store(GLOBAL_FUNC,this.funcMap)
            }
        }
    },
    /**
     * 执行表达式
     * @param {string} key
     * @param {string} command
     * @param {string} param
     * @param {boolean} isFuncKey
     * @private
     */
    async _expression_invoker(key,command,param,isFuncKey){
        try{
            if(isFuncKey){
                return await new Function('$',param)(this.globalVar);
            }else{
                // get expression of command
                if(param in this.globalVar){
                    param = this.globalVar[param]?.toString();
                }
                if(key){
                    return await new Function('command','param','$',this.funcMap[key].expression)(command,param,this.globalVar);
                }else{
                    return await GLOBAL_HIERARCHY.currentConfig.funcs[command](param);
                }
            }
        }catch (e){
            console.error(e)
            return '{{error: '+e.message+' }}';
        }
    },
    _initForEachRegex(){
        this.globalVar = {
            _nanoid: nanoid,
            _dayjs: dayjs,
            _clipboard: window.preload._clipboard,
            _uuid: _uuid
        }
    },

    /**
     *
     * @param {string} code
     * @private
     */
    async _format(code){
        const formatBlocks = code.matchAll(/{{.+?}}/gs)
        // 判断是否存在inputVars，并且同时进行切分
        /**
         *
         * @type {Result[]}
         */
        const target = [];
        /**
         * key: 存放【主动输入】的变量名
         * value: 主动输入类型 input select
         */
        const inputVars = {};
        /**
         * 对应【主动输入】中的默认值
         */
        const defaultVarValue = {};
        let last = 0;
        let inputCount = 0;
        for (const formatBlock of formatBlocks) {
            // 判断是否为inputVar
            let name = formatBlock[0]
            // pre
            target.push({
                code: code.slice(last,formatBlock.index)
            })
            // remaining
            last = formatBlock.index + name.length;
            // current
            name = name.slice(2,-2).trim()
            if(name.startsWith('@')) {  // var
                target.push({
                    variable: name.slice(1)
                })
            }else{
                let assignFlag = false;
                if(name.startsWith('#')){
                    name = name.slice(1);
                    assignFlag = true;
                }

                // [variable::]command[:param]
                // 1.parse
                const result = _parseVariable_Command_Param(name)
                // assign：必须有变量赋值
                if(assignFlag && !result._var ){
                    target.push({
                        code: formatBlock[0]  // 不解析
                    })
                    continue
                }

                // -1:unknown 0:active input 1:normal command
                let commandFlag = -1;
                // 2. deal with active input
                if(result.command === "input" || result.command === "输入"){
                    commandFlag = 0;
                    if(!result._var){
                        result._var = '位置'+ inputCount;
                    }
                    inputVars[result._var]= "input"
                    if(result.param){
                        // 因为在globalVar中变量键是@key形式的
                        // 所以当param设置为@key形式时，会优先从globalVar来解析数据
                        // 后续才会作为普通字符串进行解析
                        if(result.param in this.globalVar ){
                            defaultVarValue[result._var] = this.globalVar[result.param]?.toString();
                        }else{
                            defaultVarValue[result._var] = result.param;
                        }
                    }
                    inputCount++;
                }else if(result.command === "select" || result.command === "选择"){
                    commandFlag = 0;
                    if(!result._var){
                        result._var = '位置'+ inputCount;
                    }
                    inputVars[result._var]= "select"
                    if(result.param){
                        // 1. 判断 globalVar是否存在相应元素
                        if(result.param in this.globalVar ){
                            const value = this.globalVar[result.param]
                            // for select,need convert param to array
                            if(value){
                                if(Array.isArray(value)){
                                    defaultVarValue[result._var] = value;
                                }else{
                                    defaultVarValue[result._var] = [value];
                                }
                            }
                        }else{
                            try{
                                const value = new Function('return '+ result.param)()
                                if(value){
                                    if(Array.isArray(value)){
                                        defaultVarValue[result._var] = value;
                                    }else{
                                        defaultVarValue[result._var] = [value];
                                    }
                                }
                            }catch (_){

                            }
                        }
                    }
                    inputCount++;
                }


                // 3.check command valid
                if(commandFlag < 0){
                    if(result.command){
                        const command_key = _get_command_key(result.command);
                        if(command_key){
                            commandFlag = 1;
                            result.command = command_key.command;
                            result.key = command_key.key;
                        }
                    }else{
                        // param将作为command实现函数处理
                        if(result.param){
                            result.func = true
                            commandFlag = 1;
                        }
                    }
                }

                if(commandFlag < 0){
                    target.push({
                        code: formatBlock[0]  // 不解析
                    })
                }else{
                    if(assignFlag){
                        // need parse at once
                        if(commandFlag > 0){
                            this.globalVar['@'+result._var] = await this._expression_invoker(result.key,result.command,result.param,result.func);
                            continue;
                        }
                        result.assign = true;
                    }
                    target.push(result)
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
        if(Object.keys(inputVars).length > 0){
            return {
                parse: true,
                vars: Object.entries(inputVars),
                defaultValues: defaultVarValue,
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
     * @param {any[]} codes
     */
    async _expression(codes){
        // first deal with command
        for (const element of codes) {
            if(element.command){
                switch (element.command){
                    case "input":
                    case "输入":
                    case "select":
                    case "选择":
                        if(element.assign){
                            element.code = ''
                        }else{
                            element.code = this.globalVar['@'+element._var];
                        }
                        break;
                    default:
                        element.code = await  this._expression_invoker(element.key,element.command,element.param,element.func)
                        // var
                        if(element._var){
                            this.globalVar['@'+element._var] = element.code;
                        }
                        break
                }
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
     */
    async parse(code){
        this._initForEachRegex();
        const result = await this._format(code)
        if(result.parse){
            if(result.vars){  // input 解析
                switchToFullUIMode()
                this.codeBuffer = result.code;
                $normal.variables = result.vars;
                $normal.defaultValues = result.defaultValues;
                $reactive.view.variableActive = true;
                return null;
            }else{
                return await this._expression(result.code);
            }
        }else{
            return result.code;
        }
    },


    continueFormat(){
        if(this.codeBuffer){
            let that = this;
            this._expression(this.codeBuffer).then(code =>{
                that.codeBuffer = null
                copyOrPaste(code)
            })
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
                commands: func.commands
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
                    formatManager.funcMap[key] = func
                }
                utools_db_store(GLOBAL_FUNC,formatManager.funcMap)
            }
        }catch (e){
            utools.showNotification(`解析${filename}时发生异常，原因为${e.message}`)
        }
    }
}






const _errorFormatBlockStyle = '<span style="color:red">';
const _formatBlockStyle = utools.isDarkColors()?
    '<span style="color:#ffa400;border-radius:3px;background-color:#414141;font-weight: bolder;">':
    '<span style="color:#ffa400;border-radius:3px;background-color:#f1f1f1;font-weight: bolder;">'
const _assginBlockStyle = utools.isDarkColors()?
    '<span style="color:#10be8e;border-radius:3px;background-color:#414141;font-weight: bolder;">' :
    '<span style="color:#10be8e;border-radius:3px;background-color:#f1f1f1;font-weight: bolder;">'

const regex = /<([^>]+)>([^<]+)<\/[^>]+>/;
function _resolveCommandFromSpan(command){
    const match = regex.exec(command);
    if(match && match.length > 1){
        return match[2].trim().toLowerCase()
    }else{
        return command
    }
}
/**
 * 渲染formatBlock
 * @param {boolean} flag - 是否在渲染模式
 */
export function renderFormatBlock(flag){
    const codeViewer = document.querySelector(flag? '#code-view  div.v-md-editor-preview > div.github-markdown-body':'#code-view pre > code')
    if(codeViewer){
        codeViewer.innerHTML = codeViewer.innerHTML.replace(/{{.+?}}/gs,(substring)=>{
            const text = substring.slice(2,-2).trim();
            let style = _errorFormatBlockStyle ;
            if(text.startsWith('#')) {
                const result = _parseVariable_Command_Param(text.slice(1));
                if (result._var) {
                    if (result.command) {
                        if(!flag){
                            result.command = _resolveCommandFromSpan(result.command)
                        }
                        if (_get_command_key(result.command)) {
                            style =  _assginBlockStyle
                        }
                    }else  if (result.param) {
                        style = _assginBlockStyle
                    }
                }
            }else if(text.startsWith('@')){
                style = _formatBlockStyle
            }else{
                const result = _parseVariable_Command_Param(text);
                if(result.command){
                    if(!flag){
                        result.command = _resolveCommandFromSpan(result.command)
                    }
                    if(_get_command_key(result.command)){
                        style = _formatBlockStyle
                    }
                }
            }
            return style+substring+'</span>'
        })
    }
}