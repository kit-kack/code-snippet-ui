import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'highlight.js/styles/atom-one-dark.css'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import {codeSnippetManager, configManager, tagColorManager} from "./js/core.js";
import hljs from "highlight.js/lib/common";
import {
    create,
    NButton,
    NCard,
    NCode,
    NColorPicker,
    NConfigProvider,
    NDataTable,
    NDialogProvider,
    NDrawer,
    NEllipsis,
    NForm,
    NFormItem,
    NMessageProvider,
    NPopover,
    NResult,
    NScrollbar,
    NSpace,
    NSwitch,
    NTabPane,
    NTabs,
    NTag,
    NInput,
    NSelect,
    NTooltip,
    NDynamicTags,
    NAlert,
    NRadio,
    NRadioGroup
} from 'naive-ui'


// init
tagColorManager.init();
configManager.init();
codeSnippetManager.init()

// highlight
hljs.registerAliases(["vue","html"],{languageName:"xml"})

const naive = create({
    components:[
        NMessageProvider,NDialogProvider,NConfigProvider,
        NSpace,NButton,NTag,
        NTooltip, NDrawer, NResult,NDataTable, NTabPane, NTabs, NFormItem,NForm, NSwitch,NScrollbar,
        NCard,NCode,NEllipsis, NPopover, NColorPicker,NInput,NSelect,NDynamicTags,NAlert,NRadio,
        NRadioGroup
    ]
})



const app = createApp(App)
app.use(hljsVuePlugin)
app.use(naive)
app.mount('#app')

