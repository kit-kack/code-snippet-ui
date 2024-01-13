import {isArray as _isArray} from "lodash-es"
import {configManager} from "../core/config";
import {$normal} from "../store";
const chineseRegex=/[\u4E00-\u9FA5]/

/**
 *
 * @param {string} query - 已经小写化
 * @param {string} target - 已经小写化
 * @param {boolean} [chineseMatchDisabled] - 禁用中文匹配
 */
function advancedFuzzyCompare(query,target,chineseMatchDisabled){
    if(query.length > target.length){
        return null;
    }
    const q_max = query.length;
    const t_max = target.length;
    const offset_result = [];
    let q_index = 0;
    let t_index = 0;
    while (q_index < q_max){
        const q = query[q_index];
        const isChinese = chineseRegex.test(q)
        while (t_index < t_max){
            const t = target[t_index]
            if(chineseMatchDisabled || isChinese){
                if(q === t){
                    offset_result.push(t_index);
                    // break
                    break
                }
            }else{
                const result = window.pinyinUtil.getFirstLetter(t,true);
                if(_isArray(result) && result?.length > 0){
                    if(result.findIndex(item => item.toLowerCase() === q) !== -1){
                        offset_result.push(t_index);
                        // break
                        break
                    }
                }
            }
            t_index++;
        }
        if(t_index >= t_max){
            // target 遍历完成
            break;
        }else{
            t_index++;
        }
        q_index++;
    }
    if(offset_result.length === 0 || q_index < q_max){
        return null
    }
    return offset_result;
}

/**
 *
 * @param {string} query 需要提前转小写
 * @param {string} target 原本文字
 */
export function match(query,target){
    if(!query){
        return null;
    }
    const temp = target.toLowerCase();
    // 1. 普通比较
    if(temp.includes(query)){
        return target.replace(new RegExp(query,"i"),'<b>$&</b>');
    }else{
        const offsets = advancedFuzzyCompare(query,temp);
        if(offsets){
            // 拆分替换
            const charArray = target.split('')
            for (let offset of offsets) {
                charArray[offset] ='<b>'+charArray[offset]+'</b>';
            }
            return charArray.join('');
        }
    }
    return null;
}


/**
 * @param {string} searchWord
 */
export function resolveSearchWord(searchWord){
    const tags = [];
    let type;
    let tagFlag = false;
    let lastBlock= 0;
    let word = searchWord.split(/\s/)
        .filter(v=>{
            if(v){
                const first = v[0];
                // @
                if(first === '@'){
                    type = v.slice(1);
                    lastBlock = 1;
                }else if(first === '#'){
                    if (v.length !== 1) {
                        tags.push(v.slice(1))
                        lastBlock = 2;
                    }else{
                        tagFlag = true;
                    }
                }else{
                    if(lastBlock){
                        const last = v[v.length-1];
                        if(lastBlock === 1){
                            if(last === '@'){
                                type = type + ' ' + v.slice(0,v.length-1);
                                return false
                            }
                        }else if(lastBlock === 2){
                            if(last === '#'){
                                tags[tags.length - 1] = tags.at(-1) + ' ' + v.slice(0,v.length-1);
                                return false
                            }
                        }
                    }
                    return true;
                }
            }
        })
        .join(' ');
    if(configManager.get('beta_sub_snippet_search')){
        const index = word.lastIndexOf('$')
        if(index !== -1){
            $normal.beta.subSnippetNum = (+word.slice(index+1))??1;
            word = word.slice(0,index)
        }
    }
    if(word){
        word = word.trim().toLowerCase();
    }
    console.log({word,type,tagFlag,tags})
    return {word,type,tagFlag,tags}
}

