import hljs from "highlight.js/lib/core";

let rootLanguages = hljs.listLanguages();
rootLanguages.push("vue","html")
rootLanguages = rootLanguages.sort()
let languages = rootLanguages.map(v=>{
    if(v === "plaintext"){
        return {
            label: "plaintext - 纯文本",
            value: "plaintext"
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

const columns = [
    {
        title: "Type",
        key: "type",
        rowSpan: (data,index) =>{
            switch (index){
                case 0:
                case 3:
                    return 3;
                case 6:
                    return 7;
                default:
                    return 1;
            }
        }
    },
    {
        title:"Feature",
        key:"feature"
    },
    {
        title: "Shortcut",
        key: "shortcut"
    }
]
const data = [
    {
        type:"主界面",
        feature: "创建代码片段",
        shortcut:"C-n"
    },
    {
        type:"主界面",
        feature: "刷新",
        shortcut: "C-r"
    },
    {
        type:"主界面",
        feature: "启用/关闭Vim模式，utool输入框失聚焦",
        shortcut:"Tab"
    },
    {
        type: "元素",
        feature: "粘贴使用",
        shortcut: "双击(手动开启功能) 搜索框+Enter"
    },
    {
        type: "元素",
        feature: "预览代码片段",
        shortcut: "C-点击"
    },
    {
        type: "元素",
        feature: "处理",
        shortcut: "右击"
    },
    {
        type:"元素-Vim模式",
        feature: "上下浏览",
        shortcut: "j k ↑ ↓"
    },
    {
        type:"元素-Vim模式",
        feature: "左右浏览",
        shortcut: "h l ← →"
    },
    {
        type: "元素-Vim模式",
        feature: "预览代码片段View",
        shortcut: "v Space(长按)"
    },
    {
        type: "元素-Vim模式",
        feature: "编辑Edit",
        shortcut: "e"
    },
    {
        type: "元素-Vim模式",
        feature: "复制Copy",
        shortcut: "c y",
    },
    {
        type: "元素-Vim模式",
        feature: "粘贴Paste",
        shortcut: "Enter p"
    },
    {
        type: "元素-Vim模式",
        feature: "删除Delete",
        shortcut: "d x"
    }
]



export {
    languages,
    columns,
    data,
    isSupportedLanguage
}