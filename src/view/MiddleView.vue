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
<!--  <vim-status-bar/>-->
  <n-drawer v-model:show="$reactive.main.settingActive" width="50vw" placement="right">
    <side-view/>
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
          添加代码片段
        </n-tooltip>

        <n-tooltip trigger="hover" placement="left" >
          <template #trigger>
            <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="$reactive.main.settingActive = true">
              <template #icon>
                <svg-expand/>
              </template>
            </n-button>
          </template>
          设置
        </n-tooltip>
        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong circle secondary type="primary"  :color="configManager.getGlobalColor()"  @contextmenu="$reactive.main.isButtonFixed = !$reactive.main.isButtonFixed" @click="refreshListView(true)">
              <template #icon>
                <template v-if="$reactive.main.isButtonFixed">
                  <svg-refresh-fixed/>
                </template>
                <template v-else>
                  <svg-refresh/>
                </template>
              </template>
            </n-button>
          </template>
          左击刷新，右击{{$reactive.main.isButtonFixed? '取消固定':'固定'}}
        </n-tooltip>
      </n-space>
    </template>
    <template v-else>
      <n-tooltip trigger="hover" placement="left">
        <template #trigger>
          <n-button :focusable="false" strong circle type="primary" quaternary :color="configManager.getGlobalColor()" @click="expanded = true" >
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
import TopNav from "../components/item/TopNav.vue";
import TagColorChangeModal from "../components/modal/TagColorChangeModal.vue";
import SvgAdd from "../asserts/add.svg";
import SvgExpand from "../asserts/expand.svg";
import SvgRefresh from "../asserts/refresh.svg";
import SvgRefreshFixed from "../asserts/refresh-fixed.svg";
import SvgArrowUp from "../asserts/arrow-up.svg";

const expanded = ref(false)
window.$message = useMessage();
window.$dialog = useDialog();
const topNavShow = ref(true)
watch([()=>$reactive.utools.search,
  ()=>$reactive.currentPrefix,
  ()=> $reactive.utools.searchRefreshValue,
  ()=> $reactive.main.isRecycleBinActive
],async ([search,prefix,value,isRecycleBinActive])=>{
  const list = await GLOBAL_HIERARCHY.search(search,isRecycleBinActive);
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