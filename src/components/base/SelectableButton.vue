<template>
  <n-tooltip trigger="manual"
             :show="hover || (selected && show)"
             :placement="$reactive.view.onlyOne&&!$reactive.view.fullScreenShow?(flag? 'right':'left'):'top'"
             :delay="0"
  >
    <template #trigger>
      <n-button  circle
                 @click="$emit('invoke')"
                 :type="type"
                 quaternary
                 :secondary="selected"
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
import {$normal, $reactive} from "../../js/store";

const props = defineProps({
  // 提示信息
  tip: String,
  // 颜色主题选择
  type:String,
  color: String,
  // vim索引位
  index: Number,
  // 按钮中心位置：lite show 只有一条记录时 鼠标划过 场景优化
  mid: Number,
  // 禁用
  disabled: Boolean
})
const show = ref()
const emit = defineEmits(['invoke'])
const hover = ref(false)
const flag = ref(false)
// 是否被vim选中
const selected = computed(()=>{
  if($reactive.utools.subItemSelectedIndex === props.index){
    // 当前索引
    if($reactive.view.onlyOne &&  !$reactive.view.fullScreenShow){
      // 在liteshow下只有一条记录时，被选中短暂显示tooltip
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


onMounted(()=>{
  // 保存行为
  $normal.scroll.spaceInvoker[props.index] = ()=> {
    if(!props.disabled){
      emit('invoke')
    }else{
      $message.warning("当前功能被禁用")
    }
  }
})

const handleMouseEnter = (e)=>{
  hover.value = true;
  flag.value = e.clientX > props.mid;
}
</script>

<style scoped>
</style>