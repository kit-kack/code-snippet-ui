import {nextTick} from "vue";
import {codeSnippetManager, configManager} from "./core.js";
import {$var, CODE_VIEW, CREATE_VIEW, handleRecoverLiteShow, LIST_VIEW, refreshListView, UPDATE_VIEW} from "./store"
import {defaultHelpSnippet} from "./some";
import {debounce} from "./utils/common";
import {Direction, doScrollForCodeView, doScrollForHelpView, doScrollForListView} from "./utils/scroller";
import {copyCode} from "./utils/copy";

// 控制长按键
let longKeyDown = false;
let lastTabTime = 0;  // 计算上次按下Tab时间

const debMoveDown = debounce(function(){
    $var.utools.selectedIndex++;
    $var.utools.subItemSelectedIndex = -1;
    gotoTheLastPosition();
})
const debMoveUp = debounce(function(){
    $var.utools.selectedIndex--;
    $var.utools.subItemSelectedIndex = -1;
    // $var.scroll.listInvoker?.("up")
    gotoTheLastPosition();
})
const debItemMoveLeft = debounce(function(){
    if($var.view.isDel){
        $var.utools.subItemSelectedIndex = $var.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($var.utools.subItemSelectedIndex === -1){
            $var.utools.subItemSelectedIndex = 4;
        }else{
            $var.utools.subItemSelectedIndex --;
        }
    }
})
const debItemMoveRight = debounce(function(){
    if($var.view.isDel){
        $var.utools.subItemSelectedIndex = $var.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($var.utools.subItemSelectedIndex === 4){
            $var.utools.subItemSelectedIndex = -1;
        }else{
            $var.utools.subItemSelectedIndex ++;
        }
    }
})

const gotoTheLastPosition = ()=>{
    // 校准位置
    if($var.utools.selectedIndex > -1 ){
        let distance = $var.scroll.itemOffsetArray[$var.utools.selectedIndex] -200;
        if(distance < 0){
            distance = 0;
        }
        $var.scroll.listInvoker?.scrollTo({top:+distance,left:0})
        // $var.scroll.listInvoker?.(distance)
    }
}
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
            $var.view.helpActive = false;
            break;
    }
}


/**
 * Only ListView
 */
function dealWithListView(e,list){
    // vim操作下隐藏鼠标
    $var.view.cursorShow = false;
    switch (e.code){
        case "Slash": // / ?
            $var.view.fullScreenShow = true;
            $var.view.settingActive = true;
            break;
        case "KeyS":
            utools.setSubInputValue('')
            utools.subInputFocus();
            $var.utools.focused = true;
            break;
        case "KeyH":
        case "ArrowLeft":
            // 校验是否有效
            if($var.utools.selectedIndex=== -1){
                if(configManager.get("enabledBeep")){
                    utools.shellBeep();
                }
            }else if(e.shiftKey && configManager.get('fullItemCodeShow')){
                doScrollForListView(Direction.LEFT);
            }else{
                debItemMoveLeft()
            }
            break;
        case "KeyJ":
        case "ArrowDown":
            if($var.view.isDel){
                $var.view.isDel = false;
            }
            if(e.shiftKey && configManager.get('fullItemCodeShow')){
                if ($var.utools.selectedIndex === -1) { // -1 >= 0-1
                    if(configManager.get("enabledBeep")){
                        utools.shellBeep();
                    }
                }else {
                    doScrollForListView(Direction.DOWN);
                }
            }else{
                if ($var.utools.selectedIndex >= list.value.length -1) { // -1 >= 0-1
                    if(configManager.get("enabledBeep")){
                        utools.shellBeep();
                    }
                }else {
                    debMoveDown()
                }
            }
            break;
        case "KeyK":
        case "ArrowUp":
            if($var.view.isDel){
                $var.view.isDel = false;
            }
            if(e.shiftKey && configManager.get('fullItemCodeShow')){
                if ($var.utools.selectedIndex === -1) {
                    if (configManager.get("enabledBeep")) {
                        utools.shellBeep();
                    }
                }else {
                    doScrollForListView(Direction.UP);
                }
            }else{
                if ($var.utools.selectedIndex <= 0) {
                    if (configManager.get("enabledBeep")) {
                        utools.shellBeep();
                    }
                }else {
                    debMoveUp()
                }
            }

            break;
        case "KeyL":
        case "ArrowRight":
            // 校验是否有效
            if($var.utools.selectedIndex=== -1 ){
                if(configManager.get("enabledBeep")){
                    utools.shellBeep();
                }
            }else if(e.shiftKey && configManager.get('fullItemCodeShow')){
                doScrollForListView(Direction.RIGHT);
            }else{
                debItemMoveRight();
            }
            break;
        case "Space":
            if($var.utools.subItemSelectedIndex === -1){
                if(e.repeat){
                    if(!$var.view.fullScreenShow){
                        $var.view.fullScreenShow = true;
                        $var.view.recoverLiteShow= true;
                        utools.setExpendHeight(545)
                    }
                    $var.lastQueryCodeSnippetName = $var.currentName;
                    $var.currentSnippet = codeSnippetManager.get($var.currentName)
                    $var.currentMode = CODE_VIEW;
                    longKeyDown = true;
                }
            }
            break;
        case "Digit0":
            if($var.utools.selectedIndex === -1){
                if(configManager.get("enabledBeep")){
                    utools.shellBeep();
                }
            }else if(e.shiftKey){
                doScrollForListView(Direction.RESET);
            }else{
                $var.utools.selectedIndex = 0;
                $var.scroll.listInvoker?.scrollTo({top:0,left:0})
            }
            break;
        case 'KeyT':
            if($var.currentName === defaultHelpSnippet.name){
                return;
            }
            let index = configManager.getTopList().indexOf($var.currentName)
            if(index === -1){
                $var.utools.selectedIndex = configManager.addTopItem($var.currentName);
            }else{
                configManager.delTopItem(index)
            }
            refreshListView()
            break;
        case 'KeyD':
        case 'KeyX':
            $var.utools.subItemSelectedIndex = 1;
            $var.view.isDel = true;
            break;
        case 'KeyV':
                if(!$var.view.fullScreenShow){
                    $var.view.fullScreenShow = true;
                    $var.view.recoverLiteShow= true;
                    utools.setExpendHeight(545)
                }
                $var.lastQueryCodeSnippetName = $var.currentName;
                $var.currentSnippet = codeSnippetManager.get($var.currentName)
                $var.currentMode = CODE_VIEW;
                return;
        case 'KeyQ':
            $var.utools.subItemSelectedIndex = -1;
            $var.view.isDel = false;
            break;
        default:
            dealWithCommonView(e)
            break;
    }

}
const isElementVisible = (el) => {
    const rect = el.getBoundingClientRect()
    const vWidth = window.innerWidth || document.documentElement.clientWidth
    const vHeight = window.innerHeight || document.documentElement.clientHeight
    if (
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > vWidth ||
        rect.top > vHeight
    ) {
        return false
    }

    return true
}
function handleMdHorizonMove(left,fast){
    let pres  = document.querySelectorAll(".v-md-editor-preview > .github-markdown-body .v-md-pre-wrapper > pre")
    let distance = fast? 50 : 10;
    // 判断视口
    for (let pre of pres) {
        if(isElementVisible(pre)){
            if(left){
                if(pre.scrollLeft < distance){
                    pre.scrollLeft = 0;
                }else{
                    pre.scrollLeft -= distance;
                }
            }else{
                pre.scrollLeft += distance;
            }
            return;
        }
    }
}

function dealWithCodeView(e){
    switch (e.code){
        case "KeyH":
        case "ArrowLeft":
            if($var.currentSnippet.type === 'markdown'){
                if($var.view.isRendering){
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
            if($var.currentSnippet.type === 'markdown'){
                if($var.view.isRendering){
                    handleMdHorizonMove(false,e.shiftKey)
                    break;
                }
            }
            doScrollForCodeView(Direction.RIGHT,e.shiftKey);
            break;
        case 'KeyS':
            $var.view.showCodeTip = !$var.view.showCodeTip;
            break;
        case 'KeyQ':
            handleRecoverLiteShow();
            $var.currentMode = LIST_VIEW;
            $var.utools.keepSelectedStatus = true;
            break;
        case 'Digit0':
            doScrollForCodeView(Direction.RESET,false);
            break;
        case 'KeyR':
            if($var.currentSnippet.path && $var.currentSnippet.type === 'image'){
                return;
            }
            $var.view.isRendering = !$var.view.isRendering;
            break;
        case 'KeyB':
            if($var.currentSnippet.path){
                $var.others.updateCacheCodeFunc?.()
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
            if($var.currentName === defaultHelpSnippet.name){
                $message.warning("内置文档，无法修改");
                return;
            }
            if(!$var.view.fullScreenShow){
                $var.view.fullScreenShow = true;
                $var.view.recoverLiteShow= true;
                utools.setExpendHeight(545)
            }
            if($var.view.helpActive){
                $var.view.helpActive = false;
            }
            $var.currentMode = UPDATE_VIEW;
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
            if(!$var.view.fullScreenShow){
                $var.view.fullScreenShow = true;
                utools.setExpendHeight(545)
            }
            $var.view.helpActive = !$var.view.helpActive;
            break
    }
}


/**
 * @param list - ListView的响应式列表
 */
function init(list) {
    document.onkeydown = e => {
        // ignore  update view or create view
        if ($var.currentMode > CODE_VIEW) {
            return;
        }
        // dialog or sideview
        if ($var.view.settingActive) {
            // prevent any possible event
            if ( e.code === 'Enter' || e.code === 'Tab') {
                e.preventDefault();
            } else if (e.code === 'KeyQ' || e.code === 'Slash') {
                $var.view.settingActive = false;
            }
            return;
        }else if($var.view.customActive){
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
                $var.view.fullScreenShow = !$var.view.fullScreenShow;
                $var.utools.focused = true;
                utools.subInputFocus();
            } else {
                if ($var.utools.focused && $var.utools.selectedIndex > -1) {
                    $var.utools.focused = false;
                    $var.view.cursorShow = false;
                    utools.subInputBlur();
                    gotoTheLastPosition();
                } else {
                    utools.subInputFocus();
                    $var.utools.focused = true;
                }
            }
            lastTabTime = e.timeStamp;
            return;
        }else if(e.code === 'Space'){
            e.preventDefault();
        }else if(e.code === 'KeyZ'){
            $var.view.helpActive = !$var.view.helpActive;
            return;
        }
        // 其他键无法触发
        if ($var.utools.focused) {
            return;
        }
        // 处理Ctrl键
        if (e.ctrlKey || e.metaKey) {
            switch (e.code){
                case 'KeyN':
                    if (!$var.view.fullScreenShow) {
                        $var.view.fullScreenShow = true;
                        $var.view.recoverLiteShow = true;
                        utools.setExpendHeight(545)
                    }
                    $var.currentMode = CREATE_VIEW;
                    return;
                case 'KeyR':
                    if($var.currentMode === LIST_VIEW){
                        refreshListView()
                    }
                    return;
                case 'KeyF':
                    if($var.currentMode === LIST_VIEW){
                        if (configManager.get("enabledFuzzySymbolQuery")) {
                            configManager.set("enabledFuzzySymbolQuery", false)
                            $message.info("退出【模糊符号查询】模式")
                        } else {
                            configManager.set("enabledFuzzySymbolQuery", true)
                            $message.success("进入【模糊符号查询】模式")
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
        if($var.view.helpActive){
            dealWithHelpViewOnly(e);
            return;
        }
        // 剩余处理
        if ($var.currentMode === LIST_VIEW) {
            dealWithListView(e, list)
        } else {
            dealWithCodeView(e)
        }
    }
    document.onkeyup = e => {
        if ($var.view.settingActive | $var.utools.focused || $var.utools.selectedIndex < 0 || $var.currentMode > CODE_VIEW) {
            return;
        }
        if (e.code === 'Space') {
            e.preventDefault();
            if (longKeyDown) {
                longKeyDown = false;
                handleRecoverLiteShow();
                $var.currentMode = LIST_VIEW;
                $var.utools.keepSelectedStatus = true;
                return;
            }
            if ($var.currentMode === LIST_VIEW) {
                if ($var.utools.subItemSelectedIndex === -1) {
                    // // 校准位置
                    // console.log('space invoke to the last position')
                    // gotoTheLastPosition();
                } else {
                    // 处理 Vim 操作
                    $var.scroll.spaceInvoker[$var.utools.subItemSelectedIndex]?.()
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
    if(searchWord == null || searchWord.length === 0){
        if($var.view.fullScreenShow  || !configManager.get('noShowForEmptySearch')){
            array = codeSnippetManager.queryForMany(null,null,null)
        }else{
            if(!configManager.get('closeHelpSnippet')){
                return [defaultHelpSnippet];
            }
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
    if( $var.utools.selectedIndex<0 || $var.utools.selectedIndex>=array.length ||   $var.utools.keepSelectedStatus===null){
        $var.utools.selectedIndex = (array.length===0)? -1: 0;
    }else if($var.utools.keepSelectedStatus){
        nextTick(()=>{
            // 校准位置
            console.log('go to the last position')
            gotoTheLastPosition();
        })
    }
    $var.utools.subItemSelectedIndex = -1;
    // 重置
    $var.utools.keepSelectedStatus = false;
    // 控制tip显示策略
    $var.others.onlyOne =  array.length === 1;
    return array;
}




export {
    init,
    parseSearchWord
}