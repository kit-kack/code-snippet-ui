import hljs from "highlight.js";
import {$var} from "./store";
import {nextTick} from "vue";

let rootLanguages = hljs.listLanguages();
rootLanguages.push("vue","html")
rootLanguages = rootLanguages.sort()
const languages = rootLanguages.map(v=>{
    if(v === "plaintext"){
        return {
            label: "plaintext - 纯文本",
            value: "plaintext"
        }
    }else if(v === "markdown"){
        return {
            label: "markdown - 可渲染显示✨",
            value: "markdown"
        }
    }
    return {
        label:v,
        value:v
    }
});


const isSupportedLanguage = (languageName)=>{
    if(languageName==null){
        return false;
    }
    return rootLanguages.includes(languageName)
}
const calculateTime =(time)=>{
    if(time == null){
        return '未知';
    }
    let old = new Date(time);
    let difftime = (Date.now() -old)/1000; //计算时间差,并把毫秒转换成秒
    let days = Math.trunc(difftime/86400); // 天  24*60*60*1000
    if(days > 0){
        if(days > 10){
            return old.toLocaleDateString();
        }else if(days === 1){
            return '昨天'
        }else if(days === 2){
            return '前天'
        }else{
            return days+'天前'
        }
    }
    let hours = Math.trunc(difftime/3600)-24*days;    // 小时 60*60 总小时数-过去的小时数=现在的小时数
    if(hours > 0){
        return hours+'小时前';
    }
    let minutes = Math.trunc(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
    if(minutes > 0){
        return minutes+'分钟前';
    }
    let seconds = Math.trunc(difftime%60);  // 以60秒为一整份 取余 剩下秒数

    if(seconds> 0){
        return seconds+'秒前';
    }
    return '现在';
}



const handleRecoverLiteShow = ()=>{
    if($var.view.recoverLiteShow){
        $var.view.recoverLiteShow= false;
        $var.view.fullScreenShow = false;
        utools.setExpendHeight($var.view.recoverLiteHeight)
    }
}

const refreshListView = ()=>{
    $var.view.refresh = false;
    nextTick(()=>{
        $var.view.refresh = true
    })
}

export {
    languages,
    isSupportedLanguage,calculateTime,handleRecoverLiteShow,refreshListView
}