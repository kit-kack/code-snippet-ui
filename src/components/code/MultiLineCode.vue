<template>
  <n-scrollbar style="max-height: 88px" x-scrollable trigger="hover" class="item-code" ref="itemCodeScrollBar">
    <template v-if="configManager.get('rawLineCode')">
      <pre :style="getCodeStyle()">{{code}}</pre>
    </template>
    <template v-else-if="isSupportedLanguage(type??'plaintext')">
      <highlightjs :language="type??'plaintext'" :autodetect="false" :code="code" width="100%"/>
    </template>
    <template v-else>
      <highlightjs  autodetect :code="code" width="100%"/>
    </template>
  </n-scrollbar>
</template>

<script setup>

import {configManager} from "../../js/core";
import {isSupportedLanguage} from "../../js/some";
defineProps(['code','type'])
const getCodeStyle = () =>{
  return {
    fontSize: '12px',
    color: utools.isDarkColors()? '#696666':'#a4a4a4',
    fontFamily: "'Consolas' !important"
  }
}
</script>

<style>

</style>