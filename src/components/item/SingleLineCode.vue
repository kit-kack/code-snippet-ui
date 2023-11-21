<template>
  <n-ellipsis style="width: 100%" :tooltip="false" class="item-code" >
    <template v-if="configManager.get('strategy_item_code_raw')">
      <span  :style="getCodeStyle()">{{handleCode(code)}}</span>
    </template>
    <template v-else>
      <n-code :code="handleCode(code)" :language="pair.type"   inline :style="getCodeStyle()" />
    </template>
  </n-ellipsis>
</template>

<script setup>
import {configManager} from "../../js/core/config";
import {getRealTypeAndValidStatus} from "../../js/utils/language";

const props = defineProps(['code','type']);
const pair = getRealTypeAndValidStatus(props.type)
const getCodeStyle = () =>{
  return {
    fontSize: '12px',
    color: utools.isDarkColors()? '#696666':'#a4a4a4',
    fontFamily: "'Consolas' !important"
  }
}

/**
 *
 * @param {string} code
 * @return {*}
 */
const  handleCode = (code)=>{
  return code.slice(0,200).replaceAll("\n",'↩')
}
</script>

<style scoped>

</style>