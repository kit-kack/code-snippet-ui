import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import {configManager, init} from "./js/core.js";
import hljs from "highlight.js";
import {
    create,
    NAlert,
    NButton,
    NCard,
    NCode,
    NCollapse,
    NCollapseItem,
    NColorPicker,
    NConfigProvider,
    NDrawer,
    NDynamicTags,
    NEllipsis,
    NForm,
    NFormItem,
    NInput,
    NList,
    NListItem,
    NMessageProvider,
    NNotificationProvider,
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
    NTooltip
} from 'naive-ui'
import {$var, CREATE_VIEW} from "./js/store";

// init
init()

// highlight
if(utools.isDarkColors()){
    import('highlight.js/styles/atom-one-dark.css')
}else{
    import('highlight.js/styles/atom-one-light.css')
}
hljs.registerAliases(["vue","html"],{languageName:"xml"})


const naive = create({
    components:[
        NMessageProvider,NConfigProvider,
        NSpace,NButton,NTag,
        NTooltip, NDrawer, NResult, NTabPane, NTabs, NFormItem,NForm, NSwitch,NScrollbar,
        NCard,NCode,NEllipsis, NPopover, NColorPicker,NInput,NSelect,NDynamicTags,NAlert,NRadio,
        NRadioGroup,NList,NListItem,NCollapse,NCollapseItem,NNotificationProvider
    ]
})


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
    console.log('fullScreenShow: '+$var.view.fullScreenShow)
    utools.setSubInput(({text}) =>{
        text = text.trim();
        if(text.length === 0){
            $var.utools.search = null;
            console.log('search empty')
        }else{
            if($var.utools.search !== text){
                console.log('search: '+text)
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
app.use(hljsVuePlugin)
app.use(naive)
app.mount('#app')



