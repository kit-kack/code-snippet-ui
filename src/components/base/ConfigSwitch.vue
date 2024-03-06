<template>
  <n-space >
    {{ title }}
    <template v-if="props.icon">
      <n-switch @update:value="updateConfigValue" :default-value="configManager.get(config)">
        <template #icon>
          {{icon}}
        </template>
      </n-switch>
    </template>
    <template v-else>
      <n-switch @update:value="updateConfigValue" :default-value="configManager.get(config)"/>
    </template>
  </n-space>
</template>

<script setup>
import {configManager} from "../../js/utools/config";

const props = defineProps(['config','title','icon'])
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