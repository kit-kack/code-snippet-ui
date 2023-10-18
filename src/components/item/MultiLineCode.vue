<template>
  <n-scrollbar style="max-height: 180px" x-scrollable trigger="hover" class="item-code" ref="itemCodeScrollBar">
    <template v-if="configManager.get('rawLineCode')">
      <pre :style="getCodeStyle()">{{code}}</pre>
    </template>
    <template v-else-if="pair.valid">
      <highlightjs :language="pair.type" :autodetect="false" :code="code" width="100%"/>
    </template>
    <template v-else>
      <highlightjs  autodetect :code="code" width="100%"/>
    </template>
  </n-scrollbar>
</template>

<script setup>

import {configManager} from "../../js/core/config";
import {$normal} from "../../js/store";
import {onMounted, onUpdated, ref} from "vue";
import {getRealTypeAndValidStatus} from "../../js/utils/language";


const props = defineProps(['code','type','active']);
const pair = getRealTypeAndValidStatus(props.type)
const itemCodeScrollBar = ref();
const getCodeStyle = () =>{
  return {
    fontSize: '12px',
    color: utools.isDarkColors()? '#696666':'#a4a4a4',
    fontFamily: "'Consolas' !important"
  }
}
onUpdated(()=>{
  if(props.active){
    $normal.scroll.itemCodeInvoker = itemCodeScrollBar.value;
  }
})
onMounted(()=>{
  if(props.active){
    $normal.scroll.itemCodeInvoker = itemCodeScrollBar.value;
  }
})
</script>

<style>

</style>