<template>
  <n-tooltip trigger="manual"
             :show="hover || (selected && show)"
             :placement="$reactive.others.onlyOne&&!$reactive.view.fullScreenShow?(flag? 'right':'left'):'top'"
             :delay="0"
  >
    <template #trigger>
      <n-button  circle
                 @click="operate()"
                 :type="type"
                 :="getStyle(selected)"
                 :color="color"
                 @mouseenter="handleMouseEnter"
                 @mouseleave="hover = false"
                :disabled="disabled"
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
import {configManager} from "../js/core.js";
import {$normal, $reactive} from "../js/store";

const props = defineProps({
  "tip": String,
  "type":String,
  "index": Number,
  "color": String,
  "right": Boolean,
  "mid": Number,
  "lite": Boolean,   // 支持Lite Show
  "disabled": Boolean
})
const show = ref()
const emit = defineEmits(['invoke'])
const hover = ref(false)
const flag = ref(false)
const selected = computed(()=>{
  if($reactive.utools.subItemSelectedIndex === props.index){
    if($reactive.others.onlyOne &&  !$reactive.view.fullScreenShow){
      show.value = true;
      setTimeout(()=>{
        show.value = false
      },800)
    }else{
      show.value = true;
    }
    return true;
  }
  return false;
})

const operate = ()=>{
  if(!(props.lite || $reactive.view.fullScreenShow)){
    $reactive.view.fullScreenShow = true;
    $normal.recoverLiteShow = true;
    utools.setExpendHeight(545)
  }
  emit('invoke')
}

onMounted(()=>{
  $normal.scroll.spaceInvoker[props.index] = ()=> {
    if(!props.disabled){
      operate()
    }
  }
})


const getStyle =(flag) =>{
  if(flag){
    return {
      secondary:true,
      color: configManager.getGlobalColor()
    }
  }
  return {
    quaternary:true
  }
}
const handleMouseEnter = (e)=>{
  hover.value = true;
  flag.value = e.clientX > props.mid;
}
</script>

<style scoped>
</style>