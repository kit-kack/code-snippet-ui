<template>
  <n-select
      :focusable="false"
      :value="language"
      filterable
      show-on-focus
      placeholder="选择代码类型"
      :options="languageOptions"
      :default-value="configManager.get('default_language')??'plaintext'"
      tag
      :disabled="disabled"
      :size="size"
      @update:value="handleLanguageChange"
      :render-tag="renderCodeTypeTag"
      :theme-overrides="selectThemeOverrides"
  />
</template>

<script setup>

import {fullAlias, languages as languageOptions} from "../../js/utils/language";
import {configManager} from "../../js/utools/config";
import {GLOBAL_HIERARCHY} from "../../js/hierarchy/core";
import {selectThemeOverrides} from "../../js/theme";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  isOnDefaultSettingMode: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium'
  }
})
const language = defineModel('language');

function handleLanguageChange(v){
  if(GLOBAL_HIERARCHY.currentHierarchy.inline){
    v = fullAlias(v)
  }
  language.value = v
  if(props.isOnDefaultSettingMode){
    configManager.set('default_language',v)
  }
}
function renderCodeTypeTag({option}){
  if(option.value.length > 2 && option.value.startsWith('x-')){
    return option.label + ' （解析♾️）'
  }else if(option.value === 'image' || option.value === 'svg'){
    return option.label + ' （渲染🖼️）'
  }else{
    return option.label;
  }
}

</script>

<style scoped>

</style>