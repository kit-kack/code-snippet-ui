<template>
  <template v-if="props.icon">
    <n-tag size="small" checkable v-model:checked="checked" @update-checked="handleValue" >{{title}}
      <template #icon>{{icon}}</template>
    </n-tag>
  </template>
  <template v-else>
    <n-tag size="small" checkable v-model:checked="checked" @update-checked="handleValue" >{{title}}</n-tag>
  </template>
</template>

<script setup>
import {configManager} from "../js/core";
import {ref} from "vue";

const props = defineProps(['title','config','icon'])
const emit = defineEmits(['refresh'])
const checked = ref(configManager.get(props.config))
const handleValue = value=>{
  checked.value = value;
  configManager.set(props.config,value)
  emit('refresh')
}
</script>

<style scoped>

</style>