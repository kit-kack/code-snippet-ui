import {
    create,
    NButton,
    NCard,
    NCode,
    NColorPicker,
    NConfigProvider,
    NDrawer,
    NEllipsis,
    NForm,
    NFormItem,
    NInput,
    NList,
    NListItem,
    NMessageProvider,
    NPopover,
    NResult,
    NScrollbar,
    NSelect,
    NSpace,
    NSwitch,
    NTabPane,
    NTabs,
    NTag,
    NTooltip,
    NDivider,
    NModal,
    NDialogProvider,
    NDynamicTags,
    NThing
} from 'naive-ui'


const naive = create({
    components:[NButton,
        NCard,
        NCode,
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
        NPopover,
        NResult,
        NScrollbar,
        NSelect,
        NSpace,
        NSwitch,
        NTabPane,
        NTabs,
        NTag,
        NTooltip,
        NDivider,
        NModal,
        NDialogProvider,
        NThing
    ]
})

export default function initNU(app){
    app.use(naive)
}