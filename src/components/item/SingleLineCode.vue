<template>
  <n-ellipsis style="max-width: 98%" :tooltip="false" >
    <template v-if="configManager.get('rawLineCode')">
      <span  :style="getCodeStyle()">{{handleCode(code)}}</span>
    </template>
    <template v-else>
      <n-code :code="handleCode(code)" :language="type"   inline :style="getCodeStyle()" />
    </template>
  </n-ellipsis>
</template>

<script setup>

import {configManager} from "../../js/core";

const getCodeStyle = () =>{
  return {
    fontSize: '12px',
    color: utools.isDarkColors()? '#696666':'#a4a4a4',
    fontFamily: "'Consolas' !important"
  }
}
defineProps(['code','type'])
/**
 *
 * @param {string} code
 * @return {*}
 */
const  handleCode = (code)=>{
  return code.replaceAll("\n",'↩')
}
</script>

<style scoped>

</style>