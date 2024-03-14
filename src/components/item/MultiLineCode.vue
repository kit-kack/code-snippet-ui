<template>
  <n-scrollbar style="max-height: 180px" x-scrollable trigger="hover" class="item-code-scroller" ref="itemCodeScrollBar">
    <template v-if="pair.type === 'image'">
      <img loading="lazy" class="image-multi-render" :src="code" alt="图片加载失败了哦"/>
    </template>
    <template v-else-if="pair.type === 'svg'">
      <div v-if="isSvg(code)" class="image-render-svg" v-html="code"></div>
      <img v-else class="image-multi-render svg-as-image" :src="code" alt="图片加载失败了哦"/>
    </template>
    <template v-else-if="configManager.get('strategy_item_code_raw')">
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

import {configManager} from "../../js/utools/config";
import {$normal} from "../../js/store";
import {onMounted, onUpdated, ref} from "vue";
import {getRealTypeAndValidStatus} from "../../js/utils/language";
import {isSvg} from "../../js/utils/common";


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
.image-multi-render{
  max-width: 100%;
  color: #ff4d4f;
}
.svg-as-image{
  width: 200px;
  height: 200px;
}
</style>