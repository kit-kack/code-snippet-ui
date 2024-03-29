import {$index, $normal, $reactive, CODE_VIEW, CREATE_VIEW, EDIT_VIEW, LIST_VIEW, switchToFullUIMode,} from "../store"
import {isNetWorkUri} from "../utils/common";
import {Direction, doScrollForHelpView} from "../utils/scroller";
import {copyCode} from "../utils/copy";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {dealWithListView} from "./list-view";
import {dealWithCodeView} from "./code-view";

// 上次按键时间
let lastPressedTime = 0;


function dealWithHelpViewOnly(e){
    switch (e.code){
        case 'KeyJ':
            doScrollForHelpView(Direction.DOWN,e.shiftKey)
            break;
        case 'KeyK':
            doScrollForHelpView(Direction.UP,e.shiftKey);
            break;
        case 'KeyG':
            doScrollForHelpView(Direction.RESET);
            break;
        case 'KeyZ':
        case 'KeyQ':
            $reactive.common.shortcutActive = false;
            break;
    }
}

/**
 * ListView & CodeView
 */
export function dealWithCommonView(e,ctrlFlag){
    switch (e.code){
        case 'KeyC':
            if(ctrlFlag){
                break;
            }
        case 'KeyY':
            if($reactive.currentSnippet.dir){
                $message.warning("无法对目录进行此操作");
                return;
            }
            if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
                $message.warning("无法对链接进行此操作");
                return;
            }
            e.preventDefault();
            copyCode(false);
            // handleCopy(false)
            break;
        case 'KeyP':
            if($reactive.currentSnippet.dir){
                $message.warning("无法对目录进行此操作");
                return;
            }
            if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
                $message.warning("无法对链接进行此操作");
                return;
            }
            e.preventDefault();
            copyCode(true);
            // handleCopy(true)
            break;
        case 'KeyE':
        case 'KeyI':
            if($reactive.currentSnippet.help){
                $message.warning("内置文档，无法修改");
                return;
            }
            if($reactive.common.shortcutActive){
                $reactive.common.shortcutActive = false;
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
            if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
                $message.warning("无法对链接进行此操作");
                return;
            }
            e.preventDefault();
            copyCode(e.shiftKey || e.altKey || ctrlFlag,+e.code[5])
            break;
        case 'KeyZ':
            switchToFullUIMode()
            $reactive.common.shortcutActive = !$reactive.common.shortcutActive;
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
        case 'KeyN':
            if(ctrlFlag){
                GLOBAL_HIERARCHY.changeView(CREATE_VIEW)
            }
            break
    }
}



/**
 *
 */
export function initKeyboardListener() {
    document.onkeydown = e => {
        if($reactive.utools.vimDisabled){
            return;
        }
        // ignore  update view or create view
        if ($reactive.currentMode >= EDIT_VIEW) {
            return;
        }
        // common
        if($reactive.common.variableActive || $reactive.main.tagColorActive){
            return;
        }
        if($reactive.common.shortcutActive){
            dealWithHelpViewOnly(e);
            return;
        }

        const gap = e.timeStamp - lastPressedTime;
        let pressedKey = $normal.keyboard.lastPressedKey;
        if(gap > 300){
            pressedKey = null;
        }
        const ctrlFlag = e.ctrlKey || e.metaKey;
        // 剩余处理
        if ($reactive.currentMode === LIST_VIEW) {
            dealWithListView(e,ctrlFlag,pressedKey)
        } else {
            dealWithCodeView(e,ctrlFlag)
        }
        //
        $normal.keyboard.lastPressedKey = e.code;
        lastPressedTime = e.timeStamp;
    }
    document.onkeyup = e => {
        if ($reactive.utools.vimDisabled || $reactive.main.settingActive | $reactive.utools.focused || $index.value < 0 || $reactive.currentMode >= EDIT_VIEW) {
            return;
        }
        if (e.code === 'Space') {
            e.preventDefault();
            if ($normal.keyboard.isLongPressed) {
                $normal.keyboard.isLongPressed = false;
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
                    $normal.spaceInvoker[$reactive.utools.subItemSelectedIndex]?.()
                }
            }
        }
    }
    document.onmousedown = e =>{
        if(e.button < 3){
            return;
        }
        if($reactive.currentMode === LIST_VIEW){
            if(e.button === 3){ // back
                GLOBAL_HIERARCHY.changeHierarchy('prev')
            }else if(e.button === 4){  // next
                if($reactive.currentSnippet.dir){
                    GLOBAL_HIERARCHY.changeHierarchy("next")
                }else if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
                    utools.shellOpenExternal($reactive.currentSnippet.path)
                }else{
                    GLOBAL_HIERARCHY.changeView(CODE_VIEW)
                }
            }
        }else if($reactive.currentMode === CODE_VIEW){
            if(e.button === 3){
                GLOBAL_HIERARCHY.changeView(LIST_VIEW)
            }
        }
    }
}
