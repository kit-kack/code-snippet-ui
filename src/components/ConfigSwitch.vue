<template>
  <n-space >
    {{ title }}
    <template v-if="props.icon">
      <n-switch @update:value="handleValue" :default-value="configManager.get(config)">
        <template #icon>
          {{icon}}
        </template>
      </n-switch>
    </template>
    <template v-else>
      <n-switch @update:value="handleValue" :default-value="configManager.get(config)"/>
    </template>
  </n-space>
</template>

<script setup>
import {configManager} from "../js/core/config";

const props = defineProps(['config','title','icon'])
const emit = defineEmits(['refresh'])

const handleValue = value=>{
  configManager.set(props.config,value)
  emit('refresh')
}

</script>

<style scoped>

</style>