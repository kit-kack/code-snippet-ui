<template>
  <base-snippet-item :snippet="props.snippet">
    <template #header-desc="{pair,snippet}">
      <span v-html="(snippet.matchType === 1 && snippet.temp)? snippet.temp : snippet.desc"></span>
    </template>
    <template #content="{snippet,pair}">
      <div  style="border-top: 1px var(--item-code-scroller-border-color) dashed">
      </div>
      <template v-if="entity.isSpecial">
        <special-type-item :entity="entity" />
      </template>
      <n-ellipsis v-else style="width: 100%" :tooltip="false" class="item-code-scroller" >
        <n-code :code="handleCode(entity.code)" :language="entity.renderType"   inline  class="item-code"/>
      </n-ellipsis>
    </template>
    <template #footer-desc="{pair}">
      {{pair.sideInfo}}
    </template>
  </base-snippet-item>
</template>

<script setup>

import BaseSnippetItem from "./BaseSnippetItem.vue";
import {computed} from "vue";
import {getRenderTypeAndCode} from "./snippet-item";
import SvgDirectory from "../../asserts/directory.svg"
import SpecialTypeItem from "../base/SpecialTypeItem.vue";

const props = defineProps(['snippet'])
const entity = computed(()=>{
  return getRenderTypeAndCode(props.snippet);
})
/**
 *
 * @param {string} code
 * @return {*}
 */
function handleCode(code){
  if(code){
    return code.slice(0,200).replaceAll("\n",'↩\n')
  }
  return ''

}
</script>

<style scoped>

</style>