<template>
  <n-space vertical align="center">
    <n-space>
      配色方案
      <n-select
          v-model:value="colorSchemaRef"
          :options="colorSchemaOptions"
          :render-label="renderLabel"
          size="tiny"
          @update-value="handleColorSchema"
      />
    </n-space>
    <n-space>
      元素代码块
      <n-select  v-model:value="codeBlockRef" :options="codeBlockOptions" size="tiny" @update-value="handleCodeBlockChange"/>
    </n-space>
  </n-space>
</template>

<script setup>
import {h, ref} from "vue";
import {configManager} from "../../js/core/config";
import {adjustTheme, colorSchemaStyleOptions, darkColorSchemaStyleOptions, globalThemeRefresh} from "../../js/theme";
import {refreshListView} from "../../js/store";

const colorSchemaRef = ref(configManager.get('strategy_theme')??0)
const codeBlockRef = ref(getBlockRefInitValue())
const codeBlockOptions = [
  {
    label: '不展示',
    value: 0
  },{
    label: '单行显示',
    value: 1
  },{
    label: '单行显示-无高亮',
    value: 3
  },{
    label: '多行显示',
    value: 2
  },{
    label: '多行显示-无高亮',
    value: 4
  }
]
function getBlockRefInitValue(){
  let value = configManager.get('strategy_item_code_show')??0;
  if(value > 0){
    if(configManager.get('strategy_item_code_raw')){
      value += 2;
    }
  }
  return value
}
function handleCodeBlockChange(v){
  if(v >= 3){
    configManager.set('strategy_item_code_raw',true);
    v -= 2;
  }else{
    configManager.set('strategy_item_code_raw',false);
  }
  configManager.set('strategy_item_code_show',v)
  refreshListView(true)
}
const colorSchemaOptions = [
  {
    label: '绿色',
    value: 0
  },
  {
    label: '蓝色',
    value: 1
  },
  {
    label: '紫色',
    value: 2
  },  {
    label: '粉色',
    value: 3
  }
,
  {
    label: '金色',
    value: 4
  }
]
function renderLabel(option) {
    return h(
          'div',
          {
            style: {
              width: '100%',
              color: utools.isDarkColors()?
                  (darkColorSchemaStyleOptions[option.value]?.globalColor)
                  :(colorSchemaStyleOptions[option.value]?.globalColor)
            }
          },
          [option.label]
      );
}
function handleColorSchema(v){
  configManager.set('strategy_theme',v);
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