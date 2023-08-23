import {nextTick, reactive} from "vue";

const LIST_VIEW = 0;
const CODE_VIEW = 1;
const UPDATE_VIEW = 2;
const CREATE_VIEW = 3;


const $var = reactive({
    currentMode : LIST_VIEW,    // 当前模式
    currentName : null,         // 当前代码片段名（被选中元素）

    /**
     * @type CodeSnippet
     */
    currentSnippet: null,       // 当前代码片段
    currentCode: null,          // 当前代码
    lastQueryCodeSnippetName: null,  // 避免重复抓取代码
    currentSplitCode: null,
    list: [],                   // 存放CodeSnippet列表
    // 控制滚动
    scroll:{
        codeInvoker: null,       // 控制CodeView滚动
        listInvoker: null,       // 控制ListView滚动
        itemCodeInvoker: null,   // 控制多行代码块滚动
        spaceInvoker: [],      // Vim模式下空格执行的程序
        helpInvoker: null,    // 【快捷方式】控制的滚动
        itemOffsetArray: []  // 元素偏移（目前根据滚动条滚动距离计算）
    },
    // 控制当前视图
    view:{
        fullScreenShow: true,     // 是否为完整UI模式
        helpActive: false,        // 快速方式界面是否显示
        settingActive: false,     // 侧边栏是否开启，禁止其他按键操作
        customActive: false,      // 自定义底边栏
        variableActive: false,    // 输入自定义变量界面是否显示
        showCodeTip: false,       // 是否展示 CodeView中的 Tip
        isDel: false,             // 当前是否为 删除操作
        recoverLiteShow: false,   // 是否恢复为 列表UI
        recoverLiteHeight: 0,      // 恢复为列表UI的高度
        refresh: true,              // 控制刷新
        cursorShow: true,
        buttonFixed: false,
        isRendering: false,
        edit: false
    },
    // 控制utool及Vim模式
    utools:{
        focused: true,      // utools输入框是否聚焦
        search: '',         // utools输入框内容
        selectedIndex: 0,   // 选择元素索引
        subItemSelectedIndex: -1,  // 选择元素子索引，控制右键菜单（Vim模式）
        keepSelectedStatus: null  // null false true  // 控制 选中元素 保持记忆功能
    },
    others:{
        onlyOne: false,      // 当前查询结果是否仅有一条记录
        code: null,           // 快速进入创建界面的携带的代码
        updateCacheCodeFunc: null,      // 调整缓存函数
        variables: {}        // 后续会映射类型
    }
})


/**
 * 恢复列表UI模式
 */
const handleRecoverLiteShow = ()=>{
    if($var.view.recoverLiteShow){
        $var.view.recoverLiteShow= false;
        $var.view.fullScreenShow = false;
        utools.setExpendHeight($var.view.recoverLiteHeight)
    }
}
/**
 * 临时需要切换成 完整UI模式
 */
const switchToFullUIMode = ()=>{
    if(!$var.view.fullScreenShow){
        $var.view.fullScreenShow = true;
        $var.view.recoverLiteShow= true;
        utools.setExpendHeight(545)
    }
}


const refreshListView = ()=>{
    $var.view.refresh = false;
    nextTick(()=>{
        $var.view.refresh = true
    })
}

export {
    $var,
    LIST_VIEW,CODE_VIEW,UPDATE_VIEW,CREATE_VIEW,
    handleRecoverLiteShow,refreshListView,switchToFullUIMode
}