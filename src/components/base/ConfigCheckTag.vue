<template>
  <n-tag size="small" checkable v-model:checked="checked" @update-checked="updateConfigValue" >{{title}}</n-tag>
</template>

<script setup>
import {configManager} from "../../js/core/config";
import {ref} from "vue";

/**
 * @typedef {Object} Props
 * @property {string} title 标题
 * @property {ConfigItem} config 配置项
 */
const props = defineProps(['title','config'])
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