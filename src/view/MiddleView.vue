<template>
<!--  <router-view v-slot="{ Component }">-->
<!--    <keep-alive include="ListView">-->
<!--      <component :is="Component" :key="$route.fullPath" />-->
<!--    </keep-alive>-->
<!--  </router-view>-->
  <template v-if="$reactive.view.deepRefresh">
    <list-view v-show="$reactive.currentMode === LIST_VIEW"/>
  </template>
  <template v-if="$reactive.currentMode === CODE_VIEW">
    <code-view/>
  </template>
  <template v-else-if="$reactive.currentMode >= EDIT_VIEW">
    <form-view/>
  </template>
  <vim-status-bar/>
  <n-drawer v-model:show="$reactive.view.settingActive" :width="380" placement="right">
    <side-view/>
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
import VimStatusBar from "../components/VimStatusBar.vue";
import ShortcutPane from "../components/ShortcutPane.vue";
import {ref} from "vue";
import {useMessage} from 'naive-ui'
import VariableInputAlert from "../components/VariableInputAlert.vue";
import {$normal, $reactive, CODE_VIEW, EDIT_VIEW, LIST_VIEW} from "../js/store";
import ListView from "./ListView.vue";
import CodeView from "./CodeView.vue";
import FormView from "./FormView.vue";

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