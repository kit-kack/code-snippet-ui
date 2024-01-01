<template>
  <n-ellipsis style="width: 100%" :tooltip="false" class="item-code-scroller" >
    <template v-if="configManager.get('strategy_item_code_raw')">
      <span class="item-code" >{{handleCode(code)}}</span>
    </template>
    <template v-else>
      <n-code :code="handleCode(code)" :language="pair.type"   inline  class="item-code"/>
    </template>
  </n-ellipsis>
</template>

<script setup>
import {configManager} from "../../js/core/config";
import {getRealTypeAndValidStatus} from "../../js/utils/language";
import {onUpdated, ref} from "vue";

const props = defineProps(['code','type']);
const pair = ref(getRealTypeAndValidStatus(props.type))
/**
 *
 * @param {string} code
 * @return {*}
 */
function handleCode(code){
  return code.slice(0,200).replaceAll("\n",'↩')
}
onUpdated(()=>{
  pair.value = getRealTypeAndValidStatus(props.type)
})
</script>

<style scoped>

</style>