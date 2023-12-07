import {createApp, nextTick} from 'vue'
import './style.scss'
import App from './App.vue'
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd-dep";
import {section_add, section_contain, section_del} from "./js/utils/section";
import {copyCode} from "./js/utils/copy";
import {backupFilePath} from "./js/some";
import {$index, $normal, $reactive, CREATE_VIEW, LIST_VIEW, utools_focus_or_blur} from "./js/store";
import {tagColorManager} from "./js/core/tag";
import {codeSnippetManager} from "./js/core/snippet";
import {configManager} from "./js/core/config";
import {formatManager} from "./js/core/func";
import {GLOBAL_HIERARCHY} from "./js/hierarchy/core";
import {hierachyHubManager} from "./js/core/hub";
import {generate_backup} from "./js/core/backup";
import {adjustLightDarkTheme} from "./js/theme";
import {initKeyboardListener} from "./js/keyboard/core";
// init
configManager.init()
formatManager.init()
hierachyHubManager.init()
codeSnippetManager.init()
function bindApp(){
    tagColorManager.init()
    initKeyboardListener()
    const app = createApp(App)

    initNU(app)
    initVH(app)
    app.directive("code", {
        mounted(el) {
            //获取代码片段
            let collection = el.querySelector('code.hljs')?.innerHTML.split('\n');
            let size = collection.length;
            if(collection[size -1].trim() === ''){
                size --;
            }
            //插入行数
            let ul = document.createElement('ul')
            for (let i = 1; i <= size; i++) {
                let li = document.createElement('li')
                li.innerText = i + ''
                li.value = i;
                ul.appendChild(li)
            }
            ul.onclick = (event)=>{
                let target = event.target;
                if(target && target.value){
                    if($reactive.currentSnippet.sections){
                        if(section_contain($reactive.currentSnippet.sections,target.value)){
                            section_del($reactive.currentSnippet.sections,target.value,false)
                        }else{
                            section_add($reactive.currentSnippet.sections,target.value,false)
                        }
                    }else{
                        $reactive.currentSnippet.sections = [[target.value,target.value]]
                    }
                    // 保存
                    if($reactive.currentSnippet.help){
                        return;
                    }
                    GLOBAL_HIERARCHY.update(null,"sections")
                }
            }
            ul.oncontextmenu = (event) =>{
                let target = event.target;
                if(target && target.value){
                    console.log(target.value)
                    if($reactive.currentSnippet.sections){
                        if(section_contain($reactive.currentSnippet.sections,target.value)){
                            section_del($reactive.currentSnippet.sections,target.value,true)
                        }else{
                            section_add($reactive.currentSnippet.sections,target.value,true)
                        }
                    }else{
                        $reactive.currentSnippet.sections = [[0,target.value]]
                    }
                    // 保存
                    GLOBAL_HIERARCHY.update(null,"sections")
                }
            }
            ul.classList.add('hljs-code-number')
            el.prepend(ul)
        }
    })
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

try{
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
                tags: [cs.desc]
            }))
    },({code,type,payload,option})=>{
        $reactive.currentSnippet = result[option.index];
        // $reactive.core.selectedIndex = 0;
        $index.value = 0;
        copyCode(true,num,true)
        $normal.entry = $reactive.currentSnippet.type?.startsWith('x-');
        return $normal.entry
    })
}catch (_){}

