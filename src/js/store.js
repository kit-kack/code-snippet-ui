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
    currentCode: null,
    currentMode: LIST_VIEW,
    /**
     * @type CodeSnippet
     */
    currentSnippet: null,
    currentPrefix: [],
    view:{
        fullScreenShow: true,     // 是否为完整UI模式
        aidTagActive: false,
        helpActive: false,        // 快速方式界面是否显示
        settingActive: false,     // 侧边栏是否开启，禁止其他按键操作
        variableActive: false,    // 输入自定义变量界面是否显示
        funcEditActive: false,
        codeTipActive: false,      // 是否展示 CodeView中的 Tip
        isDel: false,             // 当前是否为 删除操作
        deepRefresh: true,
        cursorShow: true,
        buttonFixed: false,
        isRendering: false,
        onlyOne: false,           // 当前查询结果是否仅有一条记录
        backStageShow: false,
        pureView: false,          // 是否为纯预览
    },
    // 控制utool及Vim模式
    utools:{
        focused: true,      // utools输入框是否聚焦
        search: '',         // utools输入框内容
        searchRefreshValue: 0, // 用来进行刷新
        subItemSelectedIndex: -1,  // 选择元素子索引，控制右键菜单（Vim模式）
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
        $reactive.view.fullScreenShow = false;
        utools.setExpendHeight($normal.recoverLiteHeight)
    }
}
/**
 * 临时需要切换成 完整UI模式
 */
const switchToFullUIMode = ()=>{
    if(!$reactive.view.fullScreenShow){
        $reactive.view.fullScreenShow = true;
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
    $reactive.view.deepRefresh = false;
    nextTick(()=>{
        $reactive.view.deepRefresh = true
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