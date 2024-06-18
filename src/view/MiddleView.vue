<template>
  <top-nav v-if="topNavShow"/>
  <template v-if="$reactive.main.deepRefresh">
    <list-view  v-show="$reactive.currentMode === LIST_VIEW"/>
  </template>
  <template v-if="$reactive.currentMode === CODE_VIEW">
    <code-view/>
  </template>
  <template v-else-if="$reactive.currentMode >= EDIT_VIEW">
    <form-view/>
  </template>
  <vim-status-bar/>
  <n-drawer v-model:show="$reactive.main.settingActive" width="50vw" placement="right">
    <n-scrollbar style="max-height: 100vh" :ref="(el) => $normal.scroll.settingInvoker= el" >
      <side-view/>
    </n-scrollbar>
  </n-drawer>
  <n-drawer  v-model:show="$reactive.common.shortcutActive" display-directive="show" placement="left" :width="380">
    <n-scrollbar style="max-height: 99%" :ref="(el) => $normal.scroll.helpInvoker= el" >
      <shortcut-pane/>
    </n-scrollbar>
  </n-drawer>

  <variable-input-modal v-if="$reactive.common.variableActive"/>
  <tag-color-change-modal v-if="$reactive.main.tagColorActive"/>
  <div id="extra" v-if="$reactive.currentMode=== LIST_VIEW && $reactive.main.isFullScreenShow" @mouseenter="expanded = true" @mouseleave="expanded = false">
    <template v-if="expanded || $reactive.main.isButtonFixed">
      <n-space vertical style="padding-bottom: 6px">
        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="GLOBAL_HIERARCHY.changeView(CREATE_VIEW)">
              <template #icon>
                <svg-add/>
              </template>
            </n-button>
          </template>
          添加代码片段<span class="shortcut" v-html="CtrlStr + ' + N'"></span>
        </n-tooltip>

        <n-tooltip trigger="hover" placement="left" >
          <template #trigger>
            <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="$reactive.main.settingActive = true">
              <template #icon>
                <svg-expand/>
              </template>
            </n-button>
          </template>
          设置<span class="shortcut">/</span>
        </n-tooltip>
        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="$reactive.common.shortcutActive = true" >
              <template #icon>
                <svg-stack/>
              </template>
            </n-button>
          </template>
          快捷键<span class="shortcut">Z</span>
        </n-tooltip>
      </n-space>
    </template>
    <template v-else>
      <n-tooltip trigger="hover" placement="left">
        <template #trigger>
          <n-button :focusable="false" strong circle type="primary" quaternary :color="configManager.getGlobalColor()">
            <template #icon>
              <svg-arrow-up/>
            </template>
          </n-button>
        </template>
        展开
      </n-tooltip>
    </template>
  </div>
</template>

<script setup>
import SideView from "./SideView.vue";
import ShortcutPane from "../components/pane/ShortcutPane.vue";
import {ref, watch} from "vue";
import {NButton, useDialog, useMessage} from 'naive-ui'
import VariableInputModal from "../components/modal/VariableInputModal.vue";
import {$list, $normal, $reactive, CODE_VIEW, CREATE_VIEW, EDIT_VIEW, LIST_VIEW, refreshListView} from "../js/store";
import ListView from "./ListView.vue";
import CodeView from "./CodeView.vue";
import FormView from "./FormView.vue";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import {configManager} from "../js/utools/config";
import TopNav from "../components/TopNav.vue";
import TagColorChangeModal from "../components/modal/TagColorChangeModal.vue";
import SvgAdd from "../asserts/add.svg";
import SvgExpand from "../asserts/expand.svg";
import SvgArrowUp from "../asserts/arrow-up.svg";
import SvgStack from "../asserts/stack.svg";
import VimStatusBar from "../components/VimStatusBar.vue";
import {CtrlStr} from "../js/some";

const expanded = ref(false)
window.$message = useMessage();
window.$dialog = useDialog();
/**
 * @typedef {Object} Option
 * @property {string} title
 * @property {string | Function} content
 * @property {Function} contentRender
 * @property {Function} callback
 */
/**
 * @param {Option} option
 */
window.$kit_error_dialog = function (option) {
  // check content
  const prefix = '操作不可逆，是否'
  if(typeof option.content === 'string'){
    option.content = prefix + option.content
  }else{
    option.contentRender = ()=>{
      /**
      * @type {import('vue').VNode}
      */
      const vNode = option.content()
      vNode.children.unshift(prefix);
      return vNode
    }
  }
  $dialog.error({
    autoFocus: false,
    closable: false,
    bordered: true,
    title: option.title,
    content: option.contentRender ?? option.content,
    style:{
      padding: '10px 20px'
    },
    positiveText: '确定',
    positiveButtonProps:{
      secondary: true
    },
    negativeButtonProps:{
      secondary: true
    },
    negativeText: '取消',
    onPositiveClick: option.callback
  })
}
const topNavShow = ref(true)
watch([()=>$reactive.utools.search,
  ()=>$reactive.currentPrefix,
  ()=> $reactive.utools.searchRefreshValue,
  ()=> $reactive.main.isRecycleBinActive
],async ([search,prefix,value,isRecycleBinActive])=>{
  const list = await GLOBAL_HIERARCHY.search(search);
  const isSameLength = $list.value.length === list.length;
  if(isSameLength){
    if(list.length === 0 && $reactive.utools.search){
      // 不做任何改变
      if(!$reactive.main.isFullScreenShow){
        topNavShow.value = false;
        utools.setExpendHeight(0)
      }
      return
    }
  }
  topNavShow.value = true;
  $list.value = list;
  refreshListView()
},{
  deep:true,
  immediate:true,
  flush: 'post'
})
</script>

<style scoped>
#extra{
  position: fixed;
  right:20px;
  bottom: 6px;
  z-index: 2000;
  text-align: center;
}
</style>