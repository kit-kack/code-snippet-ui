<template>
  <n-space vertical align="center">
    <n-space>
      <span>&nbsp;配色方案：</span>
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
      <config-check-tag v-if="codeBlockRef !== 0" @refresh="refreshListView()" title="不高亮展示" config="strategy_item_code_raw"/>
    </n-space>
  </n-space>
</template>

<script setup>
import {h, ref} from "vue";
import {configManager} from "../../js/core/config";
import ConfigCheckTag from "../base/ConfigCheckTag.vue";
import {adjustTheme, colorSchemaStyleOptions, darkColorSchemaStyleOptions, globalThemeRefresh} from "../../js/theme";
import {refreshListView} from "../../js/store";

const colorSchemaRef = ref(configManager.get('strategy_theme')??0)
const codeBlockRef = ref(configManager.get('strategy_item_code_show')??0)
const codeBlockOptions = [
  {
    label: '不展示',
    value: 0
  },{
    label: '单行显示',
    value: 1
  },{
    label: '多行显示',
    value: 2
  }
]
function handleCodeBlockChange(v){
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