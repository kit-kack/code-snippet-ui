import {$normal, $reactive, switchToFullUIMode} from "../store";
import {copyOrPaste} from "../utils/copy";
import {createOrUpdate, GLOBAL_FORMAT, removeDBItem} from "./common";
import {nanoid} from "nanoid";

export const formatManager = {
    data:{
        pairs:{}, // 存放变量替换值
        inputs:[] // 表明是否为输入变量
    },
    initedVarSet : new Set(), // 变量是否已经解析
    codeBuffer : null,  // 为输入变量设置的暂时缓存
    pairBuffer : {},  // 每次解析时，存放上述pairs变量值解析结果
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        const data = utools.db.get(GLOBAL_FORMAT)?.data ?? {};
        this.data.pairs = data.pairs??{
            'now': '#Date.now()',
            'date': '#new Date($.now).toLocaleDateString()',
            'time': '#new Date($.now).toLocaleTimeString()',
            'random': '#Math.random()',
            'rand10m': '#Math.trunc($.random*11)',
            'rand100m': '#Math.trunc($.random*101)',
            'nanoid': '#$._nanoid()',
        };
        this.data.inputs = data.inputs??[];
        this.isInited = true;
        console.log('formatManager init');
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
        if(multi){
            return;
        }
        createOrUpdate(GLOBAL_FORMAT,this.data)
    },
    del(raw){
        raw = raw.trim()
        delete  this.data.pairs[raw];
        const index = this.data.inputs.indexOf(raw)
        if(index!== -1){
            this.data.inputs.splice(index,1)
        }
        createOrUpdate(GLOBAL_FORMAT,this.data)
    },
    contain(raw){
        raw = raw.trim()
        return raw in this.data.pairs;
    },
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

    all(){
        const p = {...this.data.pairs}
        for (let input of this.data.inputs) {
            p[input] = p[input]? '#{input:'+p[input]+'}#' : '#{input}#'
        }
        return p;
    },
    continueFormat(){
        if(this.codeBuffer){
            const code = this._expression(this.codeBuffer)
            this.codeBuffer = null;
            copyOrPaste(code)
        }
    },
    reset() {
        this.data.pairs = {
            'now': '#Date.now()',
            'date': '#new Date($.now).toLocaleDateString()',
            'time': '#new Date($.now).toLocaleTimeString()',
            'random': '#Math.random()',
            'rand10m': '#Math.trunc($.random*11)',
            'rand100m': '#Math.trunc($.random*101)',
            'nanoid': '#$._nanoid()',
        };
        this.data.inputs = [];
        removeDBItem(GLOBAL_FORMAT)
    }
}