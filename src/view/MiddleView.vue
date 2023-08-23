<template>
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
</template>

<script setup>
import ListView from "./ListView.vue";
import SideView from "./SideView.vue";
import CustomView from "./CustomView.vue";
import CodeView from "./CodeView.vue";
import FormView from "./FormView.vue";
import VimStatusBar from "../components/VimStatusBar.vue";
import ShortcutPane from "../components/ShortcutPane.vue";

import {$var} from "../js/store"
import {ref} from "vue";
import {useMessage} from 'naive-ui'


const Tabs = [
  ListView,CodeView,FormView,FormView
]
const height = ref(150)
const helpViewScorllerRef = ref(null)
window.$message = useMessage();

function onShow(){
  if($var.scroll.helpInvoker === null){
    $var.scroll.helpInvoker = helpViewScorllerRef.value;
  }
}
</script>

<style>

</style>