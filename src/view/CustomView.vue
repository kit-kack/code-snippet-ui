<template>
  <n-divider title-placement="center">
    个性化定制
  </n-divider>
  <div style="height: 10px"></div>
  <n-space align="center">
    <n-tooltip>
      <template #trigger>
        <span>&nbsp;💡配色方案：</span>
      </template>
      亮色和暗色场景独立保存，互不影响
    </n-tooltip>
    <n-select
        v-model:value="colorSchemaRef"
        :options="colorSchemaOptions"
        :render-label="renderLabel"
        size="tiny"
        @update-value="handleColorSchema"
    />
    <span style="padding: 0 20px">|</span>
    元素代码块：
    <n-select  v-model:value="codeBlockRef" :options="codeBlockOptions" size="tiny" @update-value="handleCodeBlockChange"/>
    <config-check-tag v-if="!configManager.get('noItemCodeShow')" @refresh="refreshListView()" title="不高亮展示" config="rawLineCode"/>
  </n-space>
  <div style="height: 20px"></div>
  <template v-if="colorSchemaRef === -1">
    <n-space><color-picker v-for="instance in getColorInstances()" :instance="instance" :key="instance.title"/></n-space>
  </template>
  <template v-else-if="colorSchemaRef === -2">
    <n-space align="center">
      <n-input
          v-model:value="cssCode"
          placeholder="请输入关于CSS的JSON数据"
          type="textarea"
          size="small"
          style="width: 66vw;margin: 5px"
          :default-value="getCSSCode()"
          :autosize="{minRows:10,maxRows: 10}"/>
      <n-button @click="handleCSSCode">确定</n-button>
    </n-space>
  </template>
</template>

<script setup>
import {h, onMounted, ref} from "vue";
import ColorPicker from "../components/ColorPicker.vue";
import {configManager} from "../js/core";
import ConfigCheckTag from "../components/ConfigCheckTag.vue";
import {adjustTheme, colorSchemaStyleOptions, darkColorSchemaStyleOptions, globalThemeRefresh} from "../js/theme";
import {useMessage} from "naive-ui";
import {refreshListView} from "../js/some";
const props = defineProps(['height'])
const emit = defineEmits(['update:height'])

const cssCode = ref()
const getCSSCode = ()=>{
  return `{
    //   全局颜色，对应CSS 的 background-color属性
    "global-color": "${configManager.getGlobalColor()}",
    //   被选中 元素颜色，对应 background属性（可渐变）
    "selected-color": "${configManager.getColor('SelectedColor')}",
    //   标签颜色，对应background-color属性，需要提供alpha透明度参数
    "tag-color": "${configManager.getColor('TagColor')}",
    //   代码预览界面 高亮行颜色
    "highlight-color": "${configManager.getColor('HighlightColor')}"
}`
}
const message = useMessage();
const colorSchemaRef = ref(configManager.get(utools.isDarkColors()? 'darkColorSchema': 'colorSchema')??-1)
const codeBlockRef = ref(configManager.get('noItemCodeShow')? -1: (configManager.get('fullItemCodeShow')? 1: 0))
const codeBlockOptions = [
  {
    label: '不展示',
    value: -1
  },{
    label: '单行显示',
    value: 0
  },{
    label: '多行显示',
    value: 1
  }
]
function handleCodeBlockChange(v){
  switch (v){
    case -1:
      configManager.set('noItemCodeShow',true)
          break;
    case 0:
    case 1:
      configManager.set('noItemCodeShow',false)
      configManager.set('fullItemCodeShow', v===1);
      break;
  }
  refreshListView()
}
const getColorInstances = ()=>{
  return [{
    title: "全局主题 颜色",
    color: configManager.getGlobalColor(),
    handleConfirm: v=>{
      configManager.setGlobalColor(v)
      globalThemeRefresh();
      refreshListView()
    }
  },{
    title: "被选中元素 背景颜色",
    color: configManager.getColor('SelectedColor'),
    handleConfirm: v=>{
      configManager.setColor('SelectedColor',v)
      refreshListView()
    }
  },{
    title: "自定义标签 默认颜色",
    color: configManager.getColor('TagColor'),
    handleConfirm: v=>{
      configManager.setColor('TagColor',v)
      refreshListView()
    }
  },{
    title: '代码高亮行颜色',
    color: configManager.getColor('HighlightColor'),
    handleConfirm: v=>{
      configManager.setColor('HighlightColor',v)
    }
  }]
}

const colorSchemaOptions = [
  {
    label: '绿色',
    value: 0
  },
  {
    label: '青色',
    value: 1
  },
  {
    label: '蓝色',
    value: 2
  },
  {
    label: '紫色',
    value: 3
  },  {
    label: '粉色',
    value: 4
  },
  {
    label: '金色',
    value: 5
  },{
    label: '红色',
    value: 6
  },
  {
    label: '自定义(取色方式)',
    value: -1
  },
  {
    label: '自定义(CSS方式)',
    value: -2
  }
]
const renderLabel = (option) => {
    return h(
          'div',
          {
            style: {
              width: '100%',
              color: utools.isDarkColors()?
                  (darkColorSchemaStyleOptions[option.value]?.globalColor??'white')
                  :(colorSchemaStyleOptions[option.value]?.globalColor??'black')
            }
          },
          [option.label]
      );
}
const handleColorSchema = (v)=>{
  configManager.set(utools.isDarkColors()? 'darkColorSchema': 'colorSchema',v);
  changeHeight(v)
  if(v < 0){
    return;
  }
  adjustTheme(v)
  globalThemeRefresh()
  refreshListView()
}
function changeHeight(v){
  if(v >= 0){
    emit('update:height',150)
  }else{
    emit('update:height',(v=== -1? 200:370))
  }
}
const handleCSSCode = ()=>{
/**
* @type {String}
*/
  let code = cssCode.value
  // 移除注释部分
  let json = code.split('\n').filter(v => !v.trim().startsWith("//")).join('\n');
  try{
    // 通过JSON解析为Object
    let obj = JSON.parse(json)
    if(obj['global-color']){
      configManager.setGlobalColor(obj['global-color'])
    }
    if(obj['tag-color']){
      configManager.setColor('TagColor',obj['tag-color'])
    }
    if(obj['selected-color']){
      configManager.setColor('SelectedColor',obj['selected-color'])
    }
    if(obj['highlight-color']){
      configManager.setColor('HighlightColor',obj['highlight-color'])
    }
    globalThemeRefresh()
    refreshListView()
  }catch (e){
    message.error("格式错误："+e.message)
  }
}
onMounted(()=>{
  changeHeight(colorSchemaRef.value)
})

</script>

<style scoped>
.n-select{
  font-size: 12px;
  width: 150px;
}
.n-divider{
  margin-top: 20px;
  height: 10px;
}
</style>