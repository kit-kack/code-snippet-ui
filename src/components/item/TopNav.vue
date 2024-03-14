<template>
  <div id="top-nav" :class="{
    'non-code-view': $reactive.currentMode !== CODE_VIEW && !$reactive.form.fullScreen
  }">
    <n-scrollbar x-scrollable style="max-width: 60vw"  :ref="(el)=> $normal.scroll.hierarchyInvoker = el">
      <n-breadcrumb style="padding-left: 10px" class="top-nav-item" >
        <n-breadcrumb-item  clickable @click="clearCurrentPrefix">
          {{$reactive.main.isFullScreenShow ? '◈': '◇'}}
        </n-breadcrumb-item>
        <n-breadcrumb-item v-for="(p,index) in $reactive.currentPrefix" clickable @click="sliceCurrentPrefix(index)">
          {{p}}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </n-scrollbar>

  </div>
  <div class="snippet-count-info">
    <template  v-if="$reactive.currentMode === CODE_VIEW && $reactive.code.sectionsChange">
      <n-button
          text
          :color="$normal.theme.globalColor"
          style="height: 15px" size="small" @click="$normal.handle_sections_change(true)" >
        撤销
      </n-button> - <n-button
          text
          :color="$normal.theme.globalColor"
          style="height: 15px" size="small" @click="$normal.handle_sections_change(false)" >
        保存
      </n-button>
    </template>

    <n-button
        text
        :color="$normal.theme.globalColor"
        @click="$reactive.form.fullScreen = false"
        style="height: 15px" size="small"  v-else-if="$reactive.currentMode > CODE_VIEW && $reactive.form.fullScreen">
      退出全屏
      <template #icon>
        <svg-exit-fullscreen/>
      </template>
    </n-button>
    <n-dropdown v-else size="small" placement="bottom-start" trigger="hover" :options="tagOptions" :render-icon="renderIcon" style="max-height: min(240px, calc(100vh * 0.7) )" :disabled="$reactive.currentMode !== LIST_VIEW" scrollable>
      <template v-if="$reactive.main.selectedTag === null">
        <n-button size="small" text style="font-weight: bold;font-size: 12px;height: 15px">ALL</n-button>
      </template>
      <template v-else>
        <normal-tag :content="$reactive.main.selectedTag" type="raw"/>
      </template>
    </n-dropdown>
    <span> • {{word}} {{$reactive.main.isFullScreenShow? '◈': '◇'}}</span>
  </div>
</template>
<script setup>

import {$list, $normal, $reactive, CODE_VIEW, LIST_VIEW} from "../../js/store";
import {GLOBAL_HIERARCHY} from "../../js/hierarchy/core";
import {computed, h, ref, watch} from "vue";
import dayjs from "dayjs";
import NormalTag from "../base/NormalTag.vue";
import SvgExitFullscreen from "../../asserts/exit-fullscreen.svg";
import {replaceOrAddTag} from "../../js/utils/resolve";
import {tagColorManager} from "../../js/utools/tag";
const word = ref(0);
const weekdays = ["周日","周一","周二","周三","周四","周五","周六"];
let timer = null;
watch([()=>$list.value,()=>$reactive.currentMode],(newValue)=>{
  if($reactive.currentMode === LIST_VIEW){
    word.value = $list.value.length;
    if(timer){
      clearInterval(timer)
    }
  }else{
    const now = dayjs();
    word.value = now.format(`YYYY/M/D ${weekdays[now.day()]} HH:mm`);
    if(!timer){
      timer = setInterval(()=>{
        const now = dayjs();
        word.value = now.format(`YYYY/M/D ${weekdays[now.day()]} HH:mm`);
      },10000)
    }
  }
},{
  deep: true,
  immediate:false
})
function clearCurrentPrefix(){
  if($reactive.currentMode === LIST_VIEW){
    GLOBAL_HIERARCHY.changeHierarchy("root")
  }
}
function sliceCurrentPrefix(ind){
  if($reactive.currentMode === LIST_VIEW){
    GLOBAL_HIERARCHY.changeHierarchy("custom",ind);
  }
}
const renderIcon = (option) => {
  if(option.default){
    return '🌟'
  }else{
    return h(
        'div',
        {
          style:{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: tagColorManager.get(option.label).background
          }
        },
        null
    )
  }
}
const ALL_TAG = {
  label: 'ALL',
  value: 'ALL',
  default:true,
  props:{
    onClick:()=>{
      $reactive.main.selectedTag = null;
      replaceOrAddTag($reactive.utools.search,null)
    }
  }
}
const tagOptions = computed(()=>{
  if($reactive.main.tagSet.size=== 0){
    return [ ALL_TAG];
  }
  const tags = [
    ALL_TAG,
    {
      type: 'divider',
      key: 'divider'
    }
  ];
  for (let key of $reactive.main.tagSet.keys()) {
    tags.push({
      label: key,
      value: key,
      props: {
        onClick: ()=>{
          $reactive.main.selectedTag = key;
          replaceOrAddTag($reactive.utools.search,key)
        }
      }
    })
  }
  return tags;
})
</script>
<style lang="scss" scoped>
#top-nav{
  position: relative;
  box-sizing: border-box;
  height: 17px;
  padding-top: 2px;
  width: 100%;
  * {
    user-select: none;
  }
}
.top-nav-item{
  height: 15px;
  font-size: 12px;
  line-height: 1.0;
}
.snippet-count-info{
  position: fixed;
  right: 10px;
  top:2px;
  height: 15px;
  font-size: 12px;
  line-height: 1.0;
  user-select: none;
}
.snippet-count-info *{
  user-select: none !important;
}
.snippet-count-info > * {
  vertical-align: middle;
}
.n-breadcrumb .n-breadcrumb-item .n-breadcrumb-item__link{
  padding: 0 !important;
}
#light-app{
  #top-nav{
    background-color: white;

    &.non-code-view{
      background: linear-gradient(180deg,#fff,#f5f5f5);
    }
  }
}

#dark-app{
  .snippet-count-info{
    color: #d9d9da;
  }
}


</style>