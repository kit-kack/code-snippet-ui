<template>
  <n-ellipsis style="max-width: 98%" :tooltip="false" >
    <template v-if="configManager.get('rawLineCode')">
      <span  :style="getCodeStyle()">{{handleCode(code)}}</span>
    </template>
    <template v-else>
      <n-code :code="handleCode(code)" :language="pair.type"   inline :style="getCodeStyle()" />
    </template>
  </n-ellipsis>
</template>

<script setup>
import {configManager} from "../../js/core";
import {getRealTypeAndValidStatus} from "../../js/utils/common";

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