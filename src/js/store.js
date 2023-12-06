import {nextTick, reactive, ref} from "vue";
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
    // 控制 选中元素 保持记忆功能
    keepSelectedStatus: false,
    // utools快速记录的代码
    quickCode: null,
    // 占位符相关
    funcs:{
        // 【变量输入】界面遇到select直接使用vim键
        vimSupport: false,
        // 【变量输入】的变量集合
        variables: {},
        // 上述输入变量的默认值
        defaultValues: {},
    },
    // beta测试
    beta:{
        // beta: utools输入中的tags部分，用于标签辅助选择
        tempTags: [],
        // beta:子代码片段选择的索引位
        subSnippetNum: null,
    },
    // md渲染
    md:{
        // 选择要被复制的pre
        pre: null,
        // 对应pre的索引
        index: null,
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
        isPure: false
    },
    main:{
        // 【辅助标签选择】界面
        aidTagActive: false,
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
    },
    setting:{
        // 【占位符编辑】界面
        funcEditActive: false,
    },
    // 插件应用重启
    appRestart: false,
    // 控制utool及Vim模式
    utools:{
        // utools输入框是否聚焦
        focused: true,
        // utools输入框内容
        search: '',
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
 */
const switchToFullUIMode = ()=>{
    if(!$reactive.main.isFullScreenShow){
        $reactive.main.isFullScreenShow = true;
        $normal.recoverLiteShow= true;
        utools.setExpendHeight(545)
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

const refreshListView = ()=>{
    $reactive.main.deepRefresh = false;
    nextTick(()=>{
        $reactive.main.deepRefresh = true
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