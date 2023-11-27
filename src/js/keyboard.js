import {configManager} from "./core/config";
import {
    $index,
    $normal,
    $reactive,
    CODE_VIEW,
    CREATE_VIEW,
    EDIT_VIEW,
    LIST_VIEW,
    refreshListView, refreshSearchResult, switchToFullUIMode,
    utools_focus_or_blur,
} from "./store"
import {isNetWorkUri} from "./utils/common";
import {
    Direction,
    doScrollForCodeView,
    doScrollForHelpView,
    doScrollForListView,
    doScrollForMultiLineCode
} from "./utils/scroller";
import {copyCode} from "./utils/copy";
import {GLOBAL_HIERARCHY} from "./hierarchy/core";
import _ from "lodash";

// 控制长按键
let longKeyDown = false;
let lastTabTime = 0;  // 计算上次按下Tab时间

const debMoveDown = _.throttle(function(){
    $reactive.utools.subItemSelectedIndex = -1;
    $index.value++;
    // console.log($reactive.core.selectedIndex)
    doScrollForListView();
},120)
const debMoveUp = _.throttle(function(){
    $index.value--;
    $reactive.utools.subItemSelectedIndex = -1;
    // $var.scroll.listInvoker?.("up")
    doScrollForListView()
},120)
const debItemMoveLeft = _.throttle(function(){
    if($reactive.view.isDel){
        $reactive.utools.subItemSelectedIndex = $reactive.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($reactive.utools.subItemSelectedIndex === -1){
            $reactive.utools.subItemSelectedIndex = 4;
        }else{
            $reactive.utools.subItemSelectedIndex --;
        }
    }
},120)
const debItemMoveRight = _.throttle(function(){
    if($reactive.view.isDel){
        $reactive.utools.subItemSelectedIndex = $reactive.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($reactive.utools.subItemSelectedIndex === 4){
            $reactive.utools.subItemSelectedIndex = -1;
        }else{
            $reactive.utools.subItemSelectedIndex ++;
        }
    }
},120)

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
            switchToFullUIMode();
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
            }else if(e.shiftKey && configManager.get('strategy_item_code_show') === 2){
                doScrollForMultiLineCode(Direction.LEFT);
            }else{
                debItemMoveLeft()
            }
            break;
        case "KeyJ":
        case "ArrowDown":
            if($reactive.view.isDel){
                $reactive.view.isDel = false;
            }
            if(e.shiftKey && configManager.get('strategy_item_code_show') === 2){
                if ($index.value === -1) { // -1 >= 0-1
                    $message.error("没有可选择的元素")
                }else {
                    doScrollForMultiLineCode(Direction.DOWN);
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
            if(e.shiftKey && configManager.get('strategy_item_code_show') === 2){
                if ($index.value === -1) {
                    $message.error("没有可选择的元素")
                }else {
                    doScrollForMultiLineCode(Direction.UP);
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
            }else if(e.shiftKey && configManager.get('strategy_item_code_show') === 2){
                doScrollForMultiLineCode(Direction.RIGHT);
            }else{
                debItemMoveRight();
            }
            break;
        case "Space":
            if($reactive.utools.subItemSelectedIndex === -1){
                if(e.repeat && !longKeyDown){
                    if($reactive.currentSnippet.dir){
                        GLOBAL_HIERARCHY.changeHierarchy("next")
                    }else{
                        GLOBAL_HIERARCHY.changeView(CODE_VIEW)
                    }
                    // router.replace('/code')
                    longKeyDown = true;
                }
            }
            break;
        case "KeyG":
            if($index.value === -1){
                // if(configManager.get("enabledBeep")){
                //     core.shellBeep();
                // }
            }else if(e.shiftKey){
                doScrollForMultiLineCode(Direction.RESET);
            }else{
                $index.value = 0;
                doScrollForListView();
            }
            break;
        case 'KeyT':
            if($reactive.currentSnippet.help){
                $message.warning('内置文档无法置顶');
                return;
            }
            GLOBAL_HIERARCHY.update(null,"top");
            $normal.keepSelectedStatus = true;
            // refreshListView(true)
            refreshSearchResult();
            break;
        case 'KeyD':
        case 'KeyX':
            if(GLOBAL_HIERARCHY.currentConfig.remove){
                $reactive.utools.subItemSelectedIndex = 1;
                $reactive.view.isDel = true;
            }else{
                $message.warning("当前目录层级不支持[删除]操作")
            }
            break;
        case 'KeyV':
            if($reactive.currentSnippet.dir){
                GLOBAL_HIERARCHY.changeHierarchy("next")
            }else{
                GLOBAL_HIERARCHY.changeView(CODE_VIEW)
                // router.replace('/code')
            }
            return;
        case 'KeyR':
            GLOBAL_HIERARCHY.changeHierarchy("root")
            return;
        case 'KeyQ':
            if($reactive.utools.subItemSelectedIndex !== -1 || $reactive.view.isDel){
                $reactive.utools.subItemSelectedIndex = -1;
                $reactive.view.isDel = false;
            }else{
                GLOBAL_HIERARCHY.changeHierarchy("prev")
            }
            break;
        default:
            dealWithCommonView(e)
            break;
    }

}
let lastCenterPre = null;
let lastIndex = null;

function getVisiablePres(){
    const pres  = document.querySelectorAll(".v-md-editor-preview > .github-markdown-body .v-md-pre-wrapper > pre")
    // 获取窗口大小
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const middleHeight = windowHeight / 2;
    const result = [];
    // 判断视口
    for (const pre of pres) {
        const rect = pre.getBoundingClientRect();
        // before
        if (rect.bottom < 0) {
            continue;
        }
        // after: break
        if (rect.top > windowHeight) {
            break;
        }
        // optional check
        if (rect.right < 0 || rect.left > windowWidth) {
            continue;
        }
        result.push({
            distance: Math.min(Math.abs(rect.top - middleHeight),Math.abs(rect.bottom - middleHeight)),
            pre: pre
        })
    }
    return result
}
function adjustCenterPre(tab){
    const pres = getVisiablePres();
    if(pres.length === 0){
        return;
    }
    let finalIndex;
    if(tab){
        if(lastIndex !== null){
            finalIndex = lastIndex +1;
            if(finalIndex >= pres.length){
                finalIndex = 0;
            }
        }else{
            finalIndex = 0;
        }
    }else{
        // find min distance
        let minDistance = pres[0].distance;
        finalIndex = 0;
        for (let i = 1; i < pres.length; i++) {
            if(pres[i].distance < minDistance){
                minDistance = pres[i].distance;
                finalIndex = i;
            }
        }
    }
    lastIndex = finalIndex;
    const finalPre = pres[finalIndex].pre;
    if(lastCenterPre === finalPre){
        return;
    }else{
        if(lastCenterPre){
            // cancel border color
            lastCenterPre.style.border = '';
        }
        lastCenterPre = finalPre;
        lastCenterPre.style.border = '2px solid '+$normal.theme.globalColor;
    }

}

function handleMdHorizonMove(left,fast){
    if(lastCenterPre){
        const distance = fast? 50 : 10;
        if(left){
            if(lastCenterPre.scrollLeft < distance){
                lastCenterPre.scrollLeft = 0;
            }else{
                lastCenterPre.scrollLeft -= distance;
            }
        }else{
            lastCenterPre.scrollLeft += distance;
        }
    }
}

function dealWithCodeView(e){
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
            if($reactive.currentSnippet.type === 'markdown'){
                if($reactive.view.isRendering){
                    adjustCenterPre()
                    break;
                }
            }
            break;
        case "KeyK":
        case "ArrowUp":
            doScrollForCodeView(Direction.UP,e.shiftKey);
            if($reactive.currentSnippet.type === 'markdown'){
                if($reactive.view.isRendering){
                    adjustCenterPre()
                    break;
                }
            }
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
        case 'Space':
            if(lastCenterPre){
                utools.copyText(lastCenterPre.querySelector('code').innerText)
                $message.info("已复制该代码块内容")
                break
            }
            break;
        case 'KeyQ':
            $reactive.utools.keepSelectedStatus = true;
            GLOBAL_HIERARCHY.changeView(LIST_VIEW)
            break;
        case 'KeyG':
            doScrollForCodeView(Direction.RESET,false);
            break
        case 'KeyR':
            if($reactive.currentSnippet.path && $reactive.currentSnippet.type === 'image'){
                return;
            }
            $reactive.view.isRendering = !$reactive.view.isRendering;
            break;
        // case 'KeyB':
        //     if($reactive.currentSnippet.path){
        //         $normal.updateCacheCodeFunc?.()
        //     }
        //     break;
        default:
            dealWithCommonView(e)
            break;
    }
}

/**
 * ListView & CodeView
 */
function dealWithCommonView(e){
    e.preventDefault();
    switch (e.code){
        case 'KeyC':
        case 'KeyY':
            if($reactive.currentSnippet.dir){
                $message.warning("无法对目录进行此操作");
                return;
            }
            copyCode(false);
            // handleCopy(false)
            break;
        case 'KeyP':
            if($reactive.currentSnippet.dir){
                $message.warning("无法对目录进行此操作");
                return;
            }
            copyCode(true);
            // handleCopy(true)
            break;
        case 'KeyE':
            if($reactive.currentSnippet.help){
                $message.warning("内置文档，无法修改");
                return;
            }
            if($reactive.view.helpActive){
                $reactive.view.helpActive = false;
            }
            GLOBAL_HIERARCHY.changeView(EDIT_VIEW)
            break;
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
            if($reactive.currentSnippet.dir){
                $message.warning("无法对目录进行此操作");
                return;
            }
            e.preventDefault();
            copyCode(e.shiftKey || e.altKey,+e.code[5])
            break;
        case 'KeyZ':
            switchToFullUIMode()
            $reactive.view.helpActive = !$reactive.view.helpActive;
            break
        case 'KeyO':
            if($reactive.currentSnippet.path){
                if(isNetWorkUri($reactive.currentSnippet.path)){
                    utools.shellOpenExternal($reactive.currentSnippet.path)
                }else{
                    if(e.shiftKey){
                        utools.shellShowItemInFolder($reactive.currentSnippet.path)
                    }else{
                        utools.shellOpenPath($reactive.currentSnippet.path);
                    }
                }
            }else{
                $message.warning("当前文件不为【关联文件】")
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
        if($reactive.view.funcEditActive){
            return;
        }else if ($reactive.view.settingActive) {
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
            if($reactive.currentSnippet.dir){
                return;
            }
            copyCode(true,$normal.subSnippetNum)
            // handleCopy(true)
            return;
        } else if (e.code === 'Tab') {
            e.preventDefault();
            const gap = e.timeStamp - lastTabTime;
            if($reactive.currentMode === LIST_VIEW){
                if (gap < 300) { // UI切换
                    if(configManager.get('strategy_item_code_show') === 2){
                        $reactive.view.fullScreenShow = true;
                        return;
                    }
                    $reactive.view.fullScreenShow = !$reactive.view.fullScreenShow;
                    configManager.set('lite',!$reactive.view.fullScreenShow)
                    refreshListView()
                    utools_focus_or_blur(true)
                } else { // vim模式切换
                    if ($reactive.utools.focused && $index.value > -1) {
                        $reactive.view.cursorShow = false;
                        utools_focus_or_blur(false)
                        doScrollForListView()
                    } else {
                        utools_focus_or_blur(true)
                    }
                }
            }else{
                adjustCenterPre(true)
            }
            lastTabTime = e.timeStamp;
            return;
        }else if(e.code === 'Space'){
            e.preventDefault();
        }else if(e.code === 'KeyZ'){
            $reactive.view.helpActive = !$reactive.view.helpActive;
            return;
        }
        // 处理Ctrl键
        if (e.ctrlKey || e.metaKey) {
            switch (e.code){
                case 'KeyQ':
                    if($reactive.currentMode === LIST_VIEW){
                        GLOBAL_HIERARCHY.changeHierarchy("prev")
                    }
                    break
                case 'KeyN':
                    GLOBAL_HIERARCHY.changeView(CREATE_VIEW)
                    break
                case 'KeyR':
                    if($reactive.currentMode === LIST_VIEW){
                        refreshListView(true)
                    }
                    break
                case 'Digit0':
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
                    break
            }
            return;
        }
        // 其他键无法触发
        if ($reactive.utools.focused) {
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
                GLOBAL_HIERARCHY.changeView(LIST_VIEW)
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
export {
    init
}