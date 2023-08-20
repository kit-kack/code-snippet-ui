import {$var} from "../store";
import {codeSnippetManager, configManager, formatManager} from "../core";

const ctrlKey = utools.isMacOS()? 'command':'ctrl'
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

function copyOrPaste(isPasted,text,type){
    if(type && type.length>2 && type.startsWith('x-')){
        text = formatManager.parse(text,isPasted);
    }
    if(text === null){
        return;
    }
    if(isPasted){
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
    if(isPasted){
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
    if ($var.utools.selectedIndex < 0){
        return;
    }
    // 获取当前文本
    const codeSnippet = codeSnippetManager.get($var.currentName);
    // 获取代码
    if($var.lastQueryCodeSnippetName !== codeSnippet.name){  // 获取代码
        if(!codeSnippet.code && codeSnippet.path){
            const temp = getCode(codeSnippet.path,codeSnippet.local,noView);
            if(temp === null){
                _notify("当前代码片段加载失败，无法复制粘贴",noView)
                return;
            }else{
                $var.currentCode = temp??'';
                $var.lastQueryCodeSnippetName = codeSnippet.name;
            }
        }else{
            $var.currentCode = codeSnippet.code??'';
        }
    }
    // 复制操作
    if(num === undefined){
        // 更新次数和时间
        codeSnippet.time = Date.now();
        codeSnippet.count = (codeSnippet.count??0) +1;
        codeSnippetManager.update(codeSnippet)
        // 复制
        copyOrPaste(isPasted,$var.currentCode,codeSnippet.type)
        if(!noView){
            $message.success(`已复制代码片段${codeSnippet.name}的内容`)
        }
    }else{
        if(codeSnippet.sections && codeSnippet.sections.length >= num){
            const  [start,end] = codeSnippet.sections[num-1]
            if(!$var.currentCode){
                $message.warning("当前代码片段不支持")
                return;
            }
            const lines = $var.currentCode.split('\n',end)
            if(lines.length < start){
                $message.warning("区间值超出代码片段区间，请更新或清除旧区间值")
                return;
            }
            let str = '';
            for (let i = start; i <= lines.length; i++) {
                str += (lines[i-1]+'\n')
            }
            // 更新次数和时间
            codeSnippet.time = Date.now();
            codeSnippet.count = (codeSnippet.count??0) +1;
            codeSnippetManager.update(codeSnippet)
            // 复制
            copyOrPaste(isPasted,str.slice(0,-1),codeSnippet.type)
            $message.success(`已复制${codeSnippet.name}#${num}号子代码片段的内容`)
        }else{
            $message.warning(`当前没有 ${num}号 子代码片段`)
        }
    }
}