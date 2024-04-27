import {$normal, $reactive, CREATE_VIEW, EDIT_VIEW, switchToFullUIMode} from "../store";
import {isNetWorkUri, isSvg} from "../utils/common";
import {copyCode} from "../utils/copy";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
const notify = (msg,noView,warning) =>{
    if(noView){
        utools.showNotification(msg);
    }else{
        if(warning){
            $message.warning(msg);
        }else{
            $message.success(msg);
        }
    }
}

/**
 * @return {Promise<FormatResult | undefined>}
 * @param isPaste
 * @param sub
 * @param noView
 */
export const snippetCopyOrPaste =async (isPaste, sub,noView) =>{
    // dir
    if($reactive.currentSnippet.dir){
        notify("无法对目录进行此操作",noView,true);
        return;
    }
    // link
    if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
        if(isPaste){
            utools.shellOpenExternal($reactive.currentSnippet.path);
        }else{
            notify("无法对链接进行此操作",noView,true);
            return;
        }
    }
    // image
    if($reactive.currentSnippet.image){
        let attachment = utools.db.getAttachment($reactive.currentSnippet.imgId);
        if(!(isPaste? utools.hideMainWindowPasteImage(attachment) : utools.copyImage(attachment))){
            notify("操作失败，请确定图片是否合法",noView,true)
        }else{
            notify("已复制图片",noView)
        }
        attachment = null;
        return;
    }
    if($reactive.currentSnippet.type === "image"){
        const url = $reactive.currentSnippet.path ?? $reactive.currentSnippet.code;
        if(isSvg(url)){
            if(isPaste){
                utools.hideMainWindowPasteText(url);
            }else{
                utools.copyText(url)
                notify("已复制图片",noView)
            }
        }else{
            if(!(isPaste? utools.hideMainWindowPasteImage(url) : utools.copyImage(url))){
                notify("无效图片类型，请确保为本地图片",noView,true)
            }else{
                notify("已复制图片",noView)
            }
        }
    }else{
        // code
        return await copyCode(isPaste,sub,noView);
    }
}
/**
 * @type {KeyUpHandler}
 */
export const K_COMMON_UP = ({code,ctrl,shift})=>{
    switch (code){
        case 'KeyC':
            if(ctrl){
                return;
            }
            snippetCopyOrPaste(false,$normal.beta.subSnippetNum)
            break;
        case 'KeyY':
            snippetCopyOrPaste(false);
            break;
        case 'KeyP':
            snippetCopyOrPaste(true);
            break;
        case 'KeyE':
        case 'KeyI':
            if($reactive.currentSnippet.help || $reactive.main.isRecycleBinActive){
                $message.warning("当前元素不支持 编辑");
                return;
            }
            if($reactive.common.shortcutActive){
                $reactive.common.shortcutActive = false;
            }
            GLOBAL_HIERARCHY.changeView(EDIT_VIEW)
            break;
        case 'KeyO':
            if($reactive.currentSnippet.path){
                if(isNetWorkUri($reactive.currentSnippet.path)){
                    utools.shellOpenExternal($reactive.currentSnippet.path)
                }else{
                    if(shift){
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
            if(ctrl){
                GLOBAL_HIERARCHY.changeView(CREATE_VIEW)
            }
            break
    }
    return true;
}
let delaySubPasteTimer = null;
/**
 * @type {KeyDownHandler}
 */
export const K_COMMON_DOWN = ({code,ctrl,shift,alt,repeat}) => {
    switch (code){
        case 'KeyZ':
            switchToFullUIMode()
            $reactive.common.shortcutActive = !$reactive.common.shortcutActive;
            break
        case 'Enter':
            snippetCopyOrPaste(true,$normal.beta.subSnippetNum);
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
            if(repeat){
                break;
            }
            const isPaste = ctrl || shift || alt;
            if(delaySubPasteTimer){
                clearTimeout(delaySubPasteTimer);
                delaySubPasteTimer = null;
            }
            if(isPaste){
                delaySubPasteTimer = setTimeout(async ()=>{
                    await snippetCopyOrPaste(true,+code[5])
                },200)
            }else{
                snippetCopyOrPaste(false,+code[5])
            }
            return true;
        // ctrl c处理
        case 'KeyC':
            if(ctrl){
                return false;
            }
            break;
    }
    return true
}