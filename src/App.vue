<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <div id="app-core" :class="{forbid: !$reactive.main.isCursorShow}"
             @mousemove="$reactive.main.isCursorShow = true">
          <middle-view/>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import hljs from "./js/dep/highlight-dep";
import {theme, themeOverrides} from "./js/theme";
import {watch} from "vue";
import MiddleView from "./view/MiddleView.vue";
import {$normal, $reactive, LIST_VIEW} from "./js/store";
import {debounce as _debounce} from "lodash-es"

const handleUtoolsTextChange =  _debounce((text)=>{
  text = text.trim();
  if(text.length === 0){
    $reactive.utools.search = null;
  }else{
    if($reactive.utools.search !== text){
      $reactive.utools.search = text;
      $normal.keepSelectedStatus = false;
      // $normal.itemOffsetArray = [];
      // fix: 修复删除界面不移除
      $reactive.main.isDel = false;
      $reactive.common.shortcutActive = false;
      // refreshListView(true)
    }
  }
},250)

watch(()=>$reactive.currentMode,(mode)=>{
  if(mode === LIST_VIEW){
    utools.setSubInput(({text}) =>{
      handleUtoolsTextChange(text)
    },"搜索 name #tag @type")
    if($reactive.utools.search){
      utools.setSubInputValue($reactive.utools.search)
    }
    if(!$reactive.utools.focused){
      utools.subInputBlur();
    }
  }else{
    utools.removeSubInput()
  }
},{
  immediate: true
})

</script>


<style scoped>
#app-core.forbid, #app-core.forbid *{
  cursor: none !important;
}
</style>
