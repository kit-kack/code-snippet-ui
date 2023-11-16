import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import initNU from "./js/dep/naiveui-dep";
import initVH from "./js/dep/vmd-dep";
import {section_add, section_contain, section_del} from "./js/utils/section";
import {copyCode} from "./js/utils/copy";
import {backupFilePath} from "./js/some";
import {$index, $normal, $reactive, CREATE_VIEW, LIST_VIEW} from "./js/store";
import {tagColorManager} from "./js/core/tag";
import {codeSnippetManager} from "./js/core/snippet";
import {configManager} from "./js/core/config";
import {formatManager} from "./js/core/func";
import {GLOBAL_HIERARCHY} from "./js/hierarchy/core";
// init
configManager.init()
tagColorManager.init()
formatManager.init()
codeSnippetManager.init()

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


utools.onPluginEnter((data)=>{
    if(data.code === 'code-snippet-backup'){
        codeSnippetManager.store(backupFilePath)
        return;
    }else if(data.code === 'code-snippet-keyword'){
        $reactive.currentSnippet = codeSnippetManager.getByName(data.payload);
        // $reactive.core.selectedIndex = 0;
        $index.value = 0;
        if(!copyCode(true,undefined,true)){
            return;
        }
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
            utools.showNotification("插件重新前台运行")
            $reactive.view.backStageShow = false;
            GLOBAL_HIERARCHY.changeView(LIST_VIEW,true)
        }
        text = text.trim();
        if(text.length === 0){
            $reactive.utools.search = null;
        }else{
            if($reactive.utools.search !== text){
                $reactive.utools.search = text;
                $normal.keepSelectedStatus = null;
                // $normal.itemOffsetArray = [];
                // fix: 修复删除界面不移除
                $reactive.view.isDel = false;
                $reactive.view.helpActive = false;
                // refreshListView(true)
            }
        }
    },"搜索代码片段, 双击Tab切换UI模式")
    if(data.code==='code-snippet-save'){
        $normal.quickCode = data.payload;
        GLOBAL_HIERARCHY.changeView(CREATE_VIEW)
        // fix: liteShow模式下高度统一
        utools.setExpendHeight(545)
    }else if(data.code=== 'code-snippet-paste'){
        utools.subInputBlur();
    }
    // if(configManager.get('autoBackup')){
    //     const now = Date.now();
    //     const time = configManager.get('lastAutoBackupTime')??0;
    //     if(now - time >= 432000000){
    //         setTimeout(()=>{
    //             codeSnippetManager.store(backupFilePath)
    //             configManager.set('lastAutoBackupTime',now)
    //             core.showNotification('自动备份触发（周期为每5天），备份数据文件位于:'+backupFilePath)
    //         },1000)
    //     }
    // }
})

try{
    utools.onMainPush(({code,type,payload})=>{
        let name = payload;
        let num = undefined;
        if(configManager.get('allowSearchSubSnippet')){
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

