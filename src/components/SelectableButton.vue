<template>
  <n-tooltip trigger="manual" :show="selected || hover" >
    <template #trigger>
      <n-button  circle
                 @click="emit('invoke')"
                 :type="type"
                 :="getStyle(selected)"
                 :color="color"
                 @mouseenter="hover = true"
                 @mouseleave="hover = false"

      >
        <template #icon>
          <slot></slot>
        </template>
      </n-button>
    </template>
    {{tip}}{{selected?"（按下空格执行）":''}}
  </n-tooltip>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {spaceInvokers, subItemSelectIndex} from "../js/utils/variable.js";
import {configManager} from "../js/core.js";
const props = defineProps({
  "tip": String,
  "type":String,
  "index": Number,
  "color": String
})
const emit = defineEmits(['invoke'])
const hover = ref(false)
const selected = computed(()=>subItemSelectIndex.value === props.index)

onMounted(()=>{
  spaceInvokers.value[props.index] = ()=> emit('invoke')
})

const getStyle =(flag) =>{
  if(flag){
    return {
      secondary:true,
      color: configManager.getGlobalColor()
    }
  }
  return {
    tertiary:true
  }
}
</script>

<style scoped>

</style>