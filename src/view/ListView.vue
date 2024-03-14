<template>
  <div id="list-view">
    <template v-if="$list.length > 0">
      <DynamicScroller
          :items="$list"
          key-field="now"
          :min-item-size="60"
          class="scroller"
          :ref="(el)=> $normal.scroll.virtualInvoker = el">
        <template v-slot="{item,index, active}">
          <DynamicScrollerItem
              :active="active"
              :item="item"
              :data-index="index">
            <list-item
                :index="index"
                :snippet="item"
                :last="index === $list.length - 1"
                :selected="handleSelect(index,$index)"/>
            <div v-if="(index === $list.length -1) && $reactive.main.isFullScreenShow" style="height: 250px"></div>
          </DynamicScrollerItem>
        </template>

      </DynamicScroller>
    </template>
    <template v-else-if="$reactive.main.isFullScreenShow">
      <n-result   title="空空如也" size="small">
        <template #icon>
          <svg-not-found/>
        </template>
      </n-result>
    </template>
  </div>
</template>

<script setup>
import {$index, $list, $normal, $reactive} from "../js/store";
import ListItem from "../components/ListItem.vue";
import {DynamicScroller, DynamicScrollerItem} from "vue-virtual-scroller";
import SvgNotFound from "../asserts/not-found.svg";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import {onMounted} from "vue";

const handleSelect = (index,selectedIndex)=>{
  if(index === selectedIndex){
    $reactive.currentSnippet = $list.value[index]
    return true;
  }else{
    return false;
  }
}

onMounted(()=>{
  if($reactive.main.isFullScreenShow){
    utools.setExpendHeight(545)
    $normal.recoverLiteHeight = 545;
  }else{
    if($list.value.length > 0){
      const height = $list.value.length * 70 + 18;
      $normal.recoverLiteHeight = height > 535? 545 : height;
    }else{
      $normal.recoverLiteHeight = 20;
    }
    utools.setExpendHeight($normal.recoverLiteHeight)
  }
})
</script>

<style>
.scroller{
  max-height: calc(100vh - 19px);
}
</style>