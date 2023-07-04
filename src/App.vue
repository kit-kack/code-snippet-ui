<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <component :is="Tabs[$var.currentMode]"/>
      <vim-status-bar/>
      <n-drawer v-model:show="$var.view.settingActive" :width="380" placement="right">
        <side-view @refresh="dealWithRefresh" />
      </n-drawer>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import ListView from "./view/ListView.vue";
import hljs from "highlight.js/lib/common";
import SideView from "./view/SideView.vue";
import CodeView from "./view/CodeView.vue";
import VimStatusBar from "./components/VimStatusBar.vue";
import FormView from "./view/FormView.vue";
import {$var} from "./js/store"
import {refreshListView} from "./js/some";
import CustomView from "./view/CustomView.vue";
import {
  colorSchemaStyleOptions,
  darkColorSchemaStyleOptions,
  globalThemeRefresh,
  theme,
  themeOverrides
} from "./js/theme";
import {onMounted} from "vue";
import {configManager} from "./js/core";

const Tabs = [
    ListView,CodeView,FormView,FormView,CustomView
]

const dealWithRefresh = ()=>{
  globalThemeRefresh()
  refreshListView()
}
onMounted(()=>{
  document.body.id = utools.isDarkColors()? 'dark-app' : 'light-app'
  if(configManager.get('darkHighlightColor') === undefined){
    configManager.configs["darkHighlightColor"] = darkColorSchemaStyleOptions[0].highColor
    configManager.configs["lightHighlightColor"]  = colorSchemaStyleOptions[0].highColor;
    configManager.writeToDB()
  }
  if(configManager.get("colorSchema") === undefined){
    configManager.configs["colorSchema"] = 0
    configManager.configs["darkColorSchema"] = 0
    configManager.configs["lightGlobalColor"] = colorSchemaStyleOptions[0].globalColor
    configManager.configs["darkGlobalColor"] = darkColorSchemaStyleOptions[0].globalColor
    configManager.configs["lightTagColor"] = colorSchemaStyleOptions[0].tagColor
    configManager.configs["darkTagColor"] = darkColorSchemaStyleOptions[0].tagColor
    configManager.configs["lightSelectedColor"] = colorSchemaStyleOptions[0].selectedColor
    configManager.configs["darkSelectedColor"] = darkColorSchemaStyleOptions[0].selectedColor
    configManager.writeToDB()
  }

})

</script>


<style scoped>

</style>
