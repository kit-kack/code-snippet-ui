import {$normal, $reactive, switchToFullUIMode} from "../store";
import {copyOrPaste} from "../utils/copy";
import {createOrUpdate, GLOBAL_FUNC, removeDBItem} from "./base";
import {nanoid} from "nanoid";
import dayjs from "dayjs";


/**
 *
 *
 */
const DEFAULT_FUNCS = {
    '主动输入':{
        name: "主动输入",
        desc: `弹出输入框，用户主动输入值;
可选参数：任意值（作为输入框默认值）
额外说明：如果没有使用变量接收，默认输入的值会被保存到名为<i>位置X</i>的变量，故请勿将自定义的变量设置为<i>位置X</i>的形式
`,
        commands: ["input","输入"],
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
        removeDBItem(GLOBAL_FUNC)
    },
    /**
     * 检查 Func中的Command是否重复
     */
    checkCommandRepeat(command,currentFuncName){
        if(command === '输入' || command === 'input'){
            return true;
        }
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
        createOrUpdate(GLOBAL_FUNC,this.funcMap)
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
        createOrUpdate(GLOBAL_FUNC,this.funcMap)
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
                createOrUpdate(GLOBAL_FUNC,this.funcMap)
            }
        }
    },
    // all(){
    //     const p = {...this.data.pairs}
    //     for (let input of this.data.inputs) {
    //         p[input] = p[input]? '#{input:'+p[input]+'}#' : '#{input}#'
    //     }
    //     return p;
    // },
    //
    // /**
    //  *
    //  * @param {string} raw
    //  * @param {string | null} target
    //  * @param {boolean} [multi]
    //  */
    // set(raw,target,multi){
    //     // recongize分析
    //     raw = raw.trim();
    //     if(target){
    //         if(target.startsWith('#{input') && target.endsWith('}#')){
    //             // final default
    //             if(target[7]===':'){
    //                 if(!this.data.inputs.includes(raw)){
    //                     this.data.inputs.push(raw)
    //                 }
    //                 target = target.slice(8,-2);
    //             }else if(target.length === 9){  // #{input}#
    //                 if(!this.data.inputs.includes(raw)){
    //                     this.data.inputs.push(raw)
    //                 }
    //                 target = null;
    //             }
    //         }
    //     }
    //     this.data.pairs[raw] = target;
    //     if(multi){
    //         return;
    //     }
    //     createOrUpdate(GLOBAL_FORMAT,this.data)
    // },
    // del(raw){
    //     raw = raw.trim()
    //     delete  this.data.pairs[raw];
    //     const index = this.data.inputs.indexOf(raw)
    //     if(index!== -1){
    //         this.data.inputs.splice(index,1)
    //     }
    //     createOrUpdate(GLOBAL_FORMAT,this.data)
    // },
    // contain(raw){
    //     raw = raw.trim()
    //     return raw in this.data.pairs;
    // },
    /**
     * 执行表达式
     * @param {string} key
     * @param {string} command
     * @param {string} param
     * @private
     */
    _expression_invoker(key,command,param){
        try{
            // get expression of command
            const func = new Function('command','param','$',this.funcMap[key].expression)
            return func(command,param,this.globalVar);
        }catch (e){
            $message.error("解析"+command+"错误,原因为"+e.message)
            console.error(e)
            return '{{error: '+e.message+' }}';
        }
    },
    _initForEachRegex(){
        this.globalVar = {
            _nanoid: nanoid,
            _dayjs: dayjs,
            _clipboard: window.preload._clipboard,
            _uuid: function uuid(len, radix) {
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
        }
    },

    /**
     *
     * @param {string} code
     * @private
     */
    _format(code){
        const formatBlocks = code.matchAll(/{{.+?}}/g)
        // 判断是否存在inputVars，并且同时进行切分
        const target = [];
        const inputVars = new Set();
        const defaultVarValue = {};
        let last = 0;
        let inputCount = 0;
        for (const formatBlock of formatBlocks) {
            // 判断是否为inputVar
            let name = formatBlock[0]
            console.log(name)
            // pre
            target.push({
                code: code.slice(last,formatBlock.index)
            })
            // remaining
            last = formatBlock.index + name.length;
            // current
            name = name.slice(2,-2).trim()
            if(name.startsWith('@')) {  // exp
                target.push({
                    variable: name.slice(1)
                })
            }else{
                // [variable::]command[:param]
                // 1.split
                const result = {};
                let index = name.indexOf(':');
                if(index !== -1){
                    if(index === name.length-1){ // last
                        // command : param
                        result.command = name.slice(0,index)
                        result.param= "";
                    }else{
                        if(name[index+1] === ':'){
                            // variable :: command [:param]
                            result._var = name.slice(0,index)
                            const newName = name.slice(index+2);
                            index = newName.indexOf(':')
                            if(index !== -1){
                                // command: param
                                result.command = newName.slice(0,index)
                                result.param = newName.slice(index+1)
                            }else{
                                // command
                                result.command = newName;
                            }
                        }else{
                            // command : param
                            result.command = name.slice(0,index)
                            result.param= name.slice(index+1);
                        }
                    }
                }else{
                    // only command
                    result.command = name;
                }
                // 2.first deal with input
                if(result.command === "input" || result.command === "输入"){
                    if(result._var){
                        inputVars.add(result._var)
                    }else{
                        result._var = '位置'+ inputCount;
                        inputVars.add(result._var);
                    }
                    if(result.param){
                        defaultVarValue[result._var] = result.param;
                    }
                    inputCount++;
                }
                // check command exist
                let nonExist = true;
                for (let key in this.funcMap) {
                    const func = this.funcMap[key];
                    if(func.commands.includes(result.command)){
                        result.key = key;
                        target.push(result)
                        nonExist = false;
                        break;
                    }
                }
                if(nonExist){
                    target.push({
                        code: formatBlock[0]  // 不解析
                    })
                }
            }
            // else if(name in this.data.pairs){
            //     if(this.data.inputs.includes(name)){
            //         inputVars.add(name)
            //         target.push({
            //             inp: true,
            //             exp: true,
            //             code: name
            //         })
            //     }else{
            //         // 直接替换
            //         target.push({
            //             exp: true,  // 后续可能会解析表达式
            //             code: this.pairBuffer[name] // 使用Proxy后， 普通变量和表达式变量都会返回其结果，但结果可能以@开头
            //         })
            //     }
            // }else{
            //     target.push({
            //         code: formatBlock[0]  // 不解析
            //     })
            // }
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
        if(inputVars.size > 0){
            return {
                parse: true,
                vars: Array.from(inputVars.keys()),
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
     * @return {string}
     */
    _expression(codes){
        // first deal with command
        codes.forEach(element =>{
            if(element.command){
                if(element.command === "input" || element.command === "输入"){
                    element.code = this.globalVar['@'+element._var];
                }else{
                    element.code = this._expression_invoker(element.key,element.command,element.param)
                    // var
                    if(element._var){
                        this.globalVar['@'+element._var] = element.code;
                    }
                }
            }
        })
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
    parse(code){
        this._initForEachRegex();
        const result = this._format(code)
        if(result.parse){
            if(result.vars){  // input 解析
                switchToFullUIMode()
                this.codeBuffer = result.code;
                $normal.variables = result.vars;
                $normal.defaultValues = result.defaultValues;
                $reactive.view.variableActive = true;
                return null;
            }else{
                return this._expression(result.code);
            }
        }else{
            return result.code;
        }
    },


    continueFormat(){
        if(this.codeBuffer){
            const code = this._expression(this.codeBuffer)
            this.codeBuffer = null;
            copyOrPaste(code)
        }
    }
}