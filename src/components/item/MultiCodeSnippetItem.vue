<template>
  <base-snippet-item :snippet="props.snippet" :selected="props.selected">
    <template #header-desc="{pair,snippet}">
      <span v-html="(snippet.matchType === 1 && snippet.temp)? snippet.temp : snippet.desc"></span>
    </template>
    <template #content="{snippet,pair,index}">
      <div  style="border-top: 1px var(--item-code-scroller-border-color) dashed">
      </div>
      <n-scrollbar style="max-height: 180px" x-scrollable trigger="hover" class="item-code-scroller" ref="itemCodeScrollBar">
        <template v-if="snippet.imgId">
          <utools-image :id="snippet.imgId" class="image-multi-render"/>
        </template>
        <template v-else-if="entity.renderType === 'image'">
          <img loading="lazy" class="image-multi-render"  :src="entity.code" alt="图片加载失败了哦"/>
        </template>
        <template v-else-if="entity.renderType === 'svg'">
          <div v-if="isSvg(entity.code)" class="image-render-svg" v-html="entity.code"></div>
          <img v-else class="image-multi-render svg-as-image" :src="entity.code" alt="图片加载失败了哦"/>
        </template>
        <template v-else-if="entity.isSpecial">
          <special-type-item :entity="entity" />
        </template>
        <template v-else-if="getRealTypeAndValidStatus(entity.renderType).valid">
          <highlightjs :language="getRealTypeAndValidStatus(entity.renderType).type" :autodetect="false" :code="entity.code" width="100%" class="item-code"/>
        </template>
        <template v-else>
          <highlightjs  autodetect :code="entity.code" width="100%" class="item-code"/>
        </template>
      </n-scrollbar>
    </template>
    <template #footer-desc="{pair}">
      {{pair.sideInfo}}
    </template>
  </base-snippet-item>
</template>

<script setup>

import BaseSnippetItem from "./BaseSnippetItem.vue";
import {$normal} from "../../js/store";
import {isSvg} from "../../js/utils/common";
import UtoolsImage from "../base/UtoolsImage.vue";
import {getRealTypeAndValidStatus} from "../../js/utils/language";
import {computed, onMounted, onUpdated, ref} from "vue";
import {getRenderTypeAndCode} from "./snippet-item";
import SpecialTypeItem from "../base/SpecialTypeItem.vue";

const props = defineProps(['snippet','selected'])
const itemCodeScrollBar = ref();
const entity = computed(()=>{
  return getRenderTypeAndCode(props.snippet,true);
})

onUpdated(()=>{
  if(props.selected){
    $normal.scroll.itemCodeInvoker = itemCodeScrollBar.value;
  }
})
onMounted(()=>{
  if(props.selected){
    $normal.scroll.itemCodeInvoker = itemCodeScrollBar.value;
  }
})
</script>

<style scoped>
.image-multi-render{
  max-width: 100%;
  color: #ff4d4f;
}
.svg-as-image{
  width: 200px;
  height: 200px;
}
</style>