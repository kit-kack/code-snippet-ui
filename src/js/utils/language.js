import hljs from "../dep/highlight-dep";

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
        case 'dt':
            return 'dart';
        case 'f#':
            return 'fsharp';
        case 'img':
            return 'image';
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
        case 'text':
        case 'txt':
            return 'plaintext';
        case 'yml':
            return 'yaml';
        default:
            return type;
    }
}

/**
 * 代码片段类型映射到合法的文件名
 * @param {string} type
 * @return {string}
 */
export function convertValidFileSuffix(type){
    if(type.length > 2 && type.startsWith('x-')){
        type = type.slice(2);
    }
    type = type.trim().toLowerCase();
    switch (type){
        case 'c#':
        case 'csharp':
            return 'cs';
        case 'c++':
            return 'cpp';
        case 'dart':
            return 'dt';
        case 'f#':
        case 'fsharp':
            return 'fs';
        case 'javascript':
            return 'js';
        case 'kotlin':
            return 'kt'
        case 'markdown':
            return 'md';
        case 'objective-c':
        case 'object-c':
        case 'objectivec':
            return 'm';
        case 'python':
            return 'py';
        case 'typescript':
            return 'ts';
        case 'text':
        case 'plaintext':
            return 'txt';
        default:
            return type;
    }
}

export function fullAlias(type){
    if(type.length>2 && type.startsWith('x-')){
        return 'x-'+_alias(type.slice(2))
    }else {
        return _alias(type);
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