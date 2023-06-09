<template>
  <n-tooltip trigger="manual"
             :show="hover || (selected && show)"
              :keep-alive-on-hover="false"
             content-style="{point-event:none;"
             :placement="$var.others.onlyOne&&!$var.view.fullScreenShow?(flag? 'right':'left'):'top'"
  >
    <template #trigger>
      <n-button  circle
                 @click="operate()"
                 :type="type"
                 :="getStyle(selected)"
                 :color="color"
                 @mouseenter="handleMouseEnter"
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
import {configManager} from "../js/core.js";
import {$var} from "../js/store";

const props = defineProps({
  "tip": String,
  "type":String,
  "index": Number,
  "color": String,
  "right": Boolean,
  "mid": Number,
  "lite": Boolean   // 支持Lite Show
})
const show = ref()
const emit = defineEmits(['invoke'])
const hover = ref(false)
const flag = ref(false)
const selected = computed(()=>{
  if($var.utools.subItemSelectedIndex === props.index){
    if($var.others.onlyOne &&  !$var.view.fullScreenShow){
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
  if(!(props.lite || $var.view.fullScreenShow)){
    $var.view.fullScreenShow = true;
    $var.view.recoverLiteShow = true;
    utools.setExpendHeight(545)
  }
  emit('invoke')
}

onMounted(()=>{
  $var.scroll.spaceInvoker[props.index] = ()=> {
    operate()
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