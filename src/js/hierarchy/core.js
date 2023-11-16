import {configManager} from "../core/config";
import {
    $index,
    $normal,
    $reactive,
    CREATE_VIEW,
    EDIT_VIEW,
    handleRecoverLiteShow,
    LIST_VIEW,
    switchToFullUIMode
} from "../store";
import {DEFAULT_ROOT_HIERARCHY_CONFIG, rootHierachy} from "./h-root";
import {localDirectoryHierarchy} from "./h-local-dir";
import {handleArrayForHierarchy} from "../utils/sort";
import {deleteHub, hierachyHubManager} from "../core/hub";
import {nextTick, toRaw} from "vue";
import {vscodeHierarchy} from "./h-vscode";
import {lowercaseIncludes} from "../utils/common";
import {fullAlias} from "../utils/language";
import {codeSnippetManager} from "../core/snippet";
import {defaultHelpSnippet} from "../some";

export const GLOBAL_HIERARCHY = {
    currentHierarchy: rootHierachy,
    currentPrefixStr: null,
    currentPrefixArray: null,
    /**
     * @type {HierarchyConfig}
     */
    currentConfig: DEFAULT_ROOT_HIERARCHY_CONFIG,
    /**
     * 修改层级
     * @param {"root" | "prev" | "next" | "custom" } mode
     * @param {number} [index]
     */
    changeHierarchy(mode,index){
        switch (mode){
            case "root":
                if($reactive.currentPrefix.length > 0 ){
                    $reactive.currentPrefix = [];
                    $normal.hierarchy.path = [];
                }
                break
            case "prev":
                $reactive.currentPrefix.pop();
                const result = $normal.hierarchy.path.pop();
                if(result){
                    $index.value = result.index;
                }
                break
            case "next":
                // 先判断ref
                if($reactive.currentSnippet.ref === "local"){
                    $normal.hierarchy.path.push({
                        local:true,
                        value: $reactive.currentSnippet.path,
                        index: $index.value
                    })
                }else{
                    $normal.hierarchy.path.push({
                        value: $reactive.currentSnippet.ref,
                        index: $index.value
                    })
                }
                $reactive.currentPrefix.push($reactive.currentSnippet.name)
                // 改变index
                $index.value = 0;
                break
            case "custom":
                const ind = index +1;
                if(ind < $reactive.currentPrefix.length){
                    $reactive.currentPrefix.splice(ind,$reactive.currentPrefix.length)
                    $normal.hierarchy.path.splice(ind,$reactive.currentPrefix.length)
                }
                break
        }
        // 变更 currentHierachy
        if($normal.hierarchy.path && $normal.hierarchy.path.length > 0){
            const temp = $normal.hierarchy.path.at(-1);
            if(temp.local){
                // local dir
                this.currentHierarchy = localDirectoryHierarchy;
            }else{
                if(temp.value){
                    if(temp.value === "vscode"){
                        this.currentHierarchy = vscodeHierarchy;
                        // custom ref
                        // TODO: 动态解析JS文件
                    }
                }else{ // normal
                    // 保持不变
                }
            }
        }else{
            // root
            this.currentHierarchy = rootHierachy;
        }
        // 相应值 改变
        if($reactive.currentPrefix && $reactive.currentPrefix.length > 0){
            this.currentPrefixStr = $reactive.currentPrefix.join('/')
            this.currentPrefixArray = $reactive.currentPrefix.slice()
        }else{
            // root
            this.currentPrefixStr = null;
            this.currentPrefixArray = null;
        }
        hierachyHubManager.changeHub(this.currentPrefixStr)
        // config
        this.currentConfig = this.currentHierarchy.getConfig(this.currentPrefixArray) ?? DEFAULT_ROOT_HIERARCHY_CONFIG;
    },
    /**
     * 改变视图
     * @param {number} view
     * @param {boolean} [refresh] - 对于LIST_VIEW而言，是否需要刷新操作
     */
    changeView(view,refresh){
        $reactive.utools.subItemSelectedIndex = -1;
        //const navigateView = (view,refresh) =>{
        if( view === LIST_VIEW){
            $reactive.currentMode = view;
            nextTick(()=>{
                handleRecoverLiteShow();
            })
            if(refresh){
                $reactive.view.deepRefresh = false;
                nextTick(()=>{
                    $reactive.view.deepRefresh = true
                })
            }
        }else{
            // check permit
            if(view === EDIT_VIEW){
                if(! this.currentConfig.edit){
                    $message.warning("当前目录层级不支持[编辑]操作")
                    return
                }
            }else if(view === CREATE_VIEW){
                if( ! this.currentConfig.create){
                    $message.warning("当前目录层级不支持[创建]操作")
                    return;
                }
            }
            switchToFullUIMode();
            $reactive.currentMode = view;
        }

    },

    /**
     *
     * @param {string} searchWord uTools子搜索框搜索内容
     * @return {CodeSnippet[]}
     */
    search(searchWord){
        let result;
        $normal.subSnippetNum = undefined;
        let name = null;
        if(searchWord == null || searchWord.length === 0){
            $reactive.view.aidTagActive = false;
            $normal.tempTags = [];
            result = this.currentHierarchy.search(this.currentPrefixArray,null)
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
            result = this.currentHierarchy.search(this.currentPrefixArray,name?.toLowerCase())

            if(result && result.snippets){
                // tags
                if(tags !== null && tags.length > 0){
                    tags = tags.map(value => value.toLowerCase())
                    result.snippets = result.snippets.filter(codeSnippet=>{
                        if(codeSnippet.tags == null){
                            return false;
                        }
                        for(const tag of tags){
                            if(lowercaseIncludes(codeSnippet.tags,tag)){
                                return true;
                            }
                        }
                        return false;
                    })
                }
                // type
                if(type !== null){
                    type = fullAlias(type.toLowerCase());
                    result.snippets = result.snippets.filter(codeSnippet=>fullAlias(codeSnippet.type) === type)
                }
            }

        }
        let array;
        // sort
        if(result){
            array = result.snippets ?? [];
            array = handleArrayForHierarchy(array,hierachyHubManager.getTopList(),result.sorted,result.highlighted,name)
        }else{
            array = [];
        }
        if(!configManager.get('closeHelpSnippet')){
            array.unshift(defaultHelpSnippet)
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
    },
    form:{
        /**
         * 判断 代码片段名 是否重复
         * @param {string} name
         */
        containName(name){
            return GLOBAL_HIERARCHY.currentHierarchy.checkNameRepeat?.(GLOBAL_HIERARCHY.currentPrefixArray,name)
        },
        /**
         * 新增或修改 代码片段
         * @param {CodeSnippet} snippet
         * @param {string | null} [oldName]
         */
        createOrEdit(snippet,oldName){
            GLOBAL_HIERARCHY.currentHierarchy.createOrEdit?.(GLOBAL_HIERARCHY.currentPrefixArray,snippet,oldName);
            if(oldName){
                if(oldName !== snippet.name){
                    // update
                    if(!snippet.id){
                        // change hub content
                        hierachyHubManager.renameElment(oldName,snippet.name)
                    }
                }
            }
        }
    },
    /**
     * 更新相关值
     * @param {CodeSnippet} snippet
     * @param {"count&time" | "top" | "sections" | "buffer" } mode
     */
    update(snippet,mode){
        if(snippet === null){
            snippet = $reactive.currentSnippet;
        }
        const key = snippet.id ?? snippet.name;
        switch (mode){
            case "count&time":
                if(GLOBAL_HIERARCHY.currentHierarchy.core){
                    snippet.time = Date.now();
                    snippet.count = (snippet.count??0) +1;
                    codeSnippetManager.update(toRaw(snippet),GLOBAL_HIERARCHY.currentPrefixStr);
                }
                return;
            case "buffer":
                if(GLOBAL_HIERARCHY.currentHierarchy.core){
                    codeSnippetManager.update(toRaw(snippet),GLOBAL_HIERARCHY.currentPrefixStr);
                }
                return;
            case "sections":
                if(GLOBAL_HIERARCHY.currentHierarchy.core){
                    codeSnippetManager.update(toRaw(snippet),GLOBAL_HIERARCHY.currentPrefixStr);
                }else{
                    hierachyHubManager.handleSections(key,snippet.sections)
                }
                return;
            default:
                hierachyHubManager.handleTop(key,"auto")
                return;
        }
    },
    /**
     * 移除代码片段
     * @param {CodeSnippet} snippet
     */
    remove(snippet){
        this.currentHierarchy.remove(this.currentPrefixArray,snippet);
        // 移除 hub数据
        if(snippet.dir){
            // 移除 整个hub
            deleteHub(this.currentPrefixStr)
        }else{
            hierachyHubManager.removeElement(snippet.id??snippet.name)
        }
    }
}