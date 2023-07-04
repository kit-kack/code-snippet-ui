import {
    create,
    NButton,
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
    NDivider,
    NModal
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
        NDivider,
        NModal
    ]
})

export default function initNU(app){
    app.use(naive)
}