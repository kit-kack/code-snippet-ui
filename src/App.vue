<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <component :is="Tabs[$var.currentMode]"/>

      <div id="extra-left" v-if="!$var.utools.focused && $var.view.fullScreenShow">
        <vim-status-bar />
      </div>
      <n-drawer v-model:show="$var.view.settingActive" :width="380" placement="right">
        <side-view @refresh="dealWithRefresh" />
      </n-drawer>

    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import ListView from "./view/ListView.vue";
import {ref} from "vue";
import {configManager} from "./js/core.js";
import {darkTheme} from 'naive-ui'
import hljs from "highlight.js/lib/common";
import SideView from "./view/SideView.vue";
import CodeView from "./view/CodeView.vue";
import VimStatusBar from "./components/VimStatusBar.vue";
import FormView from "./view/FormView.vue";
import {$var} from "./js/store"
import {refreshListView} from "./js/some";

const theme = utools.isDarkColors()? darkTheme:null;
const themeOverrides = ref({
  Card:{
    boxShadow:'0px 1px 0px rgba(17,17,26,0.05), 0px 0px 4px '+configManager.getGlobalColor()
  },
  Switch:{
    railColorActive: configManager.getGlobalColor()
  },
  Tooltip:{
    color: utools.isDarkColors()? '#2a2a2c':'#fafafc',
    textColor: utools.isDarkColors()? '#fafafc':'#2a2a2c'
  }
})
const Tabs = [
    ListView,CodeView,FormView,FormView
]

const dealWithRefresh = ()=>{
  themeOverrides.value = {
    Card:{
      boxShadow:'0px 1px 0px rgba(17,17,26,0.05), 0px 0px 4px '+configManager.getGlobalColor(),
    },
    Switch:{
      railColorActive: configManager.getGlobalColor()
    },
    Tooltip:{
      color: utools.isDarkColors()? '#2a2a2c':'#fafafc',
      textColor: utools.isDarkColors()? '#fafafc':'#2a2a2c'
    }
  }
  refreshListView()
}

</script>


<style scoped>
#extra-left{
  position: fixed;
  left:20px;
  top:90vh;
}
</style>
