import {$normal, $reactive} from "../store";
import {codeSnippetManager, configManager, formatManager} from "../core";
import {toRaw} from "vue";

const ctrlKey = utools.isMacOS()? 'command':'ctrl'
let lastCachedMsg = null;
let isLastPasted = false;
function getCode(path,local,noView){
    if(local){
        try{
            return window.preload.readConfig(path)?? '[本地内容为空]'
        }catch (e){
            _notify(`😅加载失败: 本地文件[ ${path} ]，原因为${e.message}`,noView)
            return null;
        }
    }else {
        const xhr = new XMLHttpRequest();
        xhr.open('get',path,false);
        xhr.send()
        if(200 <=xhr.status < 400){
            return xhr.responseText;
        }else{
            _notify(`😅加载失败: 网络文件[ ${path} ]，原因为${xhr.statusText}`,noView)
            return null;
        }
    }
}

function copyOrPasteWithType(isPasted,text,type,msg,noView){
    if(type && type.length>2 && type.startsWith('x-')){
        text = formatManager.parse(text,isPasted,noView);
    }
    lastCachedMsg = msg;
    isLastPasted = isPasted;
    if(text === null){
        return true;
    }
    copyOrPaste(text)
}

/**
 * @param text
 */
export function copyOrPaste(text){
    if(lastCachedMsg){
        $message.success(lastCachedMsg);
    }
    if(isLastPasted){
        try{
            // utools新API
            utools.hideMainWindowPasteText(text)
            if(configManager.get('exitAfterPaste')){
                utools.outPlugin();
            }
            return;
        }catch (_){}
    }
    utools.copyText(text)
    // 粘贴
    if(isLastPasted){
        utools.hideMainWindow();
        utools.simulateKeyboardTap('v',ctrlKey);
        if(configManager.get('exitAfterPaste')){
            utools.outPlugin();
        }
    }
}

/**
 * 通知信息
 * @param {string} msg
 * @param {boolean} noView
 * @private
 */
function _notify(msg,noView){
    if(noView){
        utools.showNotification(msg)
    }else{
        $message.warning(msg)
    }
}

/**
 *
 * @param {boolean} isPasted - 是否粘贴
 * @param {number} [num] - 子代码片段,若为undefined，则为复制粘贴整体代码
 * @param {boolean} [noView] - 适用于没有UI的场景
 */
export function copyCode(isPasted,num,noView){
    // 校验
    if ($reactive.utools.selectedIndex < 0){
        return;
    }
    // 获取代码
    if($normal.lastQueryCodeSnippetId !== $reactive.currentSnippet.id){  // 获取代码
        if(!$reactive.currentSnippet.code && $reactive.currentSnippet.path){
            const temp = getCode($reactive.currentSnippet.path,$reactive.currentSnippet.local,noView);
            if(temp === null){
                _notify("当前代码片段加载失败，无法复制粘贴",noView)
                return;
            }else{
                $reactive.currentCode = temp??'';
                $normal.lastQueryCodeSnippetId = $reactive.currentSnippet.id;
            }
        }else{
            $reactive.currentCode = $reactive.currentSnippet.code??'';
        }
    }
    // 复制操作
    if(num === undefined){
        // 更新次数和时间
        $reactive.currentSnippet.time = Date.now();
        $reactive.currentSnippet.count = ($reactive.currentSnippet.count??0) +1;
        codeSnippetManager.update(toRaw($reactive.currentSnippet))
        // 复制
        if(copyOrPasteWithType(isPasted,$reactive.currentCode,$reactive.currentSnippet.type,`已复制代码片段${$reactive.currentSnippet.name}的内容`,noView)){
            return noView;
        }

    }else{
        if($reactive.currentSnippet.sections && $reactive.currentSnippet.sections.length >= num){
            const  [start,end] = $reactive.currentSnippet.sections[num-1]
            if(!$reactive.currentCode){
                $message.warning("当前代码片段不支持")
                return;
            }
            const lines = $reactive.currentCode.split('\n',end)
            if(lines.length < start){
                $message.warning("区间值超出代码片段区间，请更新或清除旧区间值")
                return;
            }
            let str = '';
            for (let i = start; i <= lines.length; i++) {
                str += (lines[i-1]+'\n')
            }
            // 更新次数和时间
            $reactive.currentSnippet.time = Date.now();
            $reactive.currentSnippet.count = ($reactive.currentSnippet.count??0) +1;
            codeSnippetManager.update(toRaw($reactive.currentSnippet))
            // 复制
            if(copyOrPasteWithType(isPasted,str.slice(0,-1),$reactive.currentSnippet.type,`已复制${$reactive.currentSnippet.name}#${num}号子代码片段的内容`,false)){
                return noView;
            }
        }else{
            $message.warning(`当前没有 ${num}号 子代码片段`)
        }
    }
}