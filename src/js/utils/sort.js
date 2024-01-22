import {configManager} from "../core/config";
import {match} from "./fuzzy";
import {$reactive} from "../store";
import {hierachyHubManager} from "../core/hub";
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


export function handleArrayForHierarchy(result,name,tag,type){
    $reactive.main.tagSet.clear();
    if(_isEmpty(result.snippets)){
        return [];
    }
    if(type){
        type = fullAlias(type.toLowerCase());
    }
    if(tag){
        tag = tag.toLowerCase();
    }
    // 筛选出 置顶列表中的片段
    const topSnippets = [];
    const normalSnippets = [];
    const now = $reactive.utools.search + '-' + Date.now();
    const nameFilter = name && result.unfiltered;
    const needHighlight = name && !result.highlighted && !nameFilter;
    const topList = hierachyHubManager.getTopList();
    const snippetHub = hierachyHubManager.currentHub.snippets;
    const override_support = snippetHub && !GLOBAL_HIERARCHY.currentHierarchy.core

    for (const snippet of result.snippets) {
        const item = {...snippet}
        // name filter
        if(nameFilter){
            const result = match(name,snippet.name)
            if(result !== null){
                item.temp = result;
            }else{
                continue;
            }
        }
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
        // type filter
        if(type === ''){
            if(!item.dir){
                continue;
            }
        }else if(type){
            if(type === '@'){
                if(!item.link){
                    continue;
                }
            }else{
                if(fullAlias(item.type).toLowerCase()!== type){
                    continue
                }
            }
        }
        // tags filter
        if(tag){
            if(item.tags){
                if(!lowercaseIncludes(item.tags,tag)){
                    continue;
                }
            }else{
                continue;
            }
        }
        // collect snippet tag
        if(item.tags){
            for (const tag of item.tags) {
                $reactive.main.tagSet.add(tag)
            }
        }

        if(needHighlight){
            item.temp = match(name,snippet.name);
        }

        // top
        const index = topList.indexOf(id);
        if(index === -1){
            normalSnippets.push(item)
        }else{
            item.index = index;
            topSnippets.push(item);
        }

    }

    // 对 topSnippets进行排序
    topSnippets.sort((a,b)=> a.index - b.index)
    if(!result.sorted){
        switch (configManager.getSortKey()){
            case 0:   // 创建时间
                normalSnippets.sort(CREATE_TIME_COMPARE)
                break;
            case 1:   // 最近访问时间
                normalSnippets.sort(TIME_COMPARE)
                break;
            case 2:  // 粘贴使用次数
                normalSnippets.sort(COUNT_COMPARE)
                break;
            default:  // 自然排序
                normalSnippets.sort((a,b)=>a.name.localeCompare(b.name))
                break;
        }
    }
    return topSnippets.concat(normalSnippets);
}