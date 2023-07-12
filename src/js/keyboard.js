import {nextTick, toRaw} from "vue";
import {codeSnippetManager, configManager} from "./core.js";
import {$var, CODE_VIEW, CREATE_VIEW, LIST_VIEW,  UPDATE_VIEW} from "./store"
import {ctrlKey, handleCopy, handleRecoverLiteShow, refreshListView} from "./some";
import {debounce} from "./utils/debounce";

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
const handleScrollBar =(scrollBar,direction,fast)=>{
    const distance = fast? 50: 10;
    switch (direction){
        case "left":
            scrollBar?.scrollBy?.({left: -distance})
            break;
        case "down":
            scrollBar?.scrollBy?.({top: distance})
            break;
        case "up":
            scrollBar?.scrollBy?.({top: -distance})
            break;
        case "right":
            scrollBar?.scrollBy?.({left: distance})
            break;
        case "reset":
            scrollBar?.scrollTo?.({left:0,top:0,behavior:'smooth'})
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
        case "Slash":
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
                handleScrollBar($var.scroll.itemCodeInvoker,"left")
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
                    handleScrollBar($var.scroll.itemCodeInvoker,"down")
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
                    handleScrollBar($var.scroll.itemCodeInvoker,"up")
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
                handleScrollBar($var.scroll.itemCodeInvoker,"right")
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
                handleScrollBar($var.scroll.itemCodeInvoker,"reset")
            }else{
                $var.utools.selectedIndex = 0;
                $var.scroll.listInvoker?.scrollTo({top:0,left:0})
            }
            break;
        case 'KeyT':
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
            if($var.view.isRendering){
                if($var.currentSnippet.type === 'markdown'){
                    handleMdHorizonMove(true,e.shiftKey)
                }
            }else{
                handleScrollBar($var.scroll.codeInvoker,"left",e.shiftKey)
            }
            break;
        case "KeyJ":
        case "ArrowDown":
            handleScrollBar($var.scroll.codeInvoker,"down",e.shiftKey)
            break;
        case "KeyK":
        case "ArrowUp":
            handleScrollBar($var.scroll.codeInvoker,"up",e.shiftKey)
            break;
        case "KeyL":
        case "ArrowRight":
            if($var.view.isRendering){
                if($var.currentSnippet.type === 'markdown'){
                    handleMdHorizonMove(false,e.shiftKey)
                }
            }else{
                handleScrollBar($var.scroll.codeInvoker,"right",e.shiftKey)
            }
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
            handleScrollBar($var.scroll.codeInvoker,"reset")
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
            handleCopy(false)
            break;
        case 'KeyP':
            handleCopy(true)
            break;
        case 'KeyE':
            if(!$var.view.fullScreenShow){
                $var.view.fullScreenShow = true;
                $var.view.recoverLiteShow= true;
                utools.setExpendHeight(545)
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
            let num = (+e.code[5]) ;

            if($var.currentMode === LIST_VIEW){
                $var.currentSnippet = codeSnippetManager.get($var.currentName)
            }
            let sections = codeSnippetManager.get($var.currentName).sections;
            if(sections && sections.length >= num){
                const  [start,end] = sections[num-1]
                if(!$var.currentSnippet.code){
                    $message.warning("当前代码片段不支持")
                    return;
                }
                let lines = $var.currentSnippet.code.split('\n',end)
                if(lines.length < start){
                    $message.warning("区间值超出代码片段区间，请更新或清除旧区间值")
                    return;
                }
                let str = '';
                for (let i = start; i <= lines.length; i++) {
                    str += (lines[i-1]+'\n')
                }
                $var.currentSnippet.time = Date.now()
                $var.currentSnippet.count = ($var.currentSnippet.count??0) +1;
                codeSnippetManager.update(toRaw(($var.currentSnippet)))
                // 复制
                utools.copyText(str.slice(0,-1));
                $message.success(`已复制${$var.currentName}#${num}号子代码片段的内容`)
                // 粘贴
                if(e.shiftKey || e.altKey){
                    utools.hideMainWindow();
                    utools.simulateKeyboardTap('v',ctrlKey);
                    if(configManager.get('exitAfterPaste')){
                        utools.outPlugin();
                    }
                }
            }else{
                $message.warning(`当前没有 ${num}号 子代码片段`)
            }
            break;
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
            if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Tab') {
                e.preventDefault();
            } else if (e.code === 'KeyQ') {
                $var.view.settingActive = false;
            }
            return;
        }else if($var.view.customActive){
            return;
        }
        // super key
        if (e.code === 'Enter') {
            handleCopy(true)
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
        }
        // 其他键无法触发
        if ($var.utools.focused) {
            return;
        }
        // 处理Ctrl键
        if (e.ctrlKey || e.metaKey) {
            if (e.code === 'KeyN') {
                if (!$var.view.fullScreenShow) {
                    $var.view.fullScreenShow = true;
                    $var.view.recoverLiteShow = true;
                    utools.setExpendHeight(545)
                }
                $var.currentMode = CREATE_VIEW;
                return;
            } else if (e.code === 'KeyR' && $var.currentMode === LIST_VIEW) {
                refreshListView()
                return;
            } else if (e.code === 'KeyF' && $var.currentMode === LIST_VIEW) {
                if (configManager.get("enabledFuzzySymbolQuery")) {
                    configManager.set("enabledFuzzySymbolQuery", false)
                    $message.info("退出【模糊符号查询】模式")
                } else {
                    configManager.set("enabledFuzzySymbolQuery", true)
                    $message.success("进入【模糊符号查询】模式")
                }
            }
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