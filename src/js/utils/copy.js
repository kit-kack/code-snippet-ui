import {$index, $normal, $reactive} from "../store";
import {formatManager} from "../utools/func";
import {isNetWorkUri} from "./common";
import { isEmpty as _isEmpty } from "lodash-es"
import {GLOBAL_HIERARCHY} from "../hierarchy/core";

const ctrlKey = utools.isMacOS()? 'command':'ctrl'
let lastCachedMsg = null;
let isLastPasted = false;
function getCode(path,noView){
    if(isNetWorkUri(path)){
        const xhr = new XMLHttpRequest();
        xhr.open('get',path,false);
        xhr.send()
        if(200 <=xhr.status <= 299){
            return xhr.responseText;
        }else{
            _notify(`😅加载失败: 网络文件[ ${path} ]，原因为${xhr.statusText}`,noView)
            return null;
        }
    }else {
        try{
            return window.preload.readFile(path).toString()?? '[本地内容为空]'
        }catch (e) {
            _notify(`😅加载失败: 本地文件[ ${path} ]，原因为${e.message}`, noView)
            return null;
        }
    }
}

/**
 * @return {Promise<boolean>} - 若返回true，则进入【变量输入】界面
 */
async function copyOrPasteWithType(isPasted,text,type,msg,noView){
    lastCachedMsg = msg;
    isLastPasted = isPasted;
    if(type && type.length>2 && type.startsWith('x-')){
        text = await formatManager.parse(text);
    }
    if(text === null){
        // 进入【变量输入】界面
        return true;
    }
    copyOrPaste(text,noView);
}

/**
 * @param text
 * @param {boolean} [noView]
 */
export function copyOrPaste(text,noView){
    if(lastCachedMsg){
        _notify(lastCachedMsg,noView,true)
    }
    utools.copyText(text)
    if(isLastPasted){
        try{
            // utools新API
            utools.hideMainWindowPasteText(text)
            return;
        }catch (_){}
    }
    // 粘贴
    if(isLastPasted){
        utools.hideMainWindow();
        utools.simulateKeyboardTap('v',ctrlKey);
    }
}

 /**
 * 通知信息
 * @param {string} msg
 * @param {boolean} noView
 * @param {boolean} [success]
 * @private
 */
function _notify(msg,noView,success){
    if(noView){
        utools.showNotification(msg)
    }else{
        if(success){
            $message.success(msg)
        }else{
            $message.warning(msg)
        }
    }
}

/**
 *
 * @param {boolean} isPasted - 是否粘贴
 * @param {number} [num] - 子代码片段,若为undefined，则为复制粘贴整体代码
 * @param {boolean} [noView] - 适用于没有UI的场景
 * @return {Promise<boolean | undefined>} - 该返回值适用于keyword进入,若返回true，则进入【变量输入】界面
 */
export async function copyCode(isPasted,num,noView){
    // 校验
    if ($index.value < 0){
        return;
    }
    // 获取代码
    const id = $reactive.currentSnippet.id?? $reactive.currentSnippet.name;
    if($normal.lastQueryCodeSnippetId !== id){  // 获取代码
        if(!$reactive.currentSnippet.code && $reactive.currentSnippet.path){
            const temp = getCode($reactive.currentSnippet.path,noView);
            if(temp === null){
                _notify("当前代码片段加载失败，无法复制粘贴",noView)
                return;
            }else{
                $reactive.currentCode = temp??'';
                $normal.lastQueryCodeSnippetId = id;
            }
        }else{
            $reactive.currentCode = $reactive.currentSnippet.code??'';
        }
    }
    // 复制操作
    if(num === undefined){
        // 更新次数和时间
        GLOBAL_HIERARCHY.update(null,"count&time")
        // 复制
        if(await copyOrPasteWithType(isPasted,$reactive.currentCode,$reactive.currentSnippet.type,`${$reactive.currentSnippet.name} 内容已复制`,noView)){
            return noView;
        }

    }else{
        if(num < 0){
            _notify("子代码片段序号非法",noView);
        }else if(num === 0){
            if(_isEmpty($reactive.currentSnippet.sections)){
                _notify("当前代码片段没有子代码片段，故不支持该操作",noView)
            }else{
                if(!$reactive.currentCode){
                    _notify("当前代码片段不支持",noView)
                    return;
                }
                const lines = $reactive.currentCode.split('\n')
                let str = '';
                for (const section of $reactive.currentSnippet.sections) {
                    // start
                    const start = section[0] >= 1 ? section[0] : 1;

                    if(start > lines.length){
                        // 提前终止
                        break;
                    }
                    const end = section[1] > lines.length? lines.length : section[1];

                    // join
                    for (let i = start; i <= end; i++) {
                        str += (lines[i-1]+'\n')
                    }
                }

                // 更新次数和时间
                GLOBAL_HIERARCHY.update(null,"count&time")

                // 复制
                if(await copyOrPasteWithType(isPasted,str.slice(0,-1),$reactive.currentSnippet.type,`${$reactive.currentSnippet.name} 子片段聚合 内容已复制`,noView)){
                    return noView;
                }
            }
        }else{
            if($reactive.currentSnippet.sections && $reactive.currentSnippet.sections.length >= num){
                const  [start,end] = $reactive.currentSnippet.sections[num-1]
                if(!$reactive.currentCode){
                    _notify("当前代码片段不支持",noView)
                    return;
                }
                const lines = $reactive.currentCode.split('\n',end)
                if(lines.length < start){
                    _notify("区间值超出代码片段区间，请更新或清除旧区间值",noView)
                    return;
                }
                let str = '';
                for (let i = start; i <= lines.length; i++) {
                    str += (lines[i-1]+'\n')
                }
                // 更新次数和时间
                GLOBAL_HIERARCHY.update(null,"count&time")
                // 复制
                if(await copyOrPasteWithType(isPasted,str.slice(0,-1),$reactive.currentSnippet.type,`${$reactive.currentSnippet.name} ${num}号子片段 内容已复制`,noView)){
                    return noView;
                }
            }else{
                _notify(`当前片段没有 ${num}号 子代码片段`,noView)
            }
        }

    }
}