import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {codeSnippetManager, configManager, init} from "./js/core.js";
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd-dep";
import {section_add, section_contain, section_del} from "./js/utils/section";
import {copyCode} from "./js/utils/copy";
import {backupFilePath} from "./js/some";
import {router} from "./router/index";
import {$normal, $reactive} from "./js/store";

// init
init()

function bindApp(){
    const app = createApp(App)
    app.use(router)
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
                    console.log(target.value)
                    if($normal.currentSnippet.sections){
                        if(section_contain($normal.currentSnippet.sections,target.value)){
                            section_del($normal.currentSnippet.sections,target.value,false)
                        }else{
                            section_add($normal.currentSnippet.sections,target.value,false)
                        }
                    }else{
                        $normal.currentSnippet.sections = [[target.value,target.value]]
                    }
                    // 保存
                    if($normal.currentSnippet.help){
                        return;
                    }
                    codeSnippetManager.update($normal.currentSnippet)
                }
            }
            ul.oncontextmenu = (event) =>{
                let target = event.target;
                if(target && target.value){
                    console.log(target.value)
                    if($normal.currentSnippet.sections){
                        if(section_contain($normal.currentSnippet.sections,target.value)){
                            section_del($normal.currentSnippet.sections,target.value,true)
                        }else{
                            section_add($normal.currentSnippet.sections,target.value,true)
                        }
                    }else{
                        $normal.currentSnippet.sections = [[0,target.value]]
                    }
                    // 保存
                    codeSnippetManager.update($normal.currentSnippet)
                }
            }
            ul.classList.add('hljs-code-number')
            el.prepend(ul)
        }
    })
    app.mount('#app')
}

utools.onPluginEnter((data)=>{
    if(data.code === 'code-snippet-backup'){
        codeSnippetManager.store(backupFilePath)
        configManager.set('lastAutoBackupTime',Date.now())
        utools.showNotification('备份成功，备份数据文件位于：'+backupFilePath)
        return;
    }

    console.log('Enter App ...')
    console.log('The Following is Your [code type payload]')
    console.log(data)
    bindApp()
    if(configManager.get('enabledLiteShow')){
        $reactive.view.fullScreenShow = false;
        if(configManager.get('noShowForEmptySearch')){
            utools.setExpendHeight(0)
        }
    }else{
        utools.setExpendHeight(545)
    }
    utools.setSubInput(({text}) =>{
        text = text.trim();
        if(text.length === 0){
            $reactive.utools.search = null;
        }else{
            if($reactive.utools.search !== text){
                $reactive.utools.search = text;
                $normal.keepSelectedStatus = null;
                $normal.itemOffsetArray = [];
                // fix: 修复删除界面不移除
                $reactive.view.isDel = false;
            }
        }
    },"搜索代码片段, 双击Tab切换UI模式")
    if(data.code==='code-snippet-save'){
        router.push({
            name: 'code',
            query:{
                update: false,
                code: data.payload
            }
        })
        // fix: liteShow模式下高度统一
        utools.setExpendHeight(545)
    }else if(data.code=== 'code-snippet-paste'){
        utools.subInputBlur();
    }
    setTimeout(()=>{
        try{
            if(configManager.get('autoBackup')){
                const now = Date.now();
                const time = configManager.get('lastAutoBackupTime')??0;
                if(now - time >= 259200000){
                    codeSnippetManager.store(backupFilePath)
                    configManager.set('lastAutoBackupTime',now)
                }
            }
        }catch (_){}
    },100)
})

try{
    utools.onMainPush(({code,type,payload})=>{
        let flag = true;
        const array = codeSnippetManager.queryForMany(payload,null,null)
        return array.map(cs =>{
            flag = !flag;
            return {
                text: cs.desc? (cs.name+'📢'+cs.desc):cs.name,
                name: cs.name,
                icon: '/code.png'
            }
        })

    },({code,type,payload,option})=>{
        $normal.currentSnippet = codeSnippetManager.get(option.name);
        $reactive.utools.selectedIndex = 0;
        return copyCode(true,undefined,true)
    })
}catch (_){}

