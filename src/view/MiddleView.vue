<template>
  <top-nav/>
  <template v-if="$reactive.view.deepRefresh">
    <list-view  v-show="$reactive.currentMode === LIST_VIEW"/>
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
  <aid-tag-pane/>

  <variable-input-alert v-if="$reactive.view.variableActive"/>

  <div id="extra" v-if="$reactive.currentMode=== LIST_VIEW && $reactive.view.fullScreenShow" @mouseenter="expanded = true" @mouseleave="expanded = false">
    <template v-if="expanded || $reactive.view.buttonFixed">
      <n-space vertical style="padding-bottom: 6px">
        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="GLOBAL_HIERARCHY.changeView(CREATE_VIEW)">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z" fill="currentColor"></path></svg>
              </template>
            </n-button>
          </template>
          添加代码片段
        </n-tooltip>

        <n-tooltip trigger="hover" placement="left" >
          <template #trigger>
            <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="$reactive.view.settingActive = true">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 7h9v2h-9zm0 8h9v2h-9zm3-4h6v2h-6zm-3 1L8 7v4H2v2h6v4z" fill="currentColor"></path></svg>
              </template>
            </n-button>
          </template>
          设置
        </n-tooltip>
        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong circle secondary type="primary"  :color="configManager.getGlobalColor()"  @contextmenu="$reactive.view.buttonFixed = !$reactive.view.buttonFixed" @click="refreshListView(true)">
              <template #icon>
                <template v-if="$reactive.view.buttonFixed">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M21.25 7.5a.75.75 0 0 1 .743.648L22 8.25v8.5a3.25 3.25 0 0 1-3.066 3.245L18.75 20H6.061l.72.72a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073l-2-2l-.064-.072a1.213 1.213 0 0 1-.007-.01l.07.082a.753.753 0 0 1-.127-.89a.775.775 0 0 1 .128-.17l2-2a.75.75 0 0 1 1.133.976l-.073.084l-.72.72h12.69a1.75 1.75 0 0 0 1.744-1.607l.006-.143v-8.5a.75.75 0 0 1 .75-.75zm-3.054-5.353l.084.073l2 2a.75.75 0 0 1 .071.081l-.07-.081a.752.752 0 0 1 .004 1.056l-.005.004l-2 2a.75.75 0 0 1-1.133-.976l.073-.084l.718-.72H5.25a1.75 1.75 0 0 0-1.744 1.606L3.5 7.25v8.5a.75.75 0 0 1-1.493.102L2 15.75v-8.5a3.25 3.25 0 0 1 3.066-3.245L5.25 4h12.689l-.72-.72a.75.75 0 0 1-.072-.976l.073-.084a.75.75 0 0 1 .976-.073zM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8z" fill="currentColor"></path></g></svg>
                </template>
                <template v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><g fill="none"><path d="M14.854 2.146a.5.5 0 0 0-.708.708L15.293 4H4a2 2 0 0 0-2 2v6.5a.5.5 0 0 0 1 0V6a1 1 0 0 1 1-1h11.293l-1.147 1.146a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2zM16 15a1 1 0 0 0 1-1V7.5a.5.5 0 0 1 1 0V14a2 2 0 0 1-2 2H4.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2a.5.5 0 0 1 .708.708L4.707 15H16zm-3-5a3 3 0 1 1-6 0a3 3 0 0 1 6 0zm-1 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0z" fill="currentColor"></path></g></svg>
                </template>
              </template>
            </n-button>
          </template>
          左击刷新，右击{{$reactive.view.buttonFixed? '取消固定':'固定'}}
        </n-tooltip>
      </n-space>
    </template>
    <template v-else>
      <n-tooltip trigger="hover" placement="left">
        <template #trigger>
          <n-button strong circle type="primary" quaternary :color="configManager.getGlobalColor()" @click="expanded = true" >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" fill="currentColor"></path></svg>
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
import VimStatusBar from "../components/VimStatusBar.vue";
import ShortcutPane from "../components/pane/ShortcutPane.vue";
import {ref, watch} from "vue";
import {NButton, useDialog, useMessage} from 'naive-ui'
import VariableInputAlert from "../components/modal/VariableInputModal.vue";
import {$list, $normal, $reactive, CODE_VIEW, CREATE_VIEW, EDIT_VIEW, LIST_VIEW, refreshListView} from "../js/store";
import ListView from "./ListView.vue";
import CodeView from "./CodeView.vue";
import FormView from "./FormView.vue";
import AidTagPane from "../components/pane/TagChoosePane.vue";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import {configManager} from "../js/core/config";
import TopNav from "../components/item/TopNav.vue";

const helpViewScorllerRef = ref(null)
const expanded = ref(false)
window.$message = useMessage();
window.$dialog = useDialog();

function onShow(){
  if($normal.scroll.helpInvoker === null){
    $normal.scroll.helpInvoker = helpViewScorllerRef.value;
  }
}
watch([()=>$reactive.utools.search,()=>$reactive.currentPrefix,()=> $reactive.utools.searchRefreshValue],([search,prefix,value])=>{
  GLOBAL_HIERARCHY.search(search).then(list => {
    const isSameLength = $list.value.length === list.length;
    if(isSameLength){
      if(list.length === 0){
        // 不做任何改变
        if(!$reactive.view.fullScreenShow){
          utools.setExpendHeight(0)
        }
        return
      }
    }
    $list.value = list;
    refreshListView()
  })
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
  z-index: 20;
  text-align: center;
}
</style>