import {$reactive, LIST_VIEW} from "../store";
import {Direction, doScrollForCodeView} from "../utils/scroller";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {configManager} from "../core/config";
import {dealWithCommonView} from "./core";


export function dealWithCodeView(e,ctrlFlag){
    // active
    if($reactive.code.infoActive){
        if(e.code === 'KeyQ' || e.code === 'KeyS'){
            $reactive.code.infoActive = false
        }
        return
    }
    if($reactive.code.tocActive){
        if(e.code === 'KeyQ'){
            $reactive.code.tocActive = false
        }else if(e.code === 'KeyS'){
            $reactive.code.infoActive = true;
            $reactive.code.tocActive = false
        }
        return
    }

    switch (e.code){
        case "KeyH":
        case "ArrowLeft":
            doScrollForCodeView(Direction.LEFT,e.shiftKey);
            break;
        case "KeyJ":
        case "ArrowDown":
            if(!ctrlFlag){
                doScrollForCodeView(Direction.DOWN,e.shiftKey);
            }
            break;
        case "KeyK":
        case "ArrowUp":
            if(!ctrlFlag){
                doScrollForCodeView(Direction.UP,e.shiftKey);
            }
            break;
        case "KeyL":
        case "ArrowRight":
            doScrollForCodeView(Direction.RIGHT,e.shiftKey);
            break;
        case 'KeyS':
            $reactive.code.infoActive = !$reactive.code.infoActive;
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
            $reactive.code.isRendering = !$reactive.code.isRendering;
            break;
        case 'KeyP':
            if(ctrlFlag){
                $reactive.code.isPure = ! $reactive.code.isPure;
                configManager.set('pure_mode',$reactive.code.isPure)
                break
            }
        default:
            dealWithCommonView(e,ctrlFlag)
        // case 'KeyB':
        //     if($reactive.currentSnippet.path){
        //         $normal.updateCacheCodeFunc?.()
        //     }
        //     break;
    }
}