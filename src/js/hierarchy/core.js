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
import {codeSnippetManager} from "../core/snippet";
import {defaultHelpSnippet} from "../some";
import {doScrollForListView, doScrollForTopNav} from "../utils/scroller";
import {resolveSearchWord} from "../utils/resolve"
import {isFunction as _isFunction, isArray as _isArray } from "lodash-es";


export function loadValidHierarchyJS(path) {
    const hierarchy = window.preload.dynamicLoadJS(path);
    if (hierarchy) {
        // check method
        if(!_isFunction(hierarchy.search)){
            utools.showNotification('该JS文件导出的对象必须有search方法')
            return null;
        }
        // conf permit write
        Object.defineProperty(hierarchy,"conf",{
            writable:false,
            configurable: false
        })
    }
    return hierarchy;
}
const EXT = Object.freeze({
    getTopList(){
        return hierachyHubManager.currentClonedTopList;
    },
    store(name,obj){
        return hierachyHubManager.handle_desc_tags_type(name,obj)
    }
})

export const GLOBAL_HIERARCHY = {
    currentHierarchy: rootHierachy,
    currentPrefixIdStr: null,
    currentPrefixSnippetArray: [],
    // currentPrefixSnippetArray副本
    currentPrefixSnippetArrayTemp: [],
    /**
     * @type {HierarchyConfig}
     */
    currentConfig: DEFAULT_ROOT_HIERARCHY_CONFIG,
    lastSearchResult: null,
    /**
     * 修改层级
     * @param {"root" | "prev" | "next" | "custom" | "redirect" } mode
     * @param {any} [param] custom-number:指定索引位，redirect-string:指定前缀
     */
    changeHierarchy(mode,param){
        this.lastSearchResult = null;
        switch (mode){
            case "root":
                if($reactive.currentPrefix.length > 0 ){
                    $reactive.currentPrefix = [];
                    $normal.hierarchyPath = [];
                    this.currentPrefixSnippetArray = [];
                }
                break
            case "prev":
                $reactive.currentPrefix.pop();
                this.currentPrefixSnippetArray.pop()
                const result = $normal.hierarchyPath.pop();
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
                    $normal.hierarchyPath = [];
                    this.currentPrefixSnippetArray = [];
                }
                // 只是h-root的导向
                if(param !== null){
                    for (const prefix of param.split('/')) {
                        $normal.hierarchyPath.push({
                            index: 0
                        })
                        // TODO: 这里将 id 设为 prefix，可能会导致一些显示方面的问题
                        $reactive.currentPrefix.push(prefix)
                        this.currentPrefixSnippetArray.push({
                            id: prefix,
                            dir: true
                        })
                    }
                }
                // redirect后续逻辑同next
            case "next":
                // 先判断ref
                switch ($reactive.currentSnippet.ref) {
                    case "local":
                        $normal.hierarchyPath.push({
                            local:true,
                            value: $reactive.currentSnippet.path,
                            index: $index.value
                        })
                        break
                    case "custom":
                        $normal.hierarchyPath.push({
                            value: $reactive.currentSnippet.path,
                            index: $index.value
                        })
                        break
                    default:
                        $normal.hierarchyPath.push({
                            index: $index.value
                        })
                        break
                }
                $reactive.currentPrefix.push($reactive.currentSnippet.name)
                this.currentPrefixSnippetArray.push(toRaw($reactive.currentSnippet))
                // 改变index
                $index.value = 0;
                doScrollForListView();
                doScrollForTopNav();
                break
            case "custom":
                const ind = param +1;
                if(ind < $reactive.currentPrefix.length){
                    $reactive.currentPrefix.splice(ind,$reactive.currentPrefix.length)
                    $normal.hierarchyPath.splice(ind,$reactive.currentPrefix.length)
                    this.currentPrefixSnippetArray.splice(ind,$reactive.currentPrefix.length)
                }
                break
        }
        // 变更 currentHierachy
        if($normal.hierarchyPath && $normal.hierarchyPath.length > 0){
            const temp = $normal.hierarchyPath.at(-1);
            if(temp.local){
                // local dir
                this.currentHierarchy = localDirectoryHierarchy;
            }else if(temp.value && mode !== 'prev') {
                this.currentHierarchy = loadValidHierarchyJS(temp.value)
                if(this.currentHierarchy){
                    // init
                    if(this.currentHierarchy.init){
                        try{
                            this.currentHierarchy.init(toRaw($reactive.currentSnippet.conf))
                        }catch (e){
                            $message.error(e.toString())
                            this.currentHierarchy = rootHierachy;
                        }
                    }
                }else{ // null
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
            let id = ""
            for(const snippet of this.currentPrefixSnippetArray){
                id += (snippet.id ?? snippet.name) + '/'
            }
            this.currentPrefixIdStr = id.slice(0,-1)
        }else{
            this.currentPrefixIdStr = null
        }
        this.currentPrefixSnippetArrayTemp = this.currentPrefixSnippetArray.slice()
        hierachyHubManager.changeHub(this.currentPrefixIdStr)
        // config
        this.currentConfig = this.currentHierarchy.getConfig?.(this.currentPrefixSnippetArrayTemp) ?? {};
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
                $normal.md.pre = null;
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
        $normal.beta.subSnippetNum = undefined;
        let name = null;
        let type = null;
        let tags = null;
        if(searchWord == null || searchWord.length === 0){
            $reactive.main.aidTagActive = false;
            $reactive.main.selectedTag = null;
            try{
                $reactive.utools.vimDisabled = true;
                if(this.lastSearchResult) {
                    result = this.lastSearchResult;
                }else{
                    result = await this.currentHierarchy.search(this.currentPrefixSnippetArrayTemp,null,EXT)
                }
                if(_isArray(result)){
                    result = {
                        snippets: result
                    }
                }
                // cache
                if(result.unfiltered && this.lastSearchResult!== result){
                    this.lastSearchResult = result;
                }
            }catch (e) {
                $message.error(e.toString())
                utools.showNotification(e.toString())
            }finally {
                $reactive.utools.vimDisabled = false;
            }

        }else{
            const aspects = resolveSearchWord(searchWord)
            if (aspects.word){
                if(configManager.get('beta_sub_snippet_search')){
                    const index = aspects.word.lastIndexOf('$')
                    if(index !== -1){
                        $normal.beta.subSnippetNum = (+aspects.word.slice(index+1))??1;
                        aspects.word = aspects.word.slice(0,index).trim()
                    }
                }
            }
            name = aspects.word
            type = aspects.type
            tags = aspects.tag
            $reactive.main.selectedTag = aspects.tag?? null;
            try{
                $reactive.utools.vimDisabled = true;
                if(this.lastSearchResult){
                    result = this.lastSearchResult;
                }else{
                    result = await this.currentHierarchy.search(this.currentPrefixSnippetArrayTemp,name,EXT)
                }
                if(_isArray(result)){
                    result = {
                        snippets: result
                    }
                }
                // cache
                if(result.unfiltered && this.lastSearchResult!== result){
                    this.lastSearchResult = result;
                }
            }catch (e) {
                $message.error(e.toString())
                utools.showNotification(e.toString())
            }finally {
                $reactive.utools.vimDisabled = false;
            }
        }
        let array;
        // sort
        if(result){
            array = handleArrayForHierarchy(result,name,tags,type)
        }else{
            array = [];
        }
        // only appear : root & no-search & !readme_close
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
        $reactive.main.isOnlyOneElement =  array.length === 1;

        // 控制界面高度
        if(array.length === 0){
            // utools.subInputFocus();
            // $reactive.utools.focused = true;
            if(!$reactive.main.isFullScreenShow){
                utools.setExpendHeight($reactive.main.aidTagActive? 65:0)
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
            return GLOBAL_HIERARCHY.currentHierarchy.checkNameRepeat?.(GLOBAL_HIERARCHY.currentPrefixSnippetArrayTemp,name)
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
            // 处理 desc
            if(snippet.desc){
                if(snippet.desc.trim().length === 0){
                    snippet.desc = undefined;
                }
            }else {
                snippet.desc = undefined;
            }
            try{
                GLOBAL_HIERARCHY.currentHierarchy.createOrEdit?.(GLOBAL_HIERARCHY.currentPrefixSnippetArrayTemp,snippet,oldName,EXT);
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
                    hierachyHubManager.handleSections(key,toRaw(snippet.sections))
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
            this.currentHierarchy.remove?.(this.currentPrefixSnippetArrayTemp,snippet);
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