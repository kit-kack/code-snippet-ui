<template>
  <template v-if="raw">
    <n-tooltip>
      <template #trigger>
        <n-tag closable id="tag" size="small" :color="colorStyle" @close="handleClose">{{props.content}}</n-tag>
      </template>
      {{tagColorManager.tags[props.content] === null? "清除标签":"清除颜色"}}
    </n-tooltip>

  </template>
  <template v-else>
    <n-popover trigger="click" raw :show-arrow="false" >
      <template #trigger>
        <n-tag id="tag"  :bordered="false" size="small" :color="colorStyle" > {{props.content}}</n-tag>
      </template>
      <color-picker :instance="instance" is-styled/>
    </n-popover>
  </template>
</template>

<script setup>

import {reactive} from "vue";
import Color from "../js/lib/color.js";
import {tagColorManager} from "../js/core.js";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps({
  "content": String,
  "raw":Boolean
})
let color = tagColorManager.get(props.content)
if(color[0]==='#'){
  color = Color.hexaToRbga(color)
}
const colorStyle = reactive({
  color: Color(color).lightenByRatio(1),
  textColor:color
})
/**
 *
 * @type {EmitFn<string[]>} to  refresh ListView or SideView
 */
const emit = defineEmits(['tagRefresh'])
const instance = {
  title: "更改颜色",
  color:colorStyle.textColor,
  handleUpdate: c=>{
    if(c == null){
      c = tagColorManager.get(props.content)
    }
    if(c[0]==='#'){
      c = Color.hexaToRbga(c)
    }
    colorStyle.color = Color(c).lightenByRatio(1);
    colorStyle.textColor = c;
  },
  handleConfirm: c=>{
    if(c[0]==='#'){
      c = Color.hexaToRbga(c)
    }
    tagColorManager.update(props.content,c)
    emit('tagRefresh')
  }
}
const handleClose = ()=>{
  tagColorManager.clear(props.content)
  emit('tagRefresh')
}

</script>

<style scoped>
#tag{
  height: 14px;
}
</style>