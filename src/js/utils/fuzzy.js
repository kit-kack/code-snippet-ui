import _ from "lodash";
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
                if(_.isArray(result) && result?.length > 0){
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

