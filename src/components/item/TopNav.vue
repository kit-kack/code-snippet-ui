<template>
  <div id="top-nav" :class="{
    'non-code-view': $reactive.currentMode !== CODE_VIEW
  }">
    <n-scrollbar x-scrollable style="max-width: 60vw"  :ref="(el)=> $normal.scroll.hierarchyInvoker = el">
      <n-breadcrumb style="padding-left: 10px" class="top-nav-item" >
        <n-breadcrumb-item  clickable @click="clearCurrentPrefix">
          ◈
        </n-breadcrumb-item>
        <n-breadcrumb-item v-for="(p,index) in $reactive.currentPrefix" clickable @click="sliceCurrentPrefix(index)">
          {{p}}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </n-scrollbar>

  </div>
  <div class="snippet-count-info">
    <n-dropdown size="small" placement="bottom-start" trigger="click" :options="tagOptions" :render-icon="renderIcon" style="max-height: min(240px, calc(100vh * 0.7) )" :disabled="$reactive.currentMode !== LIST_VIEW" scrollable>
      <template v-if="$reactive.main.selectedTag === null">
          <span style="font-weight: bold">ALL</span>
      </template>
      <template v-else>
        <normal-tag :content="$reactive.main.selectedTag" type="raw"/>
      </template>
    </n-dropdown>
    • {{word}} {{$reactive.main.isFullScreenShow? '◈': '◇'}}
  </div>
</template>
<script setup>

import {$list, $normal, $reactive, CODE_VIEW, LIST_VIEW} from "../../js/store";
import {GLOBAL_HIERARCHY} from "../../js/hierarchy/core";
import {computed, h, ref, watch} from "vue";
import dayjs from "dayjs";
import NormalTag from "../base/NormalTag.vue";
import {replaceOrAddTag} from "../../js/utils/resolve";
import {tagColorManager} from "../../js/core/tag";
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
const tagOptions = computed(()=>{
  const tags = [
    {
      label: 'ALL',
      value: 'ALL',
      default:true,
      props:{
        onClick:()=>{
          $reactive.main.selectedTag = null;
          replaceOrAddTag($reactive.utools.search,null)
        }
      }
    },
    {
      type: 'divider',
      key: 'divider'
    }
  ];
  if($reactive.main.tagSet.size=== 0){
    return;
  }
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
  height: 15px;
  width: 100%;
}
.top-nav-item{
  height: 15px;
  font-size: 12px;
  line-height: 1.0;
}
.snippet-count-info{
  position: fixed;
  right: 10px;
  top:0;
  height: 15px;
  font-size: 12px;
  line-height: 1.0;
  user-select: none;
}
.snippet-count-info *{
  user-select: none !important;
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