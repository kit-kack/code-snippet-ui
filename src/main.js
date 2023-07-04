import {createApp, toRaw} from 'vue'
import './style.css'
import App from './App.vue'
import {codeSnippetManager, configManager, init} from "./js/core.js";
import {$var, CREATE_VIEW} from "./js/store";
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd&highlight-dep";
import {section_add,section_del, section_contain} from "./js/utils/section";

// init
init()


utools.onPluginEnter((data)=>{
    console.log('Enter App ...')
    console.log('The Following is Your [code type payload]')
    console.log(data)
    if(configManager.get('enabledLiteShow')){
        $var.view.fullScreenShow = false;
        if(configManager.get('noShowForEmptySearch')){
            utools.setExpendHeight(0)
        }
    }else{
        utools.setExpendHeight(545)
    }
    utools.setSubInput(({text}) =>{
        text = text.trim();
        if(text.length === 0){
            $var.utools.search = null;
        }else{
            if($var.utools.search !== text){
                $var.utools.search = text;
                $var.utools.keepSelectedStatus = null;
                $var.scroll.itemOffsetArray = [];
                // fix: 修复删除界面不移除
                $var.view.isDel = false;
            }
        }
    },"搜索代码片段, 双击Tab切换UI模式")
    if(data.type==='over'){
        $var.currentMode = CREATE_VIEW;
        $var.others.code = data.payload;
        // fix: liteShow模式下高度统一
        utools.setExpendHeight(545)
    }
})

const app = createApp(App)
initNU(app)
initVH(app)
app.directive("code", {
    mounted(el) {
        //获取代码片段
        let collection = $var.currentCode.split('\n');
        $var.currentSplitCode = collection;
        let size = collection.length;
        if(collection[collection.length -1].trim() === ''){
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
                console.log(target.value)
                if($var.currentSnippet.sections){
                    if(section_contain($var.currentSnippet.sections,target.value)){
                        section_del($var.currentSnippet.sections,target.value,false)
                    }else{
                        section_add($var.currentSnippet.sections,target.value,false)
                    }
                }else{
                    $var.currentSnippet.sections = [[target.value,target.value]]
                }
                // 保存
                codeSnippetManager.update(toRaw($var.currentSnippet))
            }
        }
        ul.oncontextmenu = (event) =>{
            let target = event.target;
            if(target && target.value){
                console.log(target.value)
                if($var.currentSnippet.sections){
                    if(section_contain($var.currentSnippet.sections,target.value)){
                        section_del($var.currentSnippet.sections,target.value,true)
                    }else{
                        section_add($var.currentSnippet.sections,target.value,true)
                    }
                }else{
                    $var.currentSnippet.sections = [[0,target.value]]
                }
                // 保存
                codeSnippetManager.update(toRaw($var.currentSnippet))
            }
        }
        ul.classList.add('hljs-code-number')
        el.prepend(ul)
    }
})
app.mount('#app')



