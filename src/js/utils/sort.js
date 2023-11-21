import {configManager} from "../core/config";
import {match} from "./fuzzy";
import {$reactive} from "../store";

/**
 * 根据属性产生对应的排序函数
 * @param {string} property
 * @private
 */
function _compare(property){
    return function (a,b){
        if(a[property] == null){
            return (b[property] == null)? a.name.localeCompare(b.name) : 1;
        }else if(b[property] == null){
            return -1;
        }else{
            if( a[property] > b[property]){
                return -1;
            }else if(a[property] < b[property]){
                return 1;
            }else{
                return a.name.localeCompare(b.name);
            }
        }
    }
}
const CREATE_TIME_COMPARE = _compare("createTime");
const TIME_COMPARE = _compare("time");
const COUNT_COMPARE  = _compare("count");

export function handleArrayForHierarchy(list,topList,sorted,highlighted,name){
    // 筛选出 置顶列表中的片段
    const topSnippets = [];
    const now = $reactive.utools.search + '-' + Date.now();
    const needHighlight = name && !highlighted;
    if(topList && topList.length > 0){
        list = list.filter(snippet =>{
            if(needHighlight){
                snippet.temp = match(name,snippet.name);
            }
            const id = snippet.id ?? snippet.name;
            snippet.now = now + '-' + id;
            const index = topList.indexOf(id);
            if(index === -1){
                snippet.index = undefined;
                return true;
            }else{
                snippet.index = index;
                topSnippets.push(snippet)
                return false;
            }
        })
    }else{
        list.forEach(snippet =>{
            if(needHighlight){
                snippet.temp = match(name,snippet.name);
            }
            snippet.now = now + '-' + snippet.id + '-' + snippet.name;
            snippet.index = undefined;
        })
    }
    // 对 topSnippets进行排序
    topSnippets.sort((a,b)=> a.index - b.index)
    if(!sorted){
        switch (configManager.getSortKey()){
            case 0:   // 创建时间
                list.sort(CREATE_TIME_COMPARE)
                break;
            case 1:   // 最近访问时间
                list.sort(TIME_COMPARE)
                break;
            case 2:  // 粘贴使用次数
                list.sort(COUNT_COMPARE)
                break;
            default:  // 自然排序
                list.sort((a,b)=>a.name.localeCompare(b.name))
                break;
        }
    }
    return topSnippets.concat(list);
}