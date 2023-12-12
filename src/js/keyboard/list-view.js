import {configManager} from "../core/config";
import {
    $index, $list,
    $normal,
    $reactive,
    CODE_VIEW,
    refreshListView,
    refreshSearchResult,
    switchToFullUIMode,
    utools_focus_or_blur,
} from "../store"
import {Direction, doScrollForListView, doScrollForMultiLineCode} from "../utils/scroller";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import _ from "lodash";
import {dealWithCommonView} from "./core";
import {copyCode} from "../utils/copy";


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
    if($reactive.main.isDel){
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
    if($reactive.main.isDel){
        $reactive.utools.subItemSelectedIndex = $reactive.utools.subItemSelectedIndex === 0? 1:0;
    }else{
        if($reactive.utools.subItemSelectedIndex === 4){
            $reactive.utools.subItemSelectedIndex = -1;
        }else{
            $reactive.utools.subItemSelectedIndex ++;
        }
    }
},120)



/**
 * Only ListView
 */
export function dealWithListView(e,ctrlFlag,lastPressedKey){
    // active
    if($reactive.main.settingActive){
        if($reactive.setting.funcEditActive){
            return;
        }
        // prevent any possible event
        if ( e.code === 'Enter' || e.code === 'Tab' || e.code === 'Space') {
            e.preventDefault();
        } else if (e.code === 'KeyQ' || e.code === 'Slash') {
            $reactive.main.settingActive = false;
        }
        return;
    }

    // super key
    if(e.code === 'Tab'){
        e.preventDefault();
        if(lastPressedKey === 'Tab'){
            // UI 切换
            if(configManager.get('strategy_item_code_show') === 2){
                $reactive.main.isFullScreenShow = true;
                return;
            }
            $reactive.main.isFullScreenShow = !$reactive.main.isFullScreenShow;
            configManager.set('lite',!$reactive.main.isFullScreenShow)
            refreshListView()
            utools_focus_or_blur(true)
        }else{
            // vim模式切换
            if ($reactive.utools.focused && $index.value > -1) {
                $reactive.main.isCursorShow = false;
                utools_focus_or_blur(false)
                doScrollForListView()
            } else {
                utools_focus_or_blur(true)
            }
        }
        return;
    }else if (e.code === 'Enter') {
        e.preventDefault();
        if($reactive.currentSnippet.dir){
            return;
        }
        copyCode(true,$normal.beta.subSnippetNum)
        // handleCopy(true)
        return;
    }


    // // 其他键无法触发
    // if ($reactive.utools.focused) {
    //     return;
    // }

    // vim操作下隐藏鼠标
    $reactive.main.isCursorShow = false;
    switch (e.code){
        case "Slash": // / ?
            switchToFullUIMode();
            $reactive.main.settingActive = true;
            break;
        case "Space":
            // 空格额外处理
            e.preventDefault();
            if(e.repeat && !$normal.keyboard.isLongPressed){
                if($reactive.utools.subItemSelectedIndex === -1){
                    if(!$reactive.currentSnippet.dir){
                        GLOBAL_HIERARCHY.changeView(CODE_VIEW)
                    }
                    $normal.keyboard.isLongPressed = true;
                }
            }
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
            if($reactive.main.isDel){
                $reactive.main.isDel = false;
            }
            if(e.shiftKey && configManager.get('strategy_item_code_show') === 2){
                if ($index.value === -1) { // -1 >= 0-1
                    $message.error("没有可选择的元素")
                }else {
                    doScrollForMultiLineCode(Direction.DOWN);
                }
            }else{
                if ($index.value >= $list.value.length -1) { // -1 >= 0-1
                    // $message.info("施主收手吧，已经到底了");
                }else {
                    debMoveDown()
                }
            }
            break;
        case "KeyK":
        case "ArrowUp":
            if($reactive.main.isDel){
                $reactive.main.isDel = false;
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
            }else{
                GLOBAL_HIERARCHY.update(null,"top");
                $normal.keepSelectedStatus = true;
                // refreshListView(true)
                refreshSearchResult();
            }
            break;
        case 'KeyD':
        case 'KeyX':
            if(GLOBAL_HIERARCHY.currentConfig.remove){
                $reactive.utools.subItemSelectedIndex = 1;
                $reactive.main.isDel = true;
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
            break
        case 'KeyR':
            if(ctrlFlag){
                refreshListView()
            }else{
                GLOBAL_HIERARCHY.changeHierarchy("root")
            }
            break
        case 'KeyQ':
            if($reactive.utools.subItemSelectedIndex !== -1 || $reactive.main.isDel){
                $reactive.utools.subItemSelectedIndex = -1;
                $reactive.main.isDel = false;
            }else{
                GLOBAL_HIERARCHY.changeHierarchy("prev")
            }
            break;
        default:
            dealWithCommonView(e,ctrlFlag)
    }
}

