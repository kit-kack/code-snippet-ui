import {
    $index, $list,
    $normal,
    $reactive,
    CODE_VIEW,
    refreshListView, refreshSearchResult,
    switchToFullUIMode,
    utools_focus_or_blur
} from "../store";
import {configManager} from "../utools/config";
import {Direction, doScrollForListView, doScrollForMultiLineCode, doScrollForSideCodeView} from "../utils/scroller";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import { throttle as _throttle } from "lodash-es"
import {K_COMMON_DOWN, K_COMMON_UP} from "./k-common";


const debMoveDown = _throttle(function(){
    $reactive.utools.subItemSelectedIndex = -1;
    $index.value++;
    // console.log($reactive.core.selectedIndex)
    doScrollForListView();
},120)
const debMoveUp = _throttle(function(){
    $index.value--;
    $reactive.utools.subItemSelectedIndex = -1;
    // $var.scroll.listInvoker?.("up")
    doScrollForListView()
},120)
const debItemMoveLeft = _throttle(function(){
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
const debItemMoveRight = _throttle(function(){
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

export const SIDE_RENDER_KEYHANDLER = {
    IMAGE_HANDLER: null,
    MARKDOWON_HANDLER: null,

}

function controlSideViewOrMultiLineCode(direction,code) {
    if($reactive.main.isSideCodeViewShow){
        // 判断类型
        let result;
        if($reactive.currentSnippet.type === "markdown"){
            if(SIDE_RENDER_KEYHANDLER.MARKDOWON_HANDLER){
                result = SIDE_RENDER_KEYHANDLER.MARKDOWON_HANDLER(code)
            }
        }else if($reactive.currentSnippet.type === "image" || $reactive.currentSnippet.type === "svg"){
            if(SIDE_RENDER_KEYHANDLER.IMAGE_HANDLER){
                result = SIDE_RENDER_KEYHANDLER.IMAGE_HANDLER(code)
            }
        }
        if(!result){
            doScrollForSideCodeView(direction);
        }
    }else if(configManager.get('strategy_item_code_show') === 2){
        doScrollForMultiLineCode(direction);
    }

}
/**
 * @type KeyUpHandler
 */
export const K_LISTVIEW_UP = (ext)=>{
    const {code,double,long,shift,ctrl,repeat,alt} = ext;
    // active
    if($reactive.main.settingActive){
        return
    }
    //
    // // vim操作下隐藏鼠标
    // $reactive.main.isCursorShow = false;
    switch (code){
        case 'Space':
            if ($reactive.utools.subItemSelectedIndex !== -1) {
                // 处理 Vim 操作
                $normal.spaceInvoker[$reactive.utools.subItemSelectedIndex]?.()
            }
            break;
        case "KeyS":
            utools.setSubInputValue('')
            utools.subInputFocus();
            $reactive.utools.focused = true;
            break;
        case 'KeyT':
            if($reactive.currentSnippet.help || $reactive.main.isRecycleBinActive){
                $message.warning('当前元素不支持 置顶');
            }else{
                GLOBAL_HIERARCHY.update(null,"top");
                $normal.keepSelectedStatus = true;
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
                if($reactive.main.isRecycleBinActive){
                    $message.warning("当前元素不支持 预览子元素");
                }else{
                    GLOBAL_HIERARCHY.changeHierarchy("next")
                }
            }else if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
                utools.shellOpenExternal($reactive.currentSnippet.path)
            }else{
                GLOBAL_HIERARCHY.changeView(CODE_VIEW)
            }
            break
        case 'KeyR':
            if(ctrl){
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
            return K_COMMON_UP(ext);
    }
    return true;
}
/**
 * @type KeyDownHandler
 */
export const K_LISTVIEW_DOWN = (ext)=>{
    const {code,double,long,shift,repeat,alt} = ext;
    // active
    if($reactive.main.settingActive){
        if($reactive.setting.funcEditActive || $reactive.setting.specialTagConfigActive){
            return;
        }
        // prevent any possible event
        if ( code === 'Enter' || code === 'Tab' || code === 'Space') {
            return true;
        } else if (code === 'KeyQ' || code === 'Slash') {
            $reactive.main.settingActive = false;
        }
        return;
    }

    // super key
    if(code === 'Tab'){
        if(repeat){
            return true;
        }
        if(double){
            // UI 切换
            if(configManager.get('strategy_item_code_show') === 2){
                $reactive.main.isFullScreenShow = true;
                $message.warning(' [多行元素代码块] 场景不支持切换UI模式')
                return;
            }
            if($reactive.main.isFullScreenShow){
                $reactive.main.isSideCodeViewShow = false;
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
        return true;
    }


    // // 其他键无法触发
    // if ($reactive.utools.focused) {
    //     return;
    // }

    // vim操作下隐藏鼠标
    $reactive.main.isCursorShow = false;
    switch (code){
        case "Space":
            // 空格额外处理
            if(long && $reactive.utools.subItemSelectedIndex === -1){
                if(!$reactive.currentSnippet.dir && !$reactive.currentSnippet.link){
                    $normal.keyboard.longTabAsQuickView = true;
                    GLOBAL_HIERARCHY.changeView(CODE_VIEW)
                }
            }
            break;
        case "Slash": // / ?
            switchToFullUIMode();
            $reactive.main.settingActive = true;
            break;
        case "KeyH":
        case "ArrowLeft":
            // 校验是否有效
            if($index.value=== -1){
                $message.error("没有可选择的元素")
            }else if(shift){
                controlSideViewOrMultiLineCode(Direction.LEFT,code)
            }else{
                debItemMoveLeft()
            }
            break;
        case "KeyJ":
        case "ArrowDown":
            if($reactive.main.isDel){
                $reactive.main.isDel = false;
            }
            if(shift){
                if($index.value === -1){
                    $message.error("没有可选择的元素")
                }else{
                    controlSideViewOrMultiLineCode(Direction.DOWN,code)
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
            if(shift){
                if($index.value === -1){
                    $message.error("没有可选择的元素")
                }else{
                    controlSideViewOrMultiLineCode(Direction.UP,code)
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
            }else if(shift){
                controlSideViewOrMultiLineCode(Direction.RIGHT,code)
            }else{
                debItemMoveRight();
            }
            break;
        case 'Period':
            // check
            switchToFullUIMode(true);
            $reactive.main.isSideCodeViewShow = !$reactive.main.isSideCodeViewShow;
            break;
        case "KeyG":
            if(double){
                $index.value = 0;
                doScrollForListView();
            }else if(shift){
                controlSideViewOrMultiLineCode(Direction.RESET,code)
            }
            break;
        default:
            return K_COMMON_DOWN(ext);
    }
    return true;
}