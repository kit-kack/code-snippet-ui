import {nextTick} from "vue";
import hljs from "../dep/highlight-dep";
import {formatManager} from "../core";

/**
 * 防抖函数
 * @param fn
 * @param wait
 * @returns {(function(): void)|*}
 */
export function debounce(fn, wait=150){
    let timer = null;
    return function(){
        if(!timer){
            timer = setTimeout(function(){
                fn()
                timer = null
            },wait)
        }
    }
}

/**
 * 刷新操作
 * @param {Ref<UnwrapRef<boolean>>} ref_flag
 * @param {Function | undefined} fn
 */
export function getRefreshFunc(ref_flag,fn){
    if(fn){
        return ()=>{
            ref_flag.value  = false;
            nextTick(()=>{
                ref_flag.value = true;
                fn();
            })
        }
    }else{
        return ()=>{
            ref_flag.value  = false;
            nextTick(()=>{
                ref_flag.value = true;
            })
        }
    }

}


/**
 * 计算与当前的相差时间
 * @param {null | number} time
 * @returns {string}
 */
export function calculateTime(time){
    if(time == null){
        return '未知';
    }
    let old = new Date(time);
    let difftime = (Date.now() -old)/1000; //计算时间差,并把毫秒转换成秒
    let days = Math.trunc(difftime/86400); // 天  24*60*60*1000
    if(days > 0){
        if(days > 10){
            return old.toLocaleDateString();
        }else if(days === 1){
            return '昨天'
        }else if(days === 2){
            return '前天'
        }else{
            return days+'天前'
        }
    }
    let hours = Math.trunc(difftime/3600)-24*days;    // 小时 60*60 总小时数-过去的小时数=现在的小时数
    if(hours > 0){
        return hours+'小时前';
    }
    let minutes = Math.trunc(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
    if(minutes > 0){
        return minutes+'分钟前';
    }
    let seconds = Math.trunc(difftime%60);  // 以60秒为一整份 取余 剩下秒数

    if(seconds> 0){
        return seconds+'秒前';
    }
    return '现在';
}


const rootLanguages = hljs.listLanguages();
rootLanguages.sort()
/**
 * 用在FormView来选择代码片段类型
 * @type {unknown[]}
 */
export const languages = rootLanguages.map(v=>{
    if(v === "plaintext"){
        return {
            label: "plaintext - 纯文本",
            value: "plaintext"
        }
    }else if(v === "markdown"){
        return {
            label: "markdown - 可渲染显示✨",
            value: "markdown"
        }
    }
    return {
        label:v,
        value:v
    }
});


/**
 * 代码片段类型别名映射
 * @param {string} type
 * @private
 * @return {string}
 */
function _alias(type){
    switch (type){
        case 'c#':
            return 'csharp';
        case 'c++':
            return 'cpp';
        case 'f#':
            return 'fsharp';
        case 'js':
            return 'javascript';
        case 'kt':
            return 'kotlin'
        case 'md':
            return 'markdown';
        case 'objective-c':
        case 'object-c':
            return 'objectivec';
        case 'py':
            return 'python';
        case 'ts':
            return 'typescript';
        case 'txt':
            return 'plaintext';
        case 'yml':
            return 'yaml';
        default:
            return type;
    }
}




/**
 * 获取真实文件类型以及是否为内置高亮语言支持
 * @param {string} type
 * @return {{valid: boolean, type: string}}
 */
export function getRealTypeAndValidStatus(type){
    if(type){
        if(type.length>2 && type.startsWith('x-')){
            type = type.slice(2)
        }
        type = _alias(type) // alias
        return {
            type: type,  
            valid: rootLanguages.includes(type)
        }
    }else{
        return {
            type: 'plaintext',
            valid: true
        };
    }
}


const _darkFormatBlockStyle = '<span style="color:#ffa400;border-radius:3px;background-color:#414141;font-weight: bolder;">'
const _lightFormatBlockStyle = '<span style="color:#ffa400;border-radius:3px;background-color:#f1f1f1;font-weight: bolder;">'
const _errorFormatBlockStyle = '<span style="color:red">';

/**
 * 渲染formatBlock
 * @param {boolean} flag - 是否在渲染模式
 */
export function renderFormatBlock(flag){
    const codeViewer = document.querySelector(flag? '#code-view  div.v-md-editor-preview > div.github-markdown-body':'#code-view pre > code')
    if(codeViewer){
        codeViewer.innerHTML = codeViewer.innerHTML.replace(/#{.+?}#/g,(substring)=>{
            const temp = substring.slice(2,-2).trim();
            let style = utools.isDarkColors()? _darkFormatBlockStyle:_lightFormatBlockStyle;
            if(!temp.startsWith('@')  && !formatManager.contain(temp)){
                style = _errorFormatBlockStyle;
            }
            return style+substring+'</span>'
        })
    }
}
