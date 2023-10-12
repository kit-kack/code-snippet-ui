<template>
  <n-space vertical align="center">
    <n-space>
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
    </n-space>
    <n-space>
      元素代码块：
      <n-select  v-model:value="codeBlockRef" :options="codeBlockOptions" size="tiny" @update-value="handleCodeBlockChange"/>
      <config-check-tag v-if="!configManager.get('noItemCodeShow')" @refresh="refreshListView(true)" title="不高亮展示" config="rawLineCode"/>
    </n-space>
<!--    <n-space align="center" vertical v-if="colorSchemaRef === -1">-->
<!--      <n-space>-->
<!--        <color-picker :instance="colorInstances[0]"/>-->
<!--        <color-picker :instance="colorInstances[1]"/>-->
<!--      </n-space>-->
<!--      <n-space>-->
<!--        <color-picker :instance="colorInstances[2]"/>-->
<!--        <color-picker :instance="colorInstances[3]"/>-->
<!--      </n-space>-->
<!--    </n-space>-->
  </n-space>
</template>

<script setup>
import {h, ref} from "vue";
import ColorPicker from "../components/ColorPicker.vue";
import {configManager} from "../js/core/config";
import ConfigCheckTag from "../components/ConfigCheckTag.vue";
import {adjustTheme, colorSchemaStyleOptions, darkColorSchemaStyleOptions, globalThemeRefresh} from "../js/theme";
import {refreshListView} from "../js/store";

const colorSchemaRef = ref(configManager.get(utools.isDarkColors()? 'darkColorSchema': 'colorSchema')??-1)
if(colorSchemaRef.value === -2){
  colorSchemaRef.value = -1;
}
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
  refreshListView(true)
}
// const colorInstances = [{
//   title: "全局主题 颜色",
//   color: configManager.getGlobalColor(),
//   handleConfirm: v=>{
//     configManager.setGlobalColor(v)
//     globalThemeRefresh();
//     refreshListView(true)
//   }
// },{
//   title: "被选中元素 背景颜色",
//   color: configManager.getColor('SelectedColor'),
//   handleConfirm: v=>{
//     configManager.setColor('SelectedColor',v)
//     refreshListView(true)
//   }
// },{
//   title: "自定义标签 默认颜色",
//   color: configManager.getColor('TagColor'),
//   handleConfirm: v=>{
//     configManager.setColor('TagColor',v)
//     refreshListView(true)
//   }
// },{
//   title: '代码高亮行颜色',
//   color: configManager.getColor('HighlightColor'),
//   handleConfirm: v=>{
//     configManager.setColor('HighlightColor',v)
//   }
// }];

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
  }
  // {
  //   label: '自定义(取色方式)',
  //   value: -1
  // }
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
  if(v < 0){
    return;
  }
  adjustTheme(v)
  globalThemeRefresh()
  refreshListView(true)
}

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