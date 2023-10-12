import {codeSnippetManager} from "./core/snippet";
import {configManager} from "./core/config";
import {
    $index,
    $normal,
    $reactive,
    CODE_VIEW,
    CREATE_VIEW,
    EDIT_VIEW,
    LIST_VIEW,
    navigateView,
    refreshListView,
} from "./store"
import {defaultHelpSnippet} from "./some";
import {debounce} from "./utils/common";
import {
    Direction,
    doScrollForCodeView,
    doScrollForHelpView,
    doScrollForListView,
    gotoTheLastPosition
} from "./utils/scroller";
import {copyCode} from "./utils/copy";
import {nextTick} from "vue";

// 控制长按键
let longKeyDown = false;
let lastTabTime = 0;  // 计算上次按下Tab时间

const debMoveDown = debounce(function(){
    $reactive.utools.subItemSelectedIndex = -1;
    // bug: $index变量有时修改不生效
    const old = $index.value;
    $index.value++;
    // console.log($reactive.utools.selectedIndex)
    gotoTheLastPosition(true);
    nextTick(()=>{
        if(old === $index.value){
            refreshListView(true)
        }
    })
})
const debMoveUp = debounce(function(){
    $index.value--;
    $reactive.utools.subItemSelectedIndex = -1;
    // $var.scroll.listInvoker?.("up")
    gotoTheLastPosition(true,true);
},)
const debItemMoveLeft = debounce(function(){
    if($reactive.view.isDel){
        $reactive.utools.subItemSelectedIndex = $reactive.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($reactive.utools.subItemSelectedIndex === -1){
            $reactive.utools.subItemSelectedIndex = 4;
        }else{
            $reactive.utools.subItemSelectedIndex --;
        }
    }
})
const debItemMoveRight = debounce(function(){
    if($reactive.view.isDel){
        $reactive.utools.subItemSelectedIndex = $reactive.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($reactive.utools.subItemSelectedIndex === 4){
            $reactive.utools.subItemSelectedIndex = -1;
        }else{
            $reactive.utools.subItemSelectedIndex ++;
        }
    }
})

function dealWithHelpViewOnly(e){
    switch (e.code){
        case 'KeyJ':
            doScrollForHelpView(Direction.DOWN)
            break;
        case 'KeyK':
            doScrollForHelpView(Direction.UP);
            break;
        case 'Digit0':
            doScrollForHelpView(Direction.RESET);
            break;
        case 'KeyZ':
        case 'KeyQ':
            $reactive.view.helpActive = false;
            break;
    }
}


/**
 * Only ListView
 */
function dealWithListView(e,list){
    // vim操作下隐藏鼠标
    $reactive.view.cursorShow = false;
    switch (e.code){
        case "Slash": // / ?
            $reactive.view.fullScreenShow = true;
            $reactive.view.settingActive = true;
            break;
        case "KeyS":
            utools.setSubInputValue('')
            utools.subInputFocus();
            $reactive.utools.focused = true;
            break;
        case "KeyH":
        case "ArrowLeft":
            // 校验是否有效
            if($index.value=== -1){
                $message.error("没有可选择的元素")
            }else if(e.shiftKey && configManager.get('fullItemCodeShow')){
                doScrollForListView(Direction.LEFT);
            }else{
                debItemMoveLeft()
            }
            break;
        case "KeyJ":
        case "ArrowDown":
            if($reactive.view.isDel){
                $reactive.view.isDel = false;
            }
            if(e.shiftKey && configManager.get('fullItemCodeShow')){
                if ($index.value === -1) { // -1 >= 0-1
                    $message.error("没有可选择的元素")
                }else {
                    doScrollForListView(Direction.DOWN);
                }
            }else{
                if ($index.value >= list.value.length -1) { // -1 >= 0-1
                    // $message.info("施主收手吧，已经到底了");
                }else {
                    debMoveDown()
                }
            }
            break;
        case "KeyK":
        case "ArrowUp":
            if($reactive.view.isDel){
                $reactive.view.isDel = false;
            }
            if(e.shiftKey && configManager.get('fullItemCodeShow')){
                if ($index.value === -1) {
                    $message.error("没有可选择的元素")
                }else {
                    doScrollForListView(Direction.UP);
                }
            }else{
                if ($index.value <= 0) {
                    // $message.info("施主收手吧，已经到顶了");
                }else {
                    debMoveUp()
                }
            }

            break;
        case "KeyL":
        case "ArrowRight":
            // 校验是否有效
            if($index.value=== -1 ){
                $message.error("没有可选择的元素")
            }else if(e.shiftKey && configManager.get('fullItemCodeShow')){
                doScrollForListView(Direction.RIGHT);
            }else{
                debItemMoveRight();
            }
            break;
        case "Space":
            if($reactive.utools.subItemSelectedIndex === -1){
                if(e.repeat){
                    navigateView(CODE_VIEW);
                    // router.replace('/code')
                    longKeyDown = true;
                }
            }
            break;
        case "Digit0":
            if($index.value === -1){
                // if(configManager.get("enabledBeep")){
                //     utools.shellBeep();
                // }
            }else if(e.shiftKey){
                doScrollForListView(Direction.RESET);
            }else{
                $index.value = 0;
                $normal.scroll.listInvoker?.scrollTo({top:0,left:0})
            }
            break;
        case 'KeyT':// TODO:处理置顶ID情况
            if($reactive.currentSnippet.id === defaultHelpSnippet.id){
                $message.warning('内置文档无法置顶');
                return;
            }
            let index = configManager.getTopList().indexOf($reactive.currentSnippet.id)
            if(index === -1){
                if(configManager.get('closeHelpSnippet')){
                    $index.value = configManager.addTopItem($reactive.currentSnippet.id);
                }else{
                    $index.value = configManager.addTopItem($reactive.currentSnippet.id) +1;
                }
            }else{
                configManager.delTopItem(index)
            }
            $normal.keepSelectedStatus = true;
            refreshListView()
            break;
        case 'KeyD':
        case 'KeyX':
            $reactive.utools.subItemSelectedIndex = 1;
            $reactive.view.isDel = true;
            break;
        case 'KeyV':
                $normal.lastQueryCodeSnippetId = $reactive.currentSnippet.id;
                navigateView(CODE_VIEW)
                // router.replace('/code')
                return;
        case 'KeyQ':
            $reactive.utools.subItemSelectedIndex = -1;
            $reactive.view.isDel = false;
            break;
        default:
            dealWithCommonView(e)
            break;
    }

}
function handleMdHorizonMove(left,fast){
    const pres  = document.querySelectorAll(".v-md-editor-preview > .github-markdown-body .v-md-pre-wrapper > pre")
    // 获取窗口大小
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const middleHeight = windowHeight / 2;
    let finalPre = null;
    let minDistance =  null;
    // 判断视口
    for (const pre of pres) {
        const rect = pre.getBoundingClientRect();
        // before
        if(rect.bottom < 0){
            continue;
        }
        // after: break
        if(rect.top > windowHeight){
            break;
        }
        // optional check
        if(rect.right < 0 || rect.left > windowWidth){
            continue;
        }
        const distance = Math.min(Math.abs(rect.top - middleHeight),Math.abs(rect.bottom - middleHeight));
        if(minDistance === null || distance < minDistance){
            finalPre = pre;
            minDistance = distance;
        }
    }
    if(finalPre){
        const distance = fast? 50 : 10;
        if(left){
            if(finalPre.scrollLeft < distance){
                finalPre.scrollLeft = 0;
            }else{
                finalPre.scrollLeft -= distance;
            }
        }else{
            finalPre.scrollLeft += distance;
        }
    }
}

function dealWithCodeView(e){
    console.log('codeview: '+e.code)
    switch (e.code){
        case "KeyH":
        case "ArrowLeft":
            if($reactive.currentSnippet.type === 'markdown'){
                if($reactive.view.isRendering){
                    handleMdHorizonMove(true,e.shiftKey)
                    break;
                }
            }
            doScrollForCodeView(Direction.LEFT,e.shiftKey);
            break;
        case "KeyJ":
        case "ArrowDown":
            doScrollForCodeView(Direction.DOWN,e.shiftKey);
            break;
        case "KeyK":
        case "ArrowUp":
            doScrollForCodeView(Direction.UP,e.shiftKey);
            break;
        case "KeyL":
        case "ArrowRight":
            if($reactive.currentSnippet.type === 'markdown'){
                if($reactive.view.isRendering){
                    handleMdHorizonMove(false,e.shiftKey)
                    break;
                }
            }
            doScrollForCodeView(Direction.RIGHT,e.shiftKey);
            break;
        case 'KeyS':
            $reactive.view.codeTipActive = !$reactive.view.codeTipActive;
            break;
        case 'KeyQ':
            $reactive.utools.keepSelectedStatus = true;
            navigateView(LIST_VIEW)
            // switchToListView()
            console.log('exit')
            break;
        case 'Digit0':
            doScrollForCodeView(Direction.RESET,false);
            break;
        case 'KeyR':
            if($reactive.currentSnippet.path && $reactive.currentSnippet.type === 'image'){
                return;
            }
            $reactive.view.isRendering = !$reactive.view.isRendering;
            break;
        case 'KeyB':
            if($reactive.currentSnippet.path){
                $normal.updateCacheCodeFunc?.()
            }
            break;
        default:
            dealWithCommonView(e)
            break;
    }
}

/**
 * ListView & CodeView
 */
function dealWithCommonView(e){
    switch (e.code){
        case 'KeyC':
        case 'KeyY':
            copyCode(false);
            // handleCopy(false)
            break;
        case 'KeyP':
            copyCode(true);
            // handleCopy(true)
            break;
        case 'KeyE':
            if($reactive.currentSnippet.id === defaultHelpSnippet.id){
                $message.warning("内置文档，无法修改");
                return;
            }
            if($reactive.view.helpActive){
                $reactive.view.helpActive = false;
            }
            navigateView(EDIT_VIEW)
            // router.replace({
            //     name: 'form',
            //     query:{
            //         mode: 'edit'
            //     }
            // })
            break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
            copyCode(e.shiftKey || e.altKey,+e.code[5])
            break;
        case 'KeyZ':
            if(!$reactive.view.fullScreenShow){
                $reactive.view.fullScreenShow = true;
                utools.setExpendHeight(545)
            }
            $reactive.view.helpActive = !$reactive.view.helpActive;
            break
        case 'KeyO':
            if($reactive.currentSnippet.path){
                if($reactive.currentSnippet.local){
                    if(e.shiftKey){
                        utools.shellShowItemInFolder($reactive.currentSnippet.path)
                    }else{
                        utools.shellOpenPath($reactive.currentSnippet.path);
                    }
                }else{
                    utools.shellOpenExternal($reactive.currentSnippet.path)
                }
            }else{
                $message.warning("当前文件不为【链接文件】")
            }
            break
    }
}


/**
 * @param list - ListView的响应式列表
 */
function init(list) {
    document.onkeydown = e => {
        // ignore  update view or create view
        if ($reactive.currentMode >= EDIT_VIEW) {
            return;
        }
        // dialog or sideview
        if ($reactive.view.settingActive) {
            // prevent any possible event
            if ( e.code === 'Enter' || e.code === 'Tab') {
                e.preventDefault();
            } else if (e.code === 'KeyQ' || e.code === 'Slash') {
                $reactive.view.settingActive = false;
            }
            return;
        }else if( $reactive.view.variableActive){
            return;
        }
        // super key
        if (e.code === 'Enter') {
            copyCode(true)
            // handleCopy(true)
            return;
        } else if (e.code === 'Tab') {
            e.preventDefault();
            let gap = e.timeStamp - lastTabTime;
            if (gap < 300) {
                $reactive.view.fullScreenShow = !$reactive.view.fullScreenShow;
                $reactive.utools.focused = true;
                utools.subInputFocus();
            } else {
                if ($reactive.utools.focused && $index.value > -1) {
                    $reactive.utools.focused = false;
                    $reactive.view.cursorShow = false;
                    utools.subInputBlur();
                    gotoTheLastPosition();
                } else {
                    utools.subInputFocus();
                    $reactive.utools.focused = true;
                }
            }
            lastTabTime = e.timeStamp;
            return;
        }else if(e.code === 'Space'){
            e.preventDefault();
        }else if(e.code === 'KeyZ'){
            $reactive.view.helpActive = !$reactive.view.helpActive;
            return;
        }
        // 其他键无法触发
        if ($reactive.utools.focused) {
            return;
        }
        // 处理Ctrl键
        if (e.ctrlKey || e.metaKey) {
            switch (e.code){
                case 'KeyN':
                    navigateView(CREATE_VIEW)
                    // router.replace({
                    //     name: 'form',
                    //     query:{
                    //         mode: 'new'
                    //     }
                    // })
                    return;
                case 'KeyR':
                    if($reactive.currentMode === LIST_VIEW){
                        refreshListView(true)
                    }
                    return;
                case 'KeyF':
                    if($reactive.currentMode === LIST_VIEW){
                        if (configManager.get("enabledFuzzySymbolQuery")) {
                            configManager.set("enabledFuzzySymbolQuery", false)
                            $message.info("退出【进阶模糊查询】模式")
                        } else {
                            configManager.set("enabledFuzzySymbolQuery", true)
                            $message.success("进入【进阶模糊查询】模式")
                        }
                    }
                    return;
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                case 'Digit9':
                    copyCode(true,+e.code[5])
                    return;
            }
            return;
        }
        if($reactive.view.helpActive){
            dealWithHelpViewOnly(e);
            return;
        }
        // 剩余处理
        if ($reactive.currentMode === LIST_VIEW) {
            dealWithListView(e, list)
        } else {
            dealWithCodeView(e)
        }
    }
    document.onkeyup = e => {
        if ($reactive.view.settingActive | $reactive.utools.focused || $index.value < 0 || $reactive.currentMode >= EDIT_VIEW) {
            return;
        }
        if (e.code === 'Space') {
            e.preventDefault();
            if (longKeyDown) {
                longKeyDown = false;
                // $normal.keepSelectedStatus = true;
                // switchToListView()
                navigateView(LIST_VIEW)
                return;
            }
            if ($reactive.currentMode === LIST_VIEW) {
                if ($reactive.utools.subItemSelectedIndex === -1) {
                    // // 校准位置
                    // console.log('space invoke to the last position')
                    // gotoTheLastPosition();
                } else {
                    // 处理 Vim 操作
                    $normal.scroll.spaceInvoker[$reactive.utools.subItemSelectedIndex]?.()
                }
            }
        }
    }
}




/**
 *
 * @param {string} searchWord
 */
function parseSearchWord(searchWord){
    let array = [];
    if(configManager.get('version') !== defaultHelpSnippet.version){
        configManager.set('version',defaultHelpSnippet.version)
        configManager.set('closeHelpSnippet',false)
    }
    if(searchWord == null || searchWord.length === 0){
        if($reactive.view.fullScreenShow  || !configManager.get('noShowForEmptySearch')){
            array = codeSnippetManager.queryForMany(null,null,null)
        }else{
            // lite & empty show
            if(!configManager.get('closeHelpSnippet')){
                return [defaultHelpSnippet];
            }
            utools.setExpendHeight(0)
            return [];
        }
    }else{
        const words = searchWord.split(/\s/).filter(v=>v.length>=1)
        let name = null;
        let type = null;
        let tags = [];
        for (let word of words) {
            if(word[0] === '@'){
                if(word.length !== 1){
                    type = word.slice(1)
                }
            }else if(word[0] === '#'){
                if(word.length !== 1){
                    tags.push(word.slice(1))
                }
            }else{
                name = word;
            }
        }
        array = codeSnippetManager.queryForMany(name,tags,type)
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
        if(!$reactive.view.fullScreenShow  && configManager.get('noShowForEmptySearch')){
            utools.setExpendHeight(0)
        }
    }


    return array;
}




export {
    init,
    parseSearchWord
}