<template>
  <n-popover width="40.5vw"  placement="top-start" arrow-point-to-center
             @update:show="v => show = v"
  >
    <template #trigger>
      <span class="config-tooltip-switch">
        {{ title }}
        <n-icon :class="{
          'global-color': show
        }">
          <SvgTip/>
        </n-icon>
        <n-switch style="float: right;" @update:value="updateConfigValue" :default-value="configManager.get(config)"/>
      </span>
    </template>
    <slot></slot>
  </n-popover>
</template>

<script setup>
import {configManager} from "../../js/utools/config";
import SvgTip from "../../asserts/tip.svg"
import {ref} from "vue";

const props = defineProps(['config','title'])
const emit = defineEmits(['refresh'])
const show = ref(false)
/**
 * 更新插件配置值
 */
function updateConfigValue(value){
  configManager.set(props.config,value)
  emit('refresh')
}


</script>

<style lang="scss" scoped>
.config-tooltip-switch{
  > .n-icon{
    vertical-align: top;
  }
  > :not(.n-icon){
    vertical-align: bottom;
  }

}
</style>