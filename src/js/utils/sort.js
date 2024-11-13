import {configManager} from "../utools/config";
import {match} from "./fuzzy";
import {$reactive} from "../store";
import {hierachyHubManager} from "../utools/hub";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {lowercaseIncludes} from "./common";
import {fullAlias} from "./language";
import {isEmpty as _isEmpty} from "lodash-es"

/**
 * 根据属性产生对应的排序函数
 * @param {string} property
 * @private
 */
function _compare(property){
    return function (a,b){
        // first compare matchType
        const result = (a.matchType ?? 0) - (b.matchType ?? 0);
        if(result !== 0){
            return result;
        }
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
const NORMAML_COMPARE = (a,b) =>{
    const result = (a.matchType ?? 0) - (b.matchType ?? 0)
    if(result === 0){
        return a.name.localeCompare(b.name);
    }else{
        return result;
    }
}



/**
 * 智能排序 先根据匹配程度排序，然后再匹配相应排序方法
 * @param {CodeSnippet[]} snippets
 * @param {number} searchWordCount
 */
function intelligentSort(snippets,searchWordCount){
    // 收集信息
    for (const snippet of snippets) {
        if(searchWordCount > 0){
            // match
            if(snippet.matchType >= 1){
                snippet.matchPercent = 0;
            }else{
                snippet.matchPercent = Math.round( searchWordCount / snippet.name.length * 100);
            }
        }
    }
    let lateCompareFunc;
    switch (configManager.getSortKey()){
        case 0:
            lateCompareFunc = CREATE_TIME_COMPARE;
            break;
        case 1:
            lateCompareFunc = TIME_COMPARE;
            break;
        case 2:
            lateCompareFunc = COUNT_COMPARE;
            break;
        default:
            lateCompareFunc = NORMAML_COMPARE;
            break;
    }
    snippets.sort((a,b)=>{
        const aWinFlag = a.matchPercent >= 67;
        const bWinFlag = b.matchPercent >= 67;
        if(aWinFlag){
            if(bWinFlag){
                return  b.matchPercent - a.matchPercent
            }else{
                return -1;
            }
        }else if(bWinFlag){
            return 1;
        }else{
            return lateCompareFunc(a,b);
        }
    })

}


/**
 *
 * @param result
 * @param {Record<"word"|"type"|"tag" | "fuzzyType" | "fuzzyTag",string | null>} aspects
 * @return {*[]}
 */
export function handleArrayForHierarchy(result,aspects){
    $reactive.main.tagSet.clear();
    if(_isEmpty(result.snippets)){
        return [];
    }
    if(aspects.type){
        aspects.type = fullAlias(aspects.type.toLowerCase());
    }
    if(aspects.tag){
        aspects.tag = aspects.tag.toLowerCase();
    }
    // 筛选出 置顶列表中的片段
    const topSnippets = [];
    const normalSnippets = [];
    const timeStamp = Date.now();
    const now = $reactive.utools.search + '-' + timeStamp;
    const nameFilter = aspects.word && result.unfiltered;
    const needHighlight = aspects.word && !result.highlighted && !nameFilter;
    const topList = hierachyHubManager.getTopList();
    const snippetHub = hierachyHubManager.currentHub.snippets;
    const override_support = snippetHub && !GLOBAL_HIERARCHY.currentHierarchy.core
    const betaDescSearch = !configManager.get('beta_wide_desc_close');
    const betaContentSearchClose = configManager.get('beta_wide_content_close');
    const betaSearch = (betaDescSearch || !betaContentSearchClose);
    for (const snippet of result.snippets) {
        /**
         * @type {Snippet}
         */
        const item = {...snippet}
        const id = snippet.id ??snippet.name;
        item.now = now + '-' + id;
        // properties override
        if(override_support){
            const snippetData = snippetHub[id];
            if(snippetData){
                for (const key in snippetData) {
                    if(snippetData[key]){
                        item[key] = snippetData[key]
                    }
                }
            }
        }
        // name filter
        if(nameFilter){
            const result = match(aspects.word,item.name)
            if(result !== null){
                item.temp = result;
            }else if(betaSearch){
                // desc
                if(betaDescSearch && item.desc){
                    if(item.desc.toLowerCase().includes(aspects.word)){
                        item.matchType = 1;
                    }
                }else if(betaContentSearchClose || item.dir || item.path || item.link){
                    continue;
                }else if(item.code && item.code.toLowerCase().includes(aspects.word)){
                    item.matchType = 2;
                }else{
                    continue;
                }
            }
        }
        // type filter
        if(aspects.type === ''){
            if(!item.dir){
                continue;
            }
        }else if(aspects.type){
            if(aspects.type === '@'){
                if(!item.link){
                    continue;
                }
            }else{
                const itemType = fullAlias(item.type).toLowerCase();
                if(aspects.fuzzyType){
                    if(!itemType.includes(aspects.type)){
                        continue;
                    }
                }else if(itemType !== aspects.type){
                    continue
                }
            }
        }
        // tags filter
        if(aspects.tag){
            if(item.tags){
                if(!lowercaseIncludes(item.tags,aspects.tag,aspects.fuzzyTag)){
                    continue;
                }
            }else{
                continue;
            }
        }

        if(needHighlight){
            item.temp = match(name,snippet.name);
        }

        // top
        const index = topList.indexOf(id);
        if(index === -1){
            item.index = undefined;
            normalSnippets.push(item)
        }else{
            item.index = index;
            topSnippets.push(item);
        }
    }
    // 对 topSnippets进行排序
    topSnippets.sort((a,b)=> a.index - b.index)
    if(!result.sorted){
        intelligentSort(normalSnippets,name == null ? 0 : name.length)
    }
    const finalArray = topSnippets.concat(normalSnippets);
    // 收集tag
    for (const finalArrayElement of finalArray) {
        // collect snippet tag
        if(finalArrayElement.tags){
            for (const tag of finalArrayElement.tags) {
                $reactive.main.tagSet.add(tag)
            }
        }
    }
    return finalArray;
}