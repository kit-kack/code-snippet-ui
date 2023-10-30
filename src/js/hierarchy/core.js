import {configManager} from "../core/config";
import {$index, $normal, $reactive} from "../store";
import {defaultHierarchy} from "./h-root";
import {localDirectoryHierarchy} from "./h-local-dir";
import {getSortedArray} from "../utils/sort";
import {match} from "../utils/fuzzy";


/**
 * @param {string[] } prefix
 * @return Hierarchy
 * @private
 */
function _getHierarchySearch(prefix){
    if(prefix && prefix.length !== 0){
        console.log($reactive.currentSnippet)
        return localDirectoryHierarchy;
    }
    return defaultHierarchy;
}
export const GLOBAL_HIERARCHY = {
    /**
     *
     * @param {string} searchWord uTools子搜索框搜索内容
     * @param {string[] } prefix 当前前缀
     * @return {CodeSnippet[]}
     */
    search(searchWord,prefix){
        let result;
        $normal.subSnippetNum = undefined;
        const hierarchy = _getHierarchySearch(prefix);
        let name = null;
        if(searchWord == null || searchWord.length === 0){
            $reactive.view.aidTagActive = false;
            $normal.tempTags = [];
            result = hierarchy.search(null,null,null)
        }else{
            const words = searchWord.split(/\s/).filter(v=>v.length>=1)
            let type = null;
            let tags = [];
            let tagFlag = false;
            for (let word of words) {
                if(word[0] === '@'){
                    if(word.length !== 1){
                        type = word.slice(1)
                    }
                }else if(word[0] === '#'){
                    if(word.length !== 1){
                        tags.push(word.slice(1))
                    }else{
                        tagFlag = true;
                    }
                }else{
                    if(configManager.get('allowSearchSubSnippet')){
                        const index = word.lastIndexOf('$')
                        if(index !== -1){
                            name = word.slice(0,index)
                            $normal.subSnippetNum = (+word.slice(index+1))??1;
                        }else{
                            name =  word;
                        }
                    }else{
                        name = word;
                    }
                }
            }
            $reactive.view.aidTagActive = (tagFlag && configManager.get('aidTagSelect'));
            $normal.tempTags = tags;
            result = hierarchy.search(name?.toLowerCase(),tags,type)
        }
        let array;
        // sort
        if(result){
            array = result.snippets ?? [];
            if(!result.sorted){
                array = getSortedArray(array);
            }
            if(name && !result.highlighted){
                for (let codeSnippet of array) {
                    codeSnippet.temp = match(name,codeSnippet);
                }
            }
        }else{
            array = [];
        }
        // 判断 keepSelectedStatus ，如果为true，需要保留selectIndex位置
        // 由于默认keepSelectedStatus为true，则selectIndex可能为非法，这时候需要忽视keepSelectedStatus
        // 只有当 删除/添加/搜索操作时，会将keepSelectedStatus置为false
        if( $index.value<0 || $index.value>=array.length ||   $normal.keepSelectedStatus===null){
            $index.value = (array.length===0)? -1: 0;
        }
        // else if($normal.keepSelectedStatus){
        // nextTick(()=>{
        //     // 校准位置
        //     console.log('go to the last position')
        //     setTimeout(()=>{
        //         gotoTheLastPosition();
        //     })
        // })
        // }
        $reactive.utools.subItemSelectedIndex = -1;
        // 重置
        // $normal.keepSelectedStatus = false;
        // 控制tip显示策略
        $reactive.view.onlyOne =  array.length === 1;

        // 控制界面高度
        if(array.length === 0){
            if(!$reactive.view.fullScreenShow){
                utools.setExpendHeight($reactive.view.aidTagActive? 65:0)
            }
        }
        return array;
    }
}