<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <middle-view/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import hljs from "./js/dep/highlight-dep";
import {theme, themeOverrides} from "./js/theme";
import {onMounted, watch} from "vue";
import MiddleView from "./view/MiddleView.vue";
import _ from "lodash";
import {GLOBAL_HIERARCHY} from "./js/hierarchy/core";
import {$normal, $reactive, LIST_VIEW, utools_focus_or_blur} from "./js/store";

const handleUtoolsTextChange =  _.debounce((text)=>{
  if($reactive.view.backStageShow){
    utools.showNotification("插件重新前台运行")
    $reactive.view.backStageShow = false;
    GLOBAL_HIERARCHY.changeView(LIST_VIEW,true)
  }else if($reactive.currentMode !== LIST_VIEW){
    return
  }
  text = text.trim();
  if(text.length === 0){
    $reactive.utools.search = null;
  }else{
    if($reactive.utools.search !== text){
      $reactive.utools.search = text;
      $normal.keepSelectedStatus = null;
      // $normal.itemOffsetArray = [];
      // fix: 修复删除界面不移除
      $reactive.view.isDel = false;
      $reactive.view.helpActive = false;
      // refreshListView(true)
    }
  }
},250)

watch(()=>$reactive.currentMode,(mode)=>{
  if(mode === LIST_VIEW){
    utools.setSubInput(({text}) =>{
      handleUtoolsTextChange(text)
    },"搜索: name #tag @type")
    if(!$reactive.utools.focused){
      utools.subInputBlur();
    }
  }else{
    utools.removeSubInput()
  }

},{
  immediate: true
})

onMounted(()=>{
  document.body.id = utools.isDarkColors()? 'dark-app' : 'light-app'
})

</script>


<style scoped>

</style>
