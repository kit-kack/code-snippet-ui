import {$normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../store";
import {Direction, doScrollForCodeView} from "../utils/scroller";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {configManager} from "../utools/config";
import {K_COMMON_DOWN, K_COMMON_UP} from "./k-common";

export const RENDER_KEYHANDLER = {
    /**
     * @type KeyUpHandler | null
     */
    onKeyUp: null,
    /**
     * @type KeyDownHandler | null
     */
    onKeyDown: null
}
/**
 * @type KeyDownHandler
 */
export const K_CODEVIEW_DOWN = (ext)=>{
    const {code,ctrl,shift,double,repeat} = ext;
    // modal
    if($reactive.code.sectionsChangeModal){
        return
    }
    // active
    if($reactive.code.infoActive){
        if(code === 'KeyQ' || code === 'KeyS' || code === 'Space'){
            $reactive.code.infoActive = false
        }
        return
    }
    // render
    if(RENDER_KEYHANDLER.onKeyDown){
        if(RENDER_KEYHANDLER.onKeyDown(ext)){
            return true;
        }
    }

    switch (code){
        case "KeyH":
        case "ArrowLeft":
            if(!ctrl){
                doScrollForCodeView(Direction.LEFT,shift);
            }
            break;
        case "KeyJ":
        case "ArrowDown":
            if(!ctrl){
                doScrollForCodeView(Direction.DOWN,shift);
            }
            break;
        case "KeyK":
        case "ArrowUp":
            if(!ctrl){
                doScrollForCodeView(Direction.UP,shift);
            }
            break;
        case "KeyL":
        case "ArrowRight":
            if(!ctrl){
                doScrollForCodeView(Direction.RIGHT,shift);
            }
            break;
        case 'KeyG':
            if(double){
                doScrollForCodeView(Direction.RESET,false)
            }else if(shift){
                doScrollForCodeView(Direction.END,false);
            }
            break
        case 'KeyS':
            if(repeat){
                return;
            }
            $reactive.code.infoActive = !$reactive.code.infoActive;
            break;

        default:
            return K_COMMON_DOWN(ext);
        // case 'KeyB':
        //     if($reactive.currentSnippet.path){
        //         $normal.updateCacheCodeFunc?.()
        //     }
        //     break;
    }
    return true;
}

/**
 * @type KeyUpHandler
 */
export const K_CODEVIEW_UP = (ext)=>{
    const {code,ctrl,shift} = ext;

    if(code === 'Space' && $normal.keyboard.longTabAsQuickView){
        GLOBAL_HIERARCHY.changeView(LIST_VIEW)
        $normal.keyboard.longTabAsQuickView = false
        return true;
    }
    // modal
    if($reactive.code.sectionsChangeModal){
        return
    }
    // active
    if($reactive.code.infoActive){
        return
    }
    // render
    if(RENDER_KEYHANDLER.onKeyUp){
        if(RENDER_KEYHANDLER.onKeyUp(ext)){
            return true;
        }
    }

    switch (code){
        case "Tab":
            utools.subInputBlur();
            break;
        case 'KeyQ':
            $reactive.utools.keepSelectedStatus = true;
            if($reactive.code.sectionsChange){
                $reactive.code.sectionsChangeModal = true;
                $reactive.code.sectionsChangeTriggerIsListView = true;
            }else{
                GLOBAL_HIERARCHY.changeView(LIST_VIEW);
            }
            break;
        case 'KeyR':
            if($reactive.currentSnippet.type === 'image'){
                return;
            }
            $reactive.code.isRendering = !$reactive.code.isRendering;
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
            if($reactive.code.sectionsChange){
                $reactive.code.sectionsChangeModal = true;
                $reactive.code.sectionsChangeTriggerIsListView =false;
            }else{
                GLOBAL_HIERARCHY.changeView(EDIT_VIEW)
            }
            break;
        case 'KeyP':
            if(ctrl){
                $reactive.code.isPure = ! $reactive.code.isPure;
                configManager.set('pure_mode',$reactive.code.isPure)
                break
            }
        default:
            return K_COMMON_UP(ext);
        // case 'KeyB':
        //     if($reactive.currentSnippet.path){
        //         $normal.updateCacheCodeFunc?.()
        //     }
        //     break;
    }
    return true;
}