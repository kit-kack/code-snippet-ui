import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'highlight.js/styles/atom-one-dark.css'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import {codeSnippetManager, configManager, tagColorManager} from "./js/core.js";
import hljs from "highlight.js/lib/common";
import {
    create,
    NAlert,
    NButton,
    NCard,
    NCode,
    NColorPicker,
    NConfigProvider,
    NDataTable,
    NDrawer,
    NDynamicTags,
    NEllipsis,
    NForm,
    NFormItem,
    NInput,
    NMessageProvider,
    NPopover,
    NRadio,
    NRadioGroup,
    NResult,
    NScrollbar,
    NSelect,
    NSpace,
    NSwitch,
    NTabPane,
    NTabs,
    NTag,
    NTooltip,
} from 'naive-ui'
import {fullScreenShow, itemOffsetArray, keepSelectedStatus, utoolsSearchContent} from "./js/utils/variable.js";

// init
tagColorManager.init();
configManager.init();
codeSnippetManager.init()
// highlight
hljs.registerAliases(["vue","html"],{languageName:"xml"})

const naive = create({
    components:[
        NMessageProvider,NConfigProvider,
        NSpace,NButton,NTag,
        NTooltip, NDrawer, NResult,NDataTable, NTabPane, NTabs, NFormItem,NForm, NSwitch,NScrollbar,
        NCard,NCode,NEllipsis, NPopover, NColorPicker,NInput,NSelect,NDynamicTags,NAlert,NRadio,
        NRadioGroup
    ]
})


utools.onPluginEnter(({code, type, payload})=>{
    console.log('Welcome to use this app')
    console.log('Your code_type_payload is ['+code+'_'+type+'_'+payload+']')
    if(configManager.get('enabledLiteShow')){
        fullScreenShow.value = false;
        console.log('lite show')
        if(configManager.get('noShowForEmptySearch')){
            utools.setExpendHeight(0)
            console.log('lite mini show')
        }
    }else{
        console.log('normal show')
        utools.setExpendHeight(545)
    }
    console.log('fullScreenShow: '+fullScreenShow.value)
    utools.setSubInput(({text}) =>{
        text = text.trim();
        if(text.length === 0){
            utoolsSearchContent.value = null;
            console.log('search empty')
        }else{
            if(utoolsSearchContent.value !== text){
                console.log('search: '+text)
                utoolsSearchContent.value = text;
                keepSelectedStatus.value = null;
                itemOffsetArray.value = [];
            }
        }
    },"搜索代码片段, 双击Tab切换UI模式")
})

const app = createApp(App)
app.use(hljsVuePlugin)
app.use(naive)
app.mount('#app')



