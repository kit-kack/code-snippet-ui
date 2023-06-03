<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <template v-if="currentMode === LIST_VIEW">
        <template v-if="refreshStatus ">
          <list-view  @side-show="settingActive = true" @refresh="dealWithRefresh"/>
        </template>
      </template>
      <template v-else-if="currentMode === CODE_VIEW">
        <code-view :name="currentName"  @do-close=" handleCloseCodeView" />
      </template>
      <template v-else-if="currentMode === UPDATE_VIEW">
        <code-snippet-form update  :name="currentName"  @do-cancel="handleRecoverLiteShow();currentMode = LIST_VIEW" @do-update="handleForm"/>
      </template>
      <template v-else>
        <code-snippet-form   @do-cancel="handleRecoverLiteShow();currentMode = LIST_VIEW" @do-update="handleForm"/>
      </template>
      <n-drawer v-model:show="settingActive" :width="380" placement="right">
        <side-view @refresh="dealWithRefresh" />
      </n-drawer>
      <div id="extra-left" v-if="!focusOnUtoolsInput && fullScreenShow">
        <vim-status-bar />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import ListView from "./view/ListView.vue";
import {nextTick, ref} from "vue";
import {configManager} from "./js/core.js";
import {darkTheme} from 'naive-ui'
import {
  CODE_VIEW,
  currentMode,
  currentName,
  focusOnUtoolsInput,
  fullScreenShow,
  handleRecoverLiteShow,
  keepSelectedStatus,
  LIST_VIEW,
  settingActive,
  UPDATE_VIEW,
} from "./js/utils/variable.js";
import hljs from "highlight.js/lib/common";
import SideView from "./view/SideView.vue";
import CodeView from "./view/CodeView.vue";
import CodeSnippetForm from "./view/FormView.vue";
import VimStatusBar from "./components/VimStatusBar.vue";

const theme = utools.isDarkColors()? darkTheme:null;
const refreshStatus = ref(true);
const themeOverrides = ref({
  Card:{
    boxShadow:'0px 1px 0px rgba(17,17,26,0.05), 0px 0px 4px '+configManager.getGlobalColor()
  },
  Tabs:{
    tabTextColorActiveLine: configManager.getGlobalColor(),
    tabTextColorHoverLine: configManager.getGlobalColor(),
    tabTextColorActiveCard: configManager.getGlobalColor(),
    barColor: configManager.getGlobalColor()
  },
  Switch:{
    railColorActive: configManager.getGlobalColor()
  }
})

const dealWithRefresh = ()=>{
  refreshStatus.value = false;
  themeOverrides.value = {
    Card:{
      boxShadow:'0px 1px 0px rgba(17,17,26,0.05), 0px 0px 4px '+configManager.getGlobalColor(),
    },
    Tabs:{
      tabTextColorActiveLine: configManager.getGlobalColor(),
      tabTextColorHoverLine: configManager.getGlobalColor(),
      tabTextColorActiveCard: configManager.getGlobalColor(),
      barColor: configManager.getGlobalColor()
    },
    Switch:{
      railColorActive: configManager.getGlobalColor()
    }
  }
  nextTick(()=>{
    refreshStatus.value = true;
  })
}
const handleForm = ()=>{
  handleRecoverLiteShow()
  currentMode.value = LIST_VIEW;
  dealWithRefresh()
}

const handleCloseCodeView = ()=>{
  handleRecoverLiteShow();
  currentMode.value = LIST_VIEW;
  keepSelectedStatus.value = true;

}
</script>


<style scoped>
#extra-left{
  position: fixed;
  left:20px;
  top:90vh;
}
</style>
