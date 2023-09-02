<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>

  <vim-status-bar/>
  <n-drawer v-model:show="$reactive.view.settingActive" :width="380" placement="right">
    <side-view/>
  </n-drawer>
  <n-drawer v-model:show="$reactive.view.customActive" placement="bottom" :height="height">
    <custom-view v-model:height="height"/>
  </n-drawer>
  <n-drawer display-directive="show" v-model:show="$reactive.view.helpActive" placement="left" :width="380" @after-enter="onShow()">
    <n-scrollbar style="max-height: 99%" ref="helpViewScorllerRef" >
      <shortcut-pane/>
    </n-scrollbar>
  </n-drawer>
  <variable-input-alert v-if="$reactive.view.variableActive"/>
</template>

<script setup>
import SideView from "./SideView.vue";
import CustomView from "./CustomView.vue";
import VimStatusBar from "../components/VimStatusBar.vue";
import ShortcutPane from "../components/ShortcutPane.vue";
import {ref} from "vue";
import {useMessage} from 'naive-ui'
import VariableInputAlert from "../components/VariableInputAlert.vue";
import {$normal, $reactive} from "../js/store";


const height = ref(150)
const helpViewScorllerRef = ref(null)
window.$message = useMessage();

function onShow(){
  if($normal.scroll.helpInvoker === null){
    $normal.scroll.helpInvoker = helpViewScorllerRef.value;
  }
}
</script>

<style>
</style>