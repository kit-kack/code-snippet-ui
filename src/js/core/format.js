import {$normal, $reactive, switchToFullUIMode} from "../store";
import {copyOrPaste} from "../utils/copy";
import {createOrUpdate, GLOBAL_FORMAT} from "./common";

export const formatManager = {
    data:{
        pairs:{},
        inputs:[]
    },
    codeBuffer: null,
    pairBuffer: null,
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        const data = utools.db.get(GLOBAL_FORMAT)?.data ?? {};
        this.data.pairs = data.pairs??{};
        this.pairBuffer = {...this.data.pairs}
        this.data.inputs = data.inputs??[];
        console.log('formatManager init')
        this._initForEachRegex();
        this.isInited = true;
    },
    /**
     *
     * @param {string} raw
     * @param {string | null} target
     * @param {boolean} [multi]
     */
    set(raw,target,multi){
        // recongize分析
        raw = raw.trim();
        if(target){
            if(target.startsWith('#{input') && target.endsWith('}#')){
                // final default
                if(target[7]===':'){
                    if(!this.data.inputs.includes(raw)){
                        this.data.inputs.push(raw)
                    }
                    target = target.slice(8,-2);
                }else if(target.length === 9){  // #{input}#
                    if(!this.data.inputs.includes(raw)){
                        this.data.inputs.push(raw)
                    }
                    target = null;
                }
            }
        }
        this.data.pairs[raw] = target;
        // sync for contain func
        this.pairBuffer[raw] = target;
        if(multi){
            return;
        }
        createOrUpdate(GLOBAL_FORMAT,this.data)
    },
    del(raw){
        raw = raw.trim()
        delete  this.data.pairs[raw];
        // sync for contain func
        delete  this.pairBuffer[raw]
        const index = this.data.inputs.indexOf(raw)
        if(index!== -1){
            this.data.inputs.splice(index,1)
        }
        createOrUpdate(GLOBAL_FORMAT,this.data)
    },
    contain(raw){
        raw = raw.trim()
        return raw in this.pairBuffer;
    },
    _initForEachRegex(){
        this.pairBuffer = {...this.data.pairs};
        const now = new Date();
        const random = Math.random();
        this.pairBuffer.random = random;
        this.pairBuffer.rand10m = Math.trunc(random*11)
        this.pairBuffer.rand100m = Math.trunc(random*101)
        this.pairBuffer.date = now.toLocaleDateString();
        this.pairBuffer.time = now.toLocaleTimeString();
        this.pairBuffer.uuid = this._uuid();
    },
    _uuid() {
        const s = [];
        const x = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = x.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = x.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    },

    /**
     *
     * @param {string} code
     * @private
     */
    _format(code){
        const formatBlocks = code.matchAll(/#{.+?}#/g)
        // 判断是否存在inputVars，并且同时进行切分
        // helloworlddfad
        const target = [];
        const inputVars = new Set();
        const preInvokeVars = new Set();
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
            }else if(name in this.pairBuffer){
                if(this.data.inputs.includes(name)){
                    inputVars.add(name)
                    target.push({
                        inp: true,
                        exp: true,
                        code: name
                    })
                }else{
                    /**
                     * @type string
                     */
                    const code = this.pairBuffer[name];
                    if(preInvokeVars.has(name)){
                        target.push({
                            code: code
                        })
                        continue;
                    }
                    if(code && code.startsWith('#')){
                        // pre invoker
                        this.pairBuffer[name] = this._expression_invoker(code)
                        // for next get
                        preInvokeVars.add(name);
                        target.push({
                            code: this.pairBuffer[name]
                        })
                        continue;
                    }
                    // 直接替换
                    target.push({
                        exp: true,  // 后续可能会解析表达式
                        code: this.pairBuffer[name]
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
            return result;
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
     * @param {string} code
     * @param {boolean} isPaste
     * @return {string | any[] | any | null}
     * @param {boolean} noView
     */
    parse(code,isPaste,noView){
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

    all(){
        const p = {...this.data.pairs}
        p.random = '(内置)随机数[0,1)';
        p.rand10m = '(内置)随机数[0,10]';
        p.rand100m = '(内置)随机数[0,100]';
        p.date = '(内置)当前日期';
        p.time = '(内置)当前时刻'
        p.uuid = '(内置)唯一标识符'
        // input var
        for (let input of this.data.inputs) {
            p[input] = p[input]? '#{input:'+p[input]+'}#' : '#{input}#'
        }
        return p;
    },
    continueFormat(){
        if(this.codeBuffer){
            let code = this._expression(this.codeBuffer)
            this.codeBuffer = null;
            copyOrPaste(code)
        }
    }
}