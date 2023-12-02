import {configManager} from "../core/config";
import {
    $index,
    $normal,
    $reactive,
    CREATE_VIEW,
    EDIT_VIEW,
    handleRecoverLiteShow,
    LIST_VIEW,
    refreshSearchResult,
    switchToFullUIMode,
    utools_focus_or_blur
} from "../store";
import {DEFAULT_ROOT_HIERARCHY_CONFIG, rootHierachy} from "./h-root";
import {localDirectoryHierarchy} from "./h-local-dir";
import {handleArrayForHierarchy} from "../utils/sort";
import {deleteHub, hierachyHubManager} from "../core/hub";
import {nextTick, toRaw} from "vue";
import {lowercaseIncludes} from "../utils/common";
import {fullAlias} from "../utils/language";
import {codeSnippetManager} from "../core/snippet";
import {defaultHelpSnippet} from "../some";
import {doScrollForListView, doScrollForTopNav} from "../utils/scroller";
import _ from "lodash";

function _loadValidHierarchyJS(path) {
    const hierarchy = window.preload.dynamicLoadJS(path);
    if (hierarchy) {
        // check method
        if(!_.isFunction(hierarchy.search)){
            utools.showNotification('该JS文件导出的对象必须有search方法')
            return null;
        }
    }
    return hierarchy;
}

export const GLOBAL_HIERARCHY = {
    currentHierarchy: rootHierachy,
    currentPrefixStr: null,
    currentPrefixIdStr: null,
    currentPrefixArray: null,
    currentPrefixIdArray: [],
    /**
     * @type {HierarchyConfig}
     */
    currentConfig: DEFAULT_ROOT_HIERARCHY_CONFIG,
    /**
     * 修改层级
     * @param {"root" | "prev" | "next" | "custom" | "redirect" } mode
     * @param {any} [param] custom-number:指定索引位，redirect-string:指定前缀
     */
    changeHierarchy(mode,param){
        switch (mode){
            case "root":
                if($reactive.currentPrefix.length > 0 ){
                    $reactive.currentPrefix = [];
                    $normal.hierarchy.path = [];
                    this.currentPrefixIdArray = [];
                }
                break
            case "prev":
                $reactive.currentPrefix.pop();
                this.currentPrefixIdArray.pop()
                const result = $normal.hierarchy.path.pop();
                if(result){
                    $index.value = result.index;
                    $normal.keepSelectedStatus = true;
                    // doScrollForListView();
                }
                break
            case "redirect":
                // clear
                if($reactive.currentPrefix.length > 0 ){
                    $reactive.currentPrefix = [];
                    $normal.hierarchy.path = [];
                    this.currentPrefixIdArray = [];
                }
                // 只是h-root的导向
                if(param !== null){
                    for (const prefix of param.split('/')) {
                        $normal.hierarchy.path.push({
                            index: 0
                        })
                        $reactive.currentPrefix.push(prefix)
                        this.currentPrefixIdArray.push(prefix)
                    }
                }
                // redirect后续逻辑同next
            case "next":
                // 先判断ref
                switch ($reactive.currentSnippet.ref) {
                    case "local":
                        $normal.hierarchy.path.push({
                            local:true,
                            value: $reactive.currentSnippet.path,
                            index: $index.value
                        })
                        break
                    case "custom":
                        $normal.hierarchy.path.push({
                            value: $reactive.currentSnippet.path,
                            index: $index.value
                        })
                        break
                    default:
                        $normal.hierarchy.path.push({
                            index: $index.value
                        })
                        break
                }
                $reactive.currentPrefix.push($reactive.currentSnippet.name)
                this.currentPrefixIdArray.push(this.currentHierarchy.core? $reactive.currentSnippet.id : $reactive.currentSnippet.name)
                // 改变index
                $index.value = 0;
                doScrollForListView();
                doScrollForTopNav();
                break
            case "custom":
                const ind = param +1;
                if(ind < $reactive.currentPrefix.length){
                    $reactive.currentPrefix.splice(ind,$reactive.currentPrefix.length)
                    $normal.hierarchy.path.splice(ind,$reactive.currentPrefix.length)
                    this.currentPrefixIdArray.splice(ind,$reactive.currentPrefix.length)
                }
                break
        }
        // 变更 currentHierachy
        if($normal.hierarchy.path && $normal.hierarchy.path.length > 0){
            const temp = $normal.hierarchy.path.at(-1);
            if(temp.local){
                // local dir
                this.currentHierarchy = localDirectoryHierarchy;
            }else if(temp.value) {
                this.currentHierarchy = _loadValidHierarchyJS(temp.value)
                // null
                if (this.currentHierarchy === null) {
                    this.currentHierarchy = rootHierachy;
                }
            }else{ // normal
                // 保持不变
            }
        }else{
            // root
            this.currentHierarchy = rootHierachy;
        }
        // 相应值 改变
        if($reactive.currentPrefix && $reactive.currentPrefix.length > 0){
            this.currentPrefixStr = $reactive.currentPrefix.join('/')
            this.currentPrefixArray = $reactive.currentPrefix.slice()
            this.currentPrefixIdStr = this.currentPrefixIdArray.join('/')
        }else{
            // root
            this.currentPrefixStr = null;
            this.currentPrefixArray = null;
            this.currentPrefixIdStr = null
        }
        hierachyHubManager.changeHub(this.currentPrefixIdStr)
        // config
        this.currentConfig = this.currentHierarchy.getConfig?.(this.currentPrefixArray) ?? {};
        if(mode === "redirect"){
            utools_focus_or_blur(true)
        }else{
            // clear utools input
            utools.setSubInputValue('')
            utools_focus_or_blur(false)
        }
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
                // refreshListView();
                refreshSearchResult();
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
            }else{ // CODE_VIEW
                // cache id
                $normal.lastQueryCodeSnippetId = $reactive.currentSnippet.id ?? $reactive.currentSnippet.name;
            }
            switchToFullUIMode();
            $reactive.currentMode = view;
        }

    },

    /**
     *
     * @param {string} searchWord uTools子搜索框搜索内容
     */
    async search(searchWord){
        let result;
        $normal.subSnippetNum = undefined;
        let name = null;
        if(searchWord == null || searchWord.length === 0){
            $reactive.view.aidTagActive = false;
            $normal.tempTags = [];
            try{
                result = await this.currentHierarchy.search(this.currentPrefixArray,null,hierachyHubManager.getTopList())
                if(_.isArray(result)){
                    result = {
                        snippets: result
                    }
                }
            }catch (e) {
                utools.showNotification(e.message)
            }

        }else{
            const words = searchWord.split(/\s/).filter(v=>v.length>=1)
            let type = null;
            let tags = [];
            let tagFlag = false;
            for (let word of words) {
                if(word[0] === '@'){
                    if(word.length !== 1){
                        type = word.slice(1)
                    }else{
                        type = '';
                    }
                }else if(word[0] === '#'){
                    if(word.length !== 1){
                        tags.push(word.slice(1))
                    }else{
                        tagFlag = true;
                    }
                }else{
                    if(configManager.get('beta_sub_snippet_search')){
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
            if(name){
                name = name.toLowerCase()
            }
            $reactive.view.aidTagActive = (tagFlag && configManager.get('beta_tag_aid_choose'));
            $normal.tempTags = tags;
            try{
                result = await this.currentHierarchy.search(this.currentPrefixArray,name,hierachyHubManager.getTopList())
                if(_.isArray(result)){
                    result = {
                        snippets: result
                    }
                }
            }catch (e) {
                utools.showNotification(e.message)
            }
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
                    if (type.length === 0) {
                        result.snippets = result.snippets.filter(snippet => snippet.dir)
                    }else{
                        type = fullAlias(type.toLowerCase());
                        result.snippets = result.snippets.filter(codeSnippet=>fullAlias(codeSnippet.type) === type)
                    }
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
        // only appear : root & no-search & readme_close
        if(!configManager.get('readme_close') ){
            if(!this.currentPrefixIdStr && !searchWord){
                array.unshift(defaultHelpSnippet)
            }
        }
        // 判断 keepSelectedStatus ，如果为true，需要保留selectIndex位置
        // 由于默认keepSelectedStatus为true，则selectIndex可能为非法，这时候需要忽视keepSelectedStatus
        // 只有当 删除/添加/搜索操作时，会将keepSelectedStatus置为false
        if( $index.value<0 || $index.value>=array.length ||   !$normal.keepSelectedStatus){
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
            // utools.subInputFocus();
            // $reactive.utools.focused = true;
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
            // 处理 keyword，只允许h-root
            if(!GLOBAL_HIERARCHY.currentHierarchy.core){
                snippet.keyword = undefined;
            }
            try{
                GLOBAL_HIERARCHY.currentHierarchy.createOrEdit?.(GLOBAL_HIERARCHY.currentPrefixArray,snippet,oldName);
            }catch (e){
                $message.error(e.message)
            }
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
                    codeSnippetManager.update(toRaw(snippet),GLOBAL_HIERARCHY.currentPrefixIdStr);
                }
                return;
            case "buffer":
                if(GLOBAL_HIERARCHY.currentHierarchy.core){
                    codeSnippetManager.update(toRaw(snippet),GLOBAL_HIERARCHY.currentPrefixIdStr);
                }
                return;
            case "sections":
                if(GLOBAL_HIERARCHY.currentHierarchy.core){
                    codeSnippetManager.update(toRaw(snippet),GLOBAL_HIERARCHY.currentPrefixIdStr);
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
        try{
            this.currentHierarchy.remove?.(this.currentPrefixArray,snippet);
        }catch (e){
            $message.error(e.message)
        }

        // 移除 hub数据
        if(snippet.dir){
            // 移除 整个hub
            if(this.currentPrefixIdStr){
                deleteHub(this.currentPrefixIdStr+'/'+(snippet.id??snippet.name))
            }else{
                deleteHub(snippet.id)
            }

        }else{
            hierachyHubManager.removeElement(snippet.id??snippet.name)
        }
    }
}