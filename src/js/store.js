import {nextTick, reactive, ref} from "vue";
import {configManager} from "./core/config";

const LIST_VIEW = 0;
const CODE_VIEW = 1;
const EDIT_VIEW = 2;
const CREATE_VIEW = 3;

const $normal = {
    listViewVisitedCount: 0,
    // TODO id可能有重复的情况
    lastQueryCodeSnippetId: null,
    recoverLiteShow: false,   // 是否恢复为 列表UI
    recoverLiteHeight: 0,      // 恢复为列表UI的高度
    // 主题
    theme: null,
    // 【变量输入】界面遇到select直接使用vim键
    vimDirectFlag: false,
    // 控制滚动
    scroll:{
        codeInvoker: null,       // 控制CodeView滚动
        codeHorizontalInvoker: null, //
        codeVerticalInvoker: null, //
        listInvoker: null,       // 控制ListView滚动
        itemCodeInvoker: null,   // 控制多行代码块滚动
        hierarchyInvoker: null,  // 控制topNav
        virtualScrollInvoker: null , // 控制 virtual scroll
        spaceInvoker: [],      // Vim模式下空格执行的程序
        helpInvoker: null,    // 【快捷方式】控制的滚动
        itemOffsetArray: []  // 元素偏移（目前根据滚动条滚动距离计算）
    },
    // 层级
    hierarchy:{
        /**
         * @type {{
         *     local?: boolean,
         *     value: string,
         *     index: number
         * }[]}
         */
      path: []
    },
    keepSelectedStatus: null,  // null false true  // 控制 选中元素 保持记忆功能
    updateCacheCodeFunc: null,      // 调整缓存函数
    variables: {},        // 后续会映射类型
    defaultValues: {},    // 默认值
    quickCode: null,      // 快速记录代码
    tempTags: [],          // tags缓存
    subSnippetNum: null,  // 子代码片段序号
}
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
// @deprecated        customActive: false,      // 自定义底边栏
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
        listViewRef: null
    },
    // 控制utool及Vim模式
    utools:{
        focused: true,      // utools输入框是否聚焦
        search: '',         // utools输入框内容
        searchRefreshValue: 0, // 用来进行刷新
        selectedIndex: 0,   // 选择元素索引
        subItemSelectedIndex: -1,  // 选择元素子索引，控制右键菜单（Vim模式）
    }
})
const $index = ref(0)
const $list = ref([])
/**
 * 恢复列表UI模式
 */
const handleRecoverLiteShow = ()=>{
    if($normal.recoverLiteShow){
        $normal.recoverLiteShow= false;
        $reactive.view.fullScreenShow = false;
        if($list.value.length > 0){
            const height = $list.value.length * 67 + 15;
            $normal.recoverLiteHeight = height > 535? 545 : height;
        }else{
            $normal.recoverLiteHeight = 50;
        }
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

function handleAppHeight(){
    if($reactive.view.fullScreenShow){
        utools.setExpendHeight(545)
    }else{
        if(configManager.get('strategy_item_code_show') === 2){
            $message.info("多行元素代码块场景下不支持 列表UI")
        }
    }

    const height = $list.value.length * 66 + 15;
    utools.setExpendHeight(height > 535? 545 : height)
    console.dir($normal.scroll.virtualScrollInvoker?.$refs?.scroller?.totalSize)
}


export {
    $normal,$reactive,$index,$list,
    LIST_VIEW,CODE_VIEW,EDIT_VIEW,CREATE_VIEW,
    handleRecoverLiteShow,refreshListView,switchToFullUIMode
}