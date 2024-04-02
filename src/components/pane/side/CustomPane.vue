<template>
  <n-space vertical>
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
    <config-switch title="关闭显示入门手册" config="readme_close" @refresh="refreshSearchResult()"/>
  </n-space>

</template>

<script setup>
import {h, ref} from "vue";
import {configManager} from "../../../js/utools/config";
import {adjustTheme, colorSchemaStyleOptions, darkColorSchemaStyleOptions, globalThemeRefresh} from "../../../js/theme";
import {refreshListView, refreshSearchResult} from "../../../js/store";
import ConfigSwitch from "../../base/ConfigSwitch.vue";

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
  refreshListView(false)
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
  refreshListView(false)
}

</script>

<style scoped>


.n-divider{
  margin-top: 20px;
  height: 10px;
}
</style>