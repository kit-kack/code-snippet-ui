import {$normal, $reactive, CREATE_VIEW, EDIT_VIEW, switchToFullUIMode} from "../store";
import {isNetWorkUri, isSvg} from "../utils/common";
import {copyCode} from "../utils/copy";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";

export const snippetCopyOrPaste = (isPaste, supportSub) =>{
    // dir
    if($reactive.currentSnippet.dir){
        $message.warning("无法对目录进行此操作");
        return;
    }
    // link
    if($reactive.currentSnippet.path && $reactive.currentSnippet.link){
        if(isPaste){
            utools.shellOpenExternal($reactive.currentSnippet.path);
        }else{
            $message.warning("无法对链接进行此操作");
            return;
        }
    }
    // image
    if($reactive.currentSnippet.type === "image"){
        const url = $reactive.currentSnippet.path ?? $reactive.currentSnippet.code;
        if(isSvg(url)){
            if(isPaste){
                utools.hideMainWindowPasteText(url);
            }else{
                utools.copyText(url)
                $message.success("已复制图片")
            }
        }else{
            if(!(isPaste? utools.hideMainWindowPasteImage(url) : utools.copyImage(url))){
                $message.error("无效图片类型，请确保为本地图片")
            }else{
                $message.success("已复制图片")
            }
        }
    }else{
        // code
        copyCode(isPaste,supportSub ? $normal.beta.subSnippetNum: undefined);
    }
}
/**
 * @type {KeyUpHandler}
 */
export const K_COMMON_UP = ({code,ctrl,shift,alt})=>{
    switch (code){
        case 'KeyC':
            if(ctrl){
                return;
            }
            snippetCopyOrPaste(false,true)
            break;
        case 'KeyY':
            snippetCopyOrPaste(false,false);
            break;
        case 'KeyP':
            snippetCopyOrPaste(true,false);
            break;
        case 'Enter':
            snippetCopyOrPaste(true,true);
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
            copyCode(ctrl || shift || alt,+code[5])
            return true;
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
/**
 * @type {KeyDownHandler}
 */
export const K_COMMON_DOWN = ({code}) => {
    switch (code){
        case 'KeyZ':
            switchToFullUIMode()
            $reactive.common.shortcutActive = !$reactive.common.shortcutActive;
            break
    }
    return true
}