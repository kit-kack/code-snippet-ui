<template>
  <template v-if="type === 'raw'">
    <n-tag size="small" class="tag" :color="colorStyle" >{{props.content}}</n-tag>
  </template>
  <template v-else-if="type === 'closable'">
    <n-tag closable size="small" :color="colorStyle">{{props.content}}</n-tag>
  </template>
  <template v-else-if="type === 'clear'">
    <n-tooltip>
      <template #trigger>
        <n-tag closable class="tag" size="small" :color="colorStyle" @close="handleClose">{{props.content}}</n-tag>
      </template>
      {{tagColorManager.tags[props.content] === null? "清除标签":"清除颜色"}}
    </n-tooltip>
  </template>
  <template v-else>
    <n-popover trigger="click" raw :show-arrow="false" >
      <template #trigger>
        <n-tag class="tag"  :bordered="false" size="small" :color="colorStyle" > {{props.content}}</n-tag>
      </template>
      <color-picker :instance="instance" is-styled/>
    </n-popover>
  </template>
</template>

<script setup>

import {reactive} from "vue";
import Color from "../js/lib/color.js";
import {tagColorManager} from "../js/core/tag";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps({
  "content": String,
  "type": String
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
.tag{
  height: 14px;
}
</style>