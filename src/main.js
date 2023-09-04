import {createApp, toRaw} from 'vue'
import './style.css'
import App from './App.vue'
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd-dep";
import {section_add, section_contain, section_del} from "./js/utils/section";
import {copyCode} from "./js/utils/copy";
import {backupFilePath, log} from "./js/some";
import {router, switchToListView} from "./router/index";
import {$normal, $reactive} from "./js/store";
import {tagColorManager}  from "./js/core/tag";
import {codeSnippetManager} from "./js/core/snippet";
import {configManager} from "./js/core/config";
import {formatManager} from "./js/core/format";
// error
window.onerror = function (message, source, lineno, colno, error) {
    log(`${new Date().toISOString()}-[${source}](${lineno}:${colno}): ${message}\n`)
}
// init
configManager.init()
tagColorManager.init()
formatManager.init()
codeSnippetManager.init()

function bindApp(){
    const app = createApp(App)
    // error
    app.config.errorHandler = function (err, instance, info){
        log(`${new Date().toISOString()}-[${instance?.$options?.__file || instance?.$options?.name}]: ${err} - ${info}\n`)
    }
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
                    codeSnippetManager.update(toRaw($reactive.currentSnippet))
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
                    codeSnippetManager.update(toRaw($reactive.currentSnippet))
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

utools.onPluginEnter((data)=>{
    if(data.code === 'code-snippet-backup'){
        codeSnippetManager.store(backupFilePath)
        configManager.set('lastAutoBackupTime',Date.now())
        utools.showNotification('备份成功，备份数据文件位于：'+backupFilePath)
        return;
    }

    console.log('Enter App ...')
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
        if($reactive.view.backStageShow){
            // utools.showNotification("插件重新前台运行")
            $reactive.view.backStageShow = false;
            switchToListView(true)
        }
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
                mode: 'new',
                code: data.payload
            }
        })
        // fix: liteShow模式下高度统一
        utools.setExpendHeight(545)
    }else if(data.code=== 'code-snippet-paste'){
        utools.subInputBlur();
    }
    const now = Date.now();
    const time = configManager.get('lastAutoBackupTime')??0;
    if(now - time >= 432000000){
        setTimeout(()=>{
            codeSnippetManager.store(backupFilePath)
            configManager.set('lastAutoBackupTime',now)
            utools.showNotification('自动备份触发（周期为每5天），备份数据文件位于:'+backupFilePath)
        },1000)
    }
})

try{
    utools.onMainPush(({code,type,payload})=>{
        let flag = true;
        const array = codeSnippetManager.queryForMany(payload,null,null)
        return array.map(cs =>{
            flag = !flag;
            return {
                text: cs.desc? (cs.name+'📢'+cs.desc):cs.name,
                id: cs.id,
                icon: '/code.png'
            }
        })

    },({code,type,payload,option})=>{
        $reactive.currentSnippet = codeSnippetManager.get(option.id);
        $reactive.utools.selectedIndex = 0;
        return copyCode(true,undefined,true)
    })
}catch (_){}

