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
      <template v-if="tagColorManager.tags[props.content] === null">
        <span style="color: indianred">清除标签</span>
      </template>
      <template v-else>
        清除颜色
      </template>
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

import {ref} from "vue";
import Color from "../../js/lib/color.js";
import {tagColorManager} from "../../js/core/tag";
import ColorPicker from "./ColorPicker.vue";
import {$normal} from "../../js/store";

const props = defineProps({
  "content": String,
  "type": String,
  "followTheme": Boolean
})
const colorStyle = ref(getColorStyle(props.followTheme? $normal.theme.tagColor :  tagColorManager.get(props.content)))
function getColorStyle(color){
  if(color[0]==='#'){
    color = Color.hexaToRbga(color)
  }
  return {
    color: Color(color).lightenByRatio(1),
    textColor:color
  };
}
/**
 *
 * @type {EmitFn<string[]>} to  refresh ListView or SideView
 */
const emit = defineEmits(['tagRefresh'])
const instance = {
  title: "更改颜色",
  color:colorStyle.value.textColor,
  handleUpdate: c=>{
    if(c == null){
      c = tagColorManager.get(props.content)
    }
    colorStyle.value = getColorStyle(c)
  },
  handleConfirm: c=>{
    if(c[0]==='#'){
      c = Color.hexaToRbga(c)
    }
    tagColorManager.update(props.content,c)
    emit('tagRefresh')
  }
}
function handleClose(){
  tagColorManager.clear(props.content)
  emit('tagRefresh')
}

</script>

<style scoped>
.tag{
  height: 14px;
}
</style>