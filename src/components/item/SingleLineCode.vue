<template>
  <n-ellipsis style="width: 100%" :tooltip="false" class="item-code-scroller" >
    <n-code :code="handleCode(code)" :language="pair.type"   inline  class="item-code"/>
  </n-ellipsis>
</template>

<script setup>
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
  if(code){
    return code.slice(0,200).replaceAll("\n",'↩\n')
  }
  return ''

}
onUpdated(()=>{
  pair.value = getRealTypeAndValidStatus(props.type)
})
</script>

<style scoped>

</style>