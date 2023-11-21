import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd-dep";
import {section_add, section_contain, section_del} from "./js/utils/section";
import {copyCode} from "./js/utils/copy";
import {backupFilePath} from "./js/some";
import {$index, $list, $normal, $reactive, CREATE_VIEW, LIST_VIEW} from "./js/store";
import {tagColorManager} from "./js/core/tag";
import {codeSnippetManager} from "./js/core/snippet";
import {configManager} from "./js/core/config";
import {formatManager} from "./js/core/func";
import {GLOBAL_HIERARCHY} from "./js/hierarchy/core";
import _ from "lodash";
import {init} from "./js/keyboard";
// init
configManager.init()
tagColorManager.init()
formatManager.init()
codeSnippetManager.init()
init($list)

function bindApp(){
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
    $reactive.view.backStageShow = true;
})



const enterApp = (data) => {
    console.log('Enter App ...')
    bindApp()
    // TODO:处理
    // if(configManager.get('enabledLiteShow')){
    //     $reactive.view.fullScreenShow = false;
    //     if(configManager.get('noShowForEmptySearch')){
    //         utools.setExpendHeight(0)
    //     }
    // }else{
    //     utools.setExpendHeight(545)
    // }
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
        codeSnippetManager.store(backupFilePath)
        return;
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
            enterApp(data)
        }else{
            copyCode(true,undefined,true)
                .then(input =>{
                    if(input){
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
    utools.onMainPush(({code,type,payload})=>{
        let name = payload;
        let num = undefined;
        if(configManager.get('beta_sub_snippet_search')){
            const index = payload.lastIndexOf('$')
            if(index !== -1){
                name = payload.slice(0,index)
                num =  (+payload.slice(index+1))??1;
            }
        }
        let flag = true;
        const array = codeSnippetManager.queryForMany(name,null)
        return array.map(cs =>{
            flag = !flag;
            return {
                text: cs.desc? (cs.name+'📢'+cs.desc):cs.name,
                id: cs.id,
                icon: '/code.png',
                num: num
            }
        })

    },({code,type,payload,option})=>{
        $reactive.currentSnippet = codeSnippetManager.rootSnippetMap.get(option.id);
        // $reactive.core.selectedIndex = 0;
        $index.value = 0;
        return copyCode(true,option.num,true)
    })
}catch (_){}

