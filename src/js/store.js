import {nextTick, reactive} from "vue";

const LIST_VIEW = 0;
const CODE_VIEW = 1;
const FORM_VIEW = 2;

const $normal = {
    lastQueryCodeSnippetName: null,
    recoverLiteShow: false,   // 是否恢复为 列表UI
    recoverLiteHeight: 0,      // 恢复为列表UI的高度
    // 控制滚动
    scroll:{
        codeInvoker: null,       // 控制CodeView滚动
        listInvoker: null,       // 控制ListView滚动
        itemCodeInvoker: null,   // 控制多行代码块滚动
        spaceInvoker: [],      // Vim模式下空格执行的程序
        helpInvoker: null,    // 【快捷方式】控制的滚动
        itemOffsetArray: []  // 元素偏移（目前根据滚动条滚动距离计算）
    },
    keepSelectedStatus: null,  // null false true  // 控制 选中元素 保持记忆功能
    updateCacheCodeFunc: null,      // 调整缓存函数
    variables: {}        // 后续会映射类型
}
const $reactive = reactive({
    currentCode: null,
    currentMode: LIST_VIEW,
    currentSnippet: null,
    view:{
        fullScreenShow: true,     // 是否为完整UI模式
        helpActive: false,        // 快速方式界面是否显示
        settingActive: false,     // 侧边栏是否开启，禁止其他按键操作
        customActive: false,      // 自定义底边栏
        variableActive: false,    // 输入自定义变量界面是否显示
        codeTipActive: false,      // 是否展示 CodeView中的 Tip
        isDel: false,             // 当前是否为 删除操作
        refresh: true,             // // 控制ListView刷新
        cursorShow: true,
        buttonFixed: false,
        isRendering: false,
        onlyOne: false           // 当前查询结果是否仅有一条记录
    },
    // 控制utool及Vim模式
    utools:{
        focused: true,      // utools输入框是否聚焦
        search: '',         // utools输入框内容
        selectedIndex: 0,   // 选择元素索引
        subItemSelectedIndex: -1,  // 选择元素子索引，控制右键菜单（Vim模式）
    }
})



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


const refreshListView = ()=>{
    $reactive.view.refresh = false;
    nextTick(()=>{
        $reactive.view.refresh = true
    })
}

export {
    $normal,$reactive,
    LIST_VIEW,CODE_VIEW,FORM_VIEW,
    handleRecoverLiteShow,refreshListView,switchToFullUIMode
}