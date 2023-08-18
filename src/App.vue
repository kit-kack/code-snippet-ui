<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <component :is="Tabs[$var.currentMode]"/>
      <vim-status-bar/>
      <n-drawer v-model:show="$var.view.settingActive" :width="380" placement="right">
        <side-view/>
      </n-drawer>
      <n-drawer v-model:show="$var.view.customActive" placement="bottom" :height="height">
        <custom-view v-model:height="height"/>
      </n-drawer>
      <n-drawer display-directive="show" v-model:show="$var.view.helpActive" placement="left" :width="380" @after-enter="onShow()">
        <n-scrollbar style="max-height: 99%" ref="helpViewScorllerRef" >
          <shortcut-pane/>
        </n-scrollbar>
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
import CustomView from "./view/CustomView.vue";
import {initTheme, theme, themeOverrides} from "./js/theme";
import {onMounted, ref} from "vue";
import ShortcutPane from "./components/ShortcutPane.vue";

const Tabs = [
    ListView,CodeView,FormView,FormView,CustomView
]
const height = ref(150)
const helpViewScorllerRef = ref(null)

function onShow(){
  if($var.scroll.helpInvoker === null){
    $var.scroll.helpInvoker = helpViewScorllerRef.value;
  }
}

onMounted(()=>{
  document.body.id = utools.isDarkColors()? 'dark-app' : 'light-app'
  initTheme()
})

</script>


<style scoped>

</style>
