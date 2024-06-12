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
function _imageCopyOrPaste(copyOrPasteCommand,attachmentOrUrl){
    let flag = true;
    if(copyOrPasteCommand === "copy"){
        flag = utools.copyImage(attachmentOrUrl)
    }else{
        utools.hideMainWindowPasteImage(attachmentOrUrl)
    }
    if(flag){
        // 更新次数和时间
        GLOBAL_HIERARCHY.update(null,"count&time")
    }
    return flag;
}

/**
 * @return {Promise<FormatResult | undefined>}
 * @param {CopyOrPasteCommand} copyOrPasteCommand
 * @param {number | undefined} sub
 * @param {boolean | undefined} noView
 */
export const snippetCopyOrPaste =async (copyOrPasteCommand, sub,noView) =>{
    // dir
    if($reactive.currentSnippet.dir){
        notify("无法对目录进行此操作",noView,true);
        return;
    }
    // link
    if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
        if(copyOrPasteCommand === "copy"){
            notify("无法对链接进行此操作",noView,true);
            return;
        }else{
            utools.shellOpenExternal($reactive.currentSnippet.path);
        }
    }
    // image
    if($reactive.currentSnippet.image){
        let attachment = utools.db.getAttachment($reactive.currentSnippet.imgId);
        if(_imageCopyOrPaste(copyOrPasteCommand,attachment)){
            notify("已复制图片",noView)
        }else{
            notify("操作失败，请确定图片是否合法",noView,true)
        }
        attachment = null;
        return;
    }
    if($reactive.currentSnippet.type === "image"){
        const url = $reactive.currentSnippet.path ?? $reactive.currentSnippet.code;
        if(isSvg(url)){
            if(copyOrPasteCommand === "copy"){
                utools.copyText(url)
            }else if(copyOrPasteCommand === "paste"){
                utools.hideMainWindowPasteText(url);
            }else{
                utools.hideMainWindowTypeString(url);
            }
            notify("已复制图片",noView)
            GLOBAL_HIERARCHY.update(null,"count&time");
        }else{
            if(_imageCopyOrPaste(copyOrPasteCommand,url)){
                notify("已复制图片",noView)
            }else{
                notify("无效图片类型，请确保为本地图片",noView,true)
            }
        }
    }else{
        // code
        return await copyCode(copyOrPasteCommand,sub,noView);
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
            snippetCopyOrPaste("copy",$normal.beta.subSnippetNum)
            break;
        case 'KeyY':
            snippetCopyOrPaste("copy");
            break;
        case 'KeyP':
            snippetCopyOrPaste(shift ? "typing": "paste");
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
            snippetCopyOrPaste(shift ? "typing":"paste",$normal.beta.subSnippetNum);
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
            const isPaste = ctrl ||  alt;
            if(delaySubPasteTimer){
                clearTimeout(delaySubPasteTimer);
                delaySubPasteTimer = null;
            }
            if(isPaste){
                delaySubPasteTimer = setTimeout(async ()=>{
                    await snippetCopyOrPaste("paste",+code[5])
                },200)
            }else{
                snippetCopyOrPaste(shift ? "typing": "copy",+code[5])
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