import {nextTick, reactive, ref} from "vue";

const LIST_VIEW = 0;
const CODE_VIEW = 1;
const EDIT_VIEW = 2;
const CREATE_VIEW = 3;

const $normal = {
    listViewVisitedCount: 0,
    lastQueryCodeSnippetId: null,
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
    variables: {},        // 后续会映射类型
    quickCode: null,      // 快速记录代码
}
const $reactive = reactive({
    currentCode: null,
    currentMode: LIST_VIEW,
    /**
     * @type CodeSnippet
     */
    currentSnippet: null,
    view:{
        fullScreenShow: true,     // 是否为完整UI模式
        helpActive: false,        // 快速方式界面是否显示
        settingActive: false,     // 侧边栏是否开启，禁止其他按键操作
// @deprecated        customActive: false,      // 自定义底边栏
        variableActive: false,    // 输入自定义变量界面是否显示
        codeTipActive: false,      // 是否展示 CodeView中的 Tip
        isDel: false,             // 当前是否为 删除操作
        refreshSearch: true,             // // 控制ListView刷新
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
        selectedIndex: 0,   // 选择元素索引
        subItemSelectedIndex: -1,  // 选择元素子索引，控制右键菜单（Vim模式）
    }
})
const $index = ref(0)


/**
 * 恢复列表UI模式
 */
const handleRecoverLiteShow = ()=>{
    if($normal.recoverLiteShow){
        $normal.recoverLiteShow= false;
        $reactive.view.fullScreenShow = false;
        let offset = $reactive.view.listViewRef?.offsetHeight;
        if(offset == null){
            $normal.recoverLiteHeight = 0;
        }else if(offset > 535){
            $normal.recoverLiteHeight = 545;
        }else{
            $normal.recoverLiteHeight = offset - 16;
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


const refreshListView = (deepFlag)=>{
    if(deepFlag){
        $reactive.view.deepRefresh = false;
        nextTick(()=>{
            $reactive.view.deepRefresh = true
        })
    }else{
        $reactive.view.refreshSearch = false;
        nextTick(()=>{
            $reactive.view.refreshSearch = true
        })
    }
}


/**
 * 切换界面
 * @param {number} view
 * @param {boolean} [refresh]
 */
const navigateView = (view,refresh) =>{
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
        switchToFullUIMode();
        $reactive.currentMode = view;
    }

}

export {
    $normal,$reactive,$index,
    LIST_VIEW,CODE_VIEW,EDIT_VIEW,CREATE_VIEW,
    handleRecoverLiteShow,refreshListView,switchToFullUIMode,navigateView
}