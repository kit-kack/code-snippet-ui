<template>
  <n-scrollbar style="max-height: 180px" x-scrollable trigger="hover" class="item-code-scroller" ref="itemCodeScrollBar">
    <template v-if="configManager.get('strategy_item_code_raw')">
      <pre class="item-code">{{code}}</pre>
    </template>
    <template v-else-if="pair.valid">
      <highlightjs :language="pair.type" :autodetect="false" :code="code" width="100%" class="item-code"/>
    </template>
    <template v-else>
      <highlightjs  autodetect :code="code" width="100%" class="item-code"/>
    </template>
  </n-scrollbar>
</template>

<script setup>

import {configManager} from "../../js/core/config";
import {$normal} from "../../js/store";
import {onMounted, onUpdated, ref} from "vue";
import {getRealTypeAndValidStatus} from "../../js/utils/language";


const props = defineProps(['code','type','active']);
const pair = ref(getRealTypeAndValidStatus(props.type))
const itemCodeScrollBar = ref();
onUpdated(()=>{
  pair.value = getRealTypeAndValidStatus(props.type)
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