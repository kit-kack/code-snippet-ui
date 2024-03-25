<template>
  <div id="list-view">
    <template v-if="$list.length > 0">
      <div :class="$reactive.main.isSideCodeViewShow?'kitx-half-container': null">
        <div class="colmun">
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
                <div v-if="(index === $list.length -1) && $reactive.main.isFullScreenShow" style="height: 215px"></div>
              </DynamicScrollerItem>
            </template>

          </DynamicScroller>
        </div>
        <div v-if="$reactive.main.isSideCodeViewShow" class="column" style="width: 48vw">
          <h4 v-if="$index < 0">暂无代码片段选中</h4>
          <template v-else-if="$reactive.currentSnippet.dir">
            <div class="kitx-center">
              <n-result size="small" :title="getDirType($reactive.currentSnippet.ref)" :description="$reactive.currentSnippet.path">
                <template #icon>
                  <n-icon size="256" color="#707070">
                    <svg-directory/>
                  </n-icon>
                </template>
              </n-result>
            </div>
          </template>
          <template v-else-if="$reactive.currentSnippet.link">
            <div class="kitx-center">
              <n-result size="small" title="链接" :description="$reactive.currentSnippet.path">
                <template #icon>
                  <n-icon size="256">
                    <svg-link/>
                  </n-icon>
                </template>
              </n-result>
            </div>
          </template>
          <async-code-view v-else :snippet="$reactive.currentSnippet" />

        </div>
      </div>
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
import {defineAsyncComponent, onMounted, watch} from "vue";
import SvgDirectory from "../asserts/directory.svg";
import SvgLink from "../asserts/link.svg"
import {getDirType} from "../js/utils/common";

const AsyncCodeView =defineAsyncComponent(()=> import('./LiteCodeView.vue'))
const handleSelect = (index,selectedIndex)=>{
  if(index === selectedIndex){
    // $reactive.currentSnippet = $list.value[index]
    return true;
  }else{
    return false;
  }
}
watch($index,(newValue)=>{
  $reactive.currentSnippet = $list.value[newValue]
},{
  immediate: true,
  flush: 'pre'
})

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

<style lang="scss">
.scroller{
  max-height: calc(100vh - 19px);
}
#list-view{
  .kitx-half-container{
    display: flex;
    width: 100vw;
    .colmun{
      flex: 1;
      width: 50vw !important;
    }
  }
  .kitx-center {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>