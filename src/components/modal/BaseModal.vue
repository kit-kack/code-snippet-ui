<template>
  <n-modal
           show
           preset="card"
           :title="title"
           :closable="false"
           :mask-closable="false"
           @close="$emit('cancel')"
           :style="{
             width: wide? '80%':'60%'
           }">
    <slot></slot>
    <template #footer>
      <div style="width: 100%;position: relative">
        <n-space style="position: absolute; right: 3px">
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button :focusable="false" quaternary @click="$emit('cancel')">取消 (Q)</n-button>
            </template>
            {{CtrlStr+'+Q'}}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button :focusable="false" quaternary :color="$normal.theme.globalColor" @click="$emit('confirm')">确定 (S)</n-button>
            </template>
            {{CtrlStr+'+S'}}
          </n-tooltip>
        </n-space>
      </div>
      <br/>
    </template>
  </n-modal>
</template>

<script setup>
import {CtrlStr} from "../../js/some";
import {onMounted, onUnmounted} from "vue";
import { throttle } from "lodash-es"
import {$normal} from "../../js/store";

const props = defineProps({
  'wide': Boolean,
  'title': String
})
const emit = defineEmits(['update:show','cancel','confirm'])
const down = throttle(()=>{
  utools.simulateKeyboardTap('down')
},120);
const up = throttle(()=>{
  utools.simulateKeyboardTap('up')
},120)
const keyDownHandler = (e)=>{
  if(e.ctrlKey){
    if(e.code === 'KeyQ'){
      e.stopImmediatePropagation();
      emit('cancel')
    }else if(e.code === 'KeyS'){
      e.stopImmediatePropagation();
      emit('confirm')
    }else if(e.code === 'KeyJ'){
      down();
    }else if(e.code === 'KeyK'){
      up();
    }
  }else if($normal.funcs.vimSupport){
    if(e.code === 'KeyJ'){
      down();
    }else if(e.code === 'KeyK'){
      up();
    }
  }
}
onMounted(()=>{
  document.addEventListener('keydown',keyDownHandler)
})
onUnmounted(()=>{
  document.removeEventListener('keydown',keyDownHandler)
})
</script>



<style scoped>

</style>