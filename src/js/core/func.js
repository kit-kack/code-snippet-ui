import {$normal, $reactive, switchToFullUIMode} from "../store";
import {copyOrPaste} from "../utils/copy";
import {createOrUpdate, GLOBAL_FUNC, removeDBItem} from "./common";
import {nanoid} from "nanoid";


/**
 *
 *
 */
const DEFAULT_FUNCS = {
    '主动输入':{
        name: "主动输入",
        desc: `弹出输入框，用户主动输入变量;
可选参数：任意值（作为输入框默认值）`,
        commands: ["input","输入"],
        expression: '内置实现',
        default: true
    },
    '日期与时间':{
        name: "日期与时间",
        default: true,
        desc: `获取日期与时间;
【自定义时间】需要携带格式化参数，例如<span class="term">HH:mm:ss</span>`,
        commands: ["now", "时间戳", "date", "日期", "time", "时间", "自定义时间"],
        expression: `\
switch (commands) {
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
        default: true,
        desc: `获取剪切板内容;
可选参数：<span class="term">小写</span>/<span class="term">lowercase</span>/<span class="term">大写</span>/<span class="term">uppercase</span>/<span class="term">去空格</span>/<span class="term">trim</span>
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
        default:true,
        desc: `获取随机数/nanoid;
random可选参数：<span class="term">min..max</span>（来指定范围）        
`,
        commands: ["random", "nanoid"],
        expression: `\
switch (command){
    case "nanoid":
        return $._nanoid();
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
    data:{
        pairs:{}, // 存放变量替换值
        inputs:[] // 表明是否为输入变量
    },
    nameMapping:{},
    funcMap:{},
    initedVarSet : new Set(), // 变量是否已经解析
    codeBuffer : null,  // 为输入变量设置的暂时缓存
    pairBuffer : {},  // 每次解析时，存放上述pairs变量值解析结果
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        this.funcMap = utools.db.get(GLOBAL_FUNC)?.data ?? DEFAULT_FUNCS;
        this.isInited = true;
        console.log('formatManager init');
    },
    reset() {
        this.funcMap = DEFAULT_FUNCS;
        removeDBItem(GLOBAL_FUNC)
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
        }else{
            return false
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
                    $message.warning("命令名["+command+"]已被使用")
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
            $message.warning("至少提供一个响应命令名")
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
     * @param {string} expression
     * @private
     */
    _expression_invoker(expression){
        try{
            const func = new Function('$','return '+expression.slice(1))
            return func(this.pairBuffer);
        }catch (e){
            // TODO:
            const result  = `#{${expression}}#`
            $message.error("解析"+result+"错误,原因为"+e.message)
            console.error(e)
            return result;
        }
    },
    _initForEachRegex(){
        this.initedVarSet.clear();
        this.pairBuffer = {...this.data.pairs};
        this.pairBuffer._nanoid = nanoid;
        this.pairBuffer = new Proxy(this.pairBuffer,{
            get(target, prop, receiver) {
                if(!formatManager.initedVarSet.has(prop)){
                    let value = target[prop];
                    if(value && (typeof value === 'string') &&  value.startsWith('#')){
                        target[prop] = formatManager._expression_invoker(value);
                    }
                    formatManager.initedVarSet.add(prop);
                }
                return target[prop]
            }
        })
    },

    /**
     *
     * @param {string} code
     * @private
     */
    _format(code){
        const formatBlocks = code.matchAll(/#{.+?}#/g)
        // 判断是否存在inputVars，并且同时进行切分
        const target = [];
        const inputVars = new Set();
        let last = 0;
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
            if(name.startsWith('@')) {  // exp
                target.push({
                    exp: true,
                    code: name
                })
            }else if(name in this.data.pairs){
                if(this.data.inputs.includes(name)){
                    inputVars.add(name)
                    target.push({
                        inp: true,
                        exp: true,
                        code: name
                    })
                }else{
                    // 直接替换
                    target.push({
                        exp: true,  // 后续可能会解析表达式
                        code: this.pairBuffer[name] // 使用Proxy后， 普通变量和表达式变量都会返回其结果，但结果可能以@开头
                    })
                }
            }else{
                target.push({
                    code: formatBlock[0]  // 不解析
                })
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
        if(inputVars.size > 0){
            return {
                parse: true,
                vars: Array.from(inputVars.keys()),
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
        return codes.map(element=>{
            if(element.inp){
                element.code = this.pairBuffer[element.code]
                if(typeof element.code === 'string'){
                    element.code = element.code?.trim();
                }
            }
            if(element.exp){
                if(element.code && (typeof element.code === 'string') && element.code.startsWith('@')){
                    element.code = this._expression_invoker(element.code)
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
            if(result.vars){
                switchToFullUIMode()
                this.codeBuffer = result.code;
                $normal.variables = result.vars;
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