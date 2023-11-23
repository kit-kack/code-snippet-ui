<template>
  <div id="top-nav" :class="{
    'non-code-view': $reactive.currentMode !== CODE_VIEW
  }">
    <n-scrollbar x-scrollable style="max-width: 92vw;" :ref="(el)=> $normal.scroll.hierarchyInvoker = el">
      <n-breadcrumb style="padding-left: 10px" class="top-nav-item" >
        <n-breadcrumb-item  clickable @click="clearCurrentPrefix">
          ◈
        </n-breadcrumb-item>
        <n-breadcrumb-item v-for="(p,index) in $reactive.currentPrefix" clickable @click="sliceCurrentPrefix(index)">
          {{p}}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </n-scrollbar>
    <div class="top-nav-item snippet-count-info">
      {{word}} {{$reactive.view.fullScreenShow? '◈': '◇'}}
    </div>
  </div>
</template>
<script setup>

import {$list, $normal, $reactive, CODE_VIEW, LIST_VIEW} from "../../js/store";
import {GLOBAL_HIERARCHY} from "../../js/hierarchy/core";
import {ref, watch} from "vue";
import dayjs from "dayjs";
const word = ref();
const weekdays = ["周一","周二","周三","周四","周五","周六","周日"];
let timer = null;
watch([()=>$list.value,()=>$reactive.currentMode],(newValue)=>{
  if($reactive.currentMode === LIST_VIEW){
    word.value = $list.value.length;
    if(timer){
      clearInterval(timer)
    }
  }else{
    const now = dayjs();
    word.value = now.format(`M月D日 ${weekdays[now.day()]} HH:mm`);
    if(!timer){
      timer = setInterval(()=>{
        const now = dayjs();
        word.value = now.format(`M月D日 ${weekdays[now.day()]} HH:mm`);
      },10000)
    }
  }
},{
  deep: true,
  immediate:true
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
</script>
<style scoped>
#top-nav{
  height: 15px;
}
#light-app #top-nav{
  background-color: white;
}
#light-app #top-nav.non-code-view{
  background: linear-gradient(180deg,#fff,#f5f5f5);
}

.top-nav-item{
  height: 15px;
  font-size: 12px;
  line-height: 1.0;
}
.snippet-count-info{
  position: absolute;
  right: 10px;
  top:0;
}
#dark-app .snippet-count-info{
  color: #d9d9da;
}
#light-app .n-breadcrumb-item :hover{
  color: #282c34 !important;
}
#dark-app .n-breadcrumb-item :hover{
  color: white !important;
}
</style>