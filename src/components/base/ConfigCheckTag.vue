<template>
  <template v-if="props.icon">
    <n-tag size="small" checkable v-model:checked="checked" @update-checked="updateConfigValue" >{{title}}
      <template #icon>{{icon}}</template>
    </n-tag>
  </template>
  <template v-else>
    <n-tag size="small" checkable v-model:checked="checked" @update-checked="updateConfigValue" >{{title}}</n-tag>
  </template>
</template>

<script setup>
import {configManager} from "../../js/core/config";
import {ref} from "vue";

const props = defineProps(['title','config','icon'])
const emit = defineEmits(['refresh'])
/**
 * @type {Ref<boolean>}
 */
const checked = ref(configManager.get(props.config))

/**
 * 更新插件配置值
 */
function updateConfigValue(value){
  checked.value = value;
  configManager.set(props.config,value)
  emit('refresh')
}
</script>

<style scoped>

</style>