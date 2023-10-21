<template>
  <n-modal :show="show"
           preset="card"
           :title="title"
           :mask-closable="false" :auto-focus="false"
           @close="$emit('cancel')"
           :style="{
             width: wide? '80%':'60%'
           }">
    <slot></slot>
    <template #footer>
      <div style="width: 100%;position: relative">
        <n-space style="position: absolute; right: 3px">
        <template v-if="raw">
          <n-button quaternary @click="$emit('cancel')">取消</n-button>
          <n-button quaternary type="success" @click="$emit('confirm')">确定</n-button>
        </template>
        <template v-else>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary @click="$emit('cancel')">取消 (Q)</n-button>
            </template>
            {{CtrlStr+'+Q'}}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary type="success" @click="$emit('confirm')">确定 (S)</n-button>
            </template>
            {{CtrlStr+'+S'}}
          </n-tooltip>
        </template>
        </n-space>
      </div>
      <br/>
    </template>
  </n-modal>
</template>

<script setup>
import {CtrlStr} from "../../js/some";
import {onMounted, onUnmounted} from "vue";

const props = defineProps({
  'show': Boolean,
  'raw': Boolean,
  'wide': Boolean,
  'title': String
})
const emit = defineEmits(['update:show','cancel','confirm'])

if(!props.raw){
  const keyDownHandler = (e)=>{
    if(e.ctrlKey){
      if(e.code === 'KeyQ'){
        emit('cancel')
      }else if(e.code === 'KeyS'){
        emit('confirm')
        e.preventDefault();
      }
    }
  }
  onMounted(()=>{
    document.addEventListener('keydown',keyDownHandler)
  })
  onUnmounted(()=>{
    document.removeEventListener('keydown',keyDownHandler)
  })
}
</script>



<style scoped>

</style>