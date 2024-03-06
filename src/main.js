import {createApp, nextTick} from 'vue'
import './style.scss'
import App from './App.vue'
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd-dep";
import {copyCode} from "./js/utils/copy";
import {backupFilePath} from "./js/some";
import {$index, $normal, $reactive, CREATE_VIEW, LIST_VIEW, utools_focus_or_blur} from "./js/store";
import {tagColorManager} from "./js/utools/tag";
import {codeSnippetManager} from "./js/utools/snippet";
import {configManager} from "./js/utools/config";
import {formatManager} from "./js/utools/func";
import {GLOBAL_HIERARCHY} from "./js/hierarchy/core";
import {hierachyHubManager} from "./js/utools/hub";
import {generate_backup} from "./js/utools/backup";
import {adjustLightDarkTheme} from "./js/theme";
import {GLOBAL_KEYBOARD_HANDLER} from "./js/keyboard/core";
import {CountType, statisticsManager} from "./js/utools/statistics";
// init
configManager.init()
statisticsManager.init()
formatManager.init()
hierachyHubManager.init()
codeSnippetManager.init()
function bindApp(){
    tagColorManager.init()
    GLOBAL_KEYBOARD_HANDLER.init();
    const app = createApp(App)

    initNU(app)
    initVH(app)
    app.mount('#app')
}
utools.onPluginOut(processExit => {
    if(processExit){
        return;
    }
    $reactive.appRestart = true;
})



const enterApp = (data) => {
    if($normal.entry){
        $normal.entry = false;
        $reactive.appRestart = false;
    }else if($reactive.appRestart){
        $reactive.appRestart = false;
        $reactive.main.settingActive = false;
        $reactive.code.infoActive = false;
        $reactive.main.aidTagActive = false;
        $reactive.setting.funcEditActive = false;
        $reactive.common.variableActive = false;
        $reactive.common.shortcutActive = false;
        GLOBAL_HIERARCHY.changeView(LIST_VIEW,true)
        nextTick(()=>{
            $message?.success?.('重新加载~');
            utools_focus_or_blur(true)
        })
    }
    console.log('Enter App ...')
    statisticsManager.count(CountType.VISITED)
    adjustLightDarkTheme()
    bindApp()
    if(data.code==='code-snippet-save'){
        $normal.quickCode = data.payload;
        GLOBAL_HIERARCHY.changeView(CREATE_VIEW)
        // fix: liteShow模式下高度统一
        utools.setExpendHeight(545)
    }else if(data.code=== 'code-snippet-paste'){
        utools.subInputBlur();
    }
}

utools.onPluginEnter((data)=>{
    if(data.code === 'code-snippet-backup'){
        generate_backup(backupFilePath)
        utools.outPlugin();
    }else if(data.code.startsWith('keyword/')){
        let id = data.code.slice(8);
        let prefix = null;
        const index = id.indexOf('#')
        if(index !== -1){
            prefix = id.slice(0,index)
            id = id.slice(index+1)
        }
        $reactive.currentSnippet =  codeSnippetManager.get(id,prefix);
        // $reactive.core.selectedIndex = 0;
        $index.value = 0;
        if($reactive.currentSnippet.dir){
            GLOBAL_HIERARCHY.changeHierarchy('redirect',prefix)
            $normal.entry = true;
            enterApp(data)
        }else{
            copyCode(true,undefined,true)
                .then(input =>{
                    if(input){
                        $normal.funcs.snippetName = $reactive.currentSnippet.name;
                        $normal.entry = true;
                        enterApp(data)
                    }else{
                        utools.outPlugin();
                    }
                })
        }
    }else{
        enterApp(data)
    }
})

let result = [];
let num = undefined;
utools.onMainPush(({code,type,payload})=>{
    let name = payload.toLowerCase();
    num = undefined;
    if(configManager.get('beta_sub_snippet_search')){
        const index = payload.lastIndexOf('$')
        if(index !== -1){
            name = payload.slice(0,index)
            num =  (+payload.slice(index+1))??1;
        }
    }
    result = codeSnippetManager.deepQuery(name).slice(0,6)
    return result.map((cs,index) =>({
        text: cs.name,
        index: index,
        icon: cs.type?.startsWith('x-')? '/code-x.png': '/code.png',
        title: cs.path ? '[关联文件]：'+cs.path: cs.code,
        tags: [cs.desc,cs.matchType > 0 ? (cs.matchType === 1 ? '📗描述匹配' : '📘内容匹配') : undefined]
    }))
},({code,type,payload,option})=>{
    $reactive.currentSnippet = result[option.index];
    // $reactive.core.selectedIndex = 0;
    $index.value = 0;
    copyCode(true,num,true).then(v =>{
        utools.outPlugin();
    })
    $normal.entry = $reactive.currentSnippet.type?.startsWith('x-');
    return $normal.entry
})

