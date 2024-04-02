import {nextTick, reactive, ref} from "vue";
import {configManager} from "./utools/config";
// 主界面
const LIST_VIEW = 0;
// 代码预览界面
const CODE_VIEW = 1;
// 编辑界面
const EDIT_VIEW = 2;
// 创建界面
const CREATE_VIEW = 3;

/**
 * 非响应式全局变量
 */
const $normal = {
    // TODO id可能有重复的情况
    lastQueryCodeSnippetId: null,
    recoverLiteShow: false,   // 是否恢复为 列表UI
    recoverLiteHeight: 0,      // 恢复为列表UI的高度
    // 主题
    theme: null,
    // 控制滚动
    scroll:{
        // 控制CodeView滚动
        codeHorizontalInvoker: null, //
        codeVerticalInvoker: null, //
        sideCodeHorizontalInvoker: null,  // 控制侧边滚动
        sideCodeVerticalInvoker: null, //
        itemCodeInvoker: null,   // 控制多行代码块滚动
        hierarchyInvoker: null,  // 控制topNav
        virtualInvoker: null , // 控制 virtual scroll
        helpInvoker: null,    // 【快捷方式】控制的滚动
    },
    // Vim模式下空格执行的程序
    spaceInvoker: [],
    /**
     * 层级路径
     * @type {{
     *     local?: boolean,
     *     value: string,
     *     index: number
     * }[]}
     */
    hierarchyPath: [],
    // ------- 控制 选中元素 保持记忆功能 --------
    /**
     * 下面两者都是控制 选中元素 保持记忆功能
     * keepSelectedStatus
     * 控制 $index是否维持原值,同时滚动至原地点；
     * 当utools搜索变更、创建新元素、以及某元素已改名时为false，即不保持记忆，此时$index = 0,滚动至开头
     *
     * rollbackToOriginWhenRefresh
     * 解决上面滚动至原地点时遇到列表后四个元素时，滚动错位问题，为了解决直接滚动到底部；
     * 滚动到底部是在doScrollForListView中实现，为了避免正常vim上下操作滚动，rollbackToOriginWhenRefresh只有在主动刷新场景下为true
     */
    keepSelectedStatus: false,
    rollbackToOriginWhenRefresh: false,
    // ----------------------------------------

    // utools快速记录的代码
    quickCode: null,
    // 非核心Command进入插件
    entry: false,
    // 占位符相关
    funcs:{
        // 【变量输入】界面遇到select直接使用vim键
        vimSupport: false,
        // 【变量输入】的变量集合
        variables: {},
        // 上述输入变量的默认值
        defaultValues: {},
        // 同步codeTemplate数据
        syncDataFunc: null,
        // 当前代码片段名
        snippetName: null,
    },
    // beta测试
    beta:{
        // beta:子代码片段选择的索引位
        subSnippetNum: null,
    },
    // md渲染
    md:{
        // 选择要被复制的pre
        pre: null,
        // 对应pre的索引
        index: null,
    },
    keyboard:{
        // 长按Tab用来快速预览
        longTabAsQuickView: false,
    }
}

/**
 * 响应式全局变量
 */
const $reactive = reactive({
    // 当前访问过的代码内容（缓存作用）
    currentCode: null,
    // 当前页面
    currentMode: LIST_VIEW,
    /**
     * 当前代码片段
     * @type CodeSnippet
     */
    currentSnippet: null,
    // 当前层级前缀
    currentPrefix: [],
    common:{
        // 【快捷方式】界面
        shortcutActive: false,
        // 【变量输入】界面
        variableActive: false,
    },
    code: {  // 适用于 CodeView场景
        // 【目录】界面
        tocActive: false,
        // 【详细信息】界面
        infoActive: false,
        // 是否正在渲染
        isRendering: false,
        // 是否处于【纯净模式】
        isPure: false,
        // sections是否发生变化
        sectionsChange: false,
        // secionts modal
        sectionsChangeModal: false,
        // sections trigger is listview or formview
        sectionsChangeTriggerIsListView: false,
    },
    main:{
        // 【辅助标签选择】界面
        aidTagActive: false,
        // tagColor
        tagColorActive: false,
        tagSet: new Set(),
        tagName: null,
        selectedTag: null,
        // 【设置】界面
        settingActive: false,
        // 是否固定按钮
        isButtonFixed: false,
        // 是否进行删除
        isDel: false,
        // 是否显示鼠标
        isCursorShow: false,
        // 搜索结果是否只有一个元素
        isOnlyOneElement: false,
        // 是否处于【完整UI】
        isFullScreenShow: true,
        // 用来进行重度刷新
        deepRefresh: true,
        // 是否显示【侧边CodeView】
        isSideCodeViewShow: false,
        // 是否处于 回收站模式下
        isRecycleBinActive: false,
    },
    form:{
        fullScreen: false,
    },
    setting:{
        // 【占位符编辑】界面
        funcEditActive: false,
        // 特殊标签配置 界面
        specialTagConfigActive: false,
    },
    // 插件应用重启
    appRestart: false,
    // 控制utool及Vim模式
    utools:{
        // utools输入框是否聚焦
        focused: true,
        // utools输入框内容
        search: '',
        // 控制按键
        vimDisabled: false,
        // 用来进行轻度刷新
        searchRefreshValue: 0,
        // 选择元素子索引，控制右键菜单（Vim模式）
        subItemSelectedIndex: -1,
    }
})

// 当前选中元素索引位
const $index = ref(0)
// 当前元素列表
const $list = ref([])
/**
 * 恢复列表UI模式
 */
const handleRecoverLiteShow = ()=>{
    if($normal.recoverLiteShow){
        $normal.recoverLiteShow= false;
        $reactive.main.isFullScreenShow = false;
        utools.setExpendHeight($normal.recoverLiteHeight)
    }
}
/**
 * 临时需要切换成 完整UI模式
 * @param {boolean} [persist] 持久化
 */
const switchToFullUIMode = (persist)=>{
    if(!$reactive.main.isFullScreenShow){
        $reactive.main.isFullScreenShow = true;
        utools.setExpendHeight(545)
        if(persist){
            configManager.set('lite',false)
        }else{
            $normal.recoverLiteShow= true;
        }
    }
}

/**
 * 失聚焦uTools输入框
 * @param {boolean} focus
 */
export function utools_focus_or_blur(focus){
    $reactive.utools.focused = focus;
    if(focus){
        utools.subInputFocus();
    }else{
        utools.subInputBlur();
    }
}

const refreshListView = (keep)=>{
    if(keep){
        $normal.keepSelectedStatus = true;
        $normal.rollbackToOriginWhenRefresh = true;
    }else if(keep === false){
        $normal.keepSelectedStatus = false;
    }
    $reactive.main.deepRefresh = false;
    nextTick(()=>{
        $reactive.main.deepRefresh = true;
    })
}
export const refreshSearchResult =()=>{
    $reactive.utools.searchRefreshValue++;
}

export {
    $normal,$reactive,$index,$list,
    LIST_VIEW,CODE_VIEW,EDIT_VIEW,CREATE_VIEW,
    handleRecoverLiteShow,refreshListView,switchToFullUIMode
}