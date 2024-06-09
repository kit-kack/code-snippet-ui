<template>
  <span>
    {{ title }}
    <n-switch style="float: right;" @update:value="updateConfigValue" :default-value="configManager.get(config)"/>
  </span>
</template>

<script setup>
import {configManager} from "../../js/utools/config";

const props = defineProps(['config','title'])
const emit = defineEmits(['refresh'])

/**
 * 更新插件配置值
 */
function updateConfigValue(value){
  configManager.set(props.config,value)
  emit('refresh')
}

</script>

<style scoped>

</style>