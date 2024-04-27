<template>
  <template v-if="type === 'raw'">
    <n-tag size="small" class="tag raw" :round="isSpecial"  :style="colorStyle" >{{props.content}}</n-tag>
  </template>
  <template v-else-if="type === 'closable'">
    <n-tag closable size="small" :round="isSpecial" :style="colorStyle" >{{props.content}}</n-tag>
  </template>
  <template v-else-if="type === 'clear'">
    <n-tag closable class="tag" size="small" :style="colorStyle"  @close="handleClose">{{props.content}}</n-tag>
  </template>
  <template v-else>
    <n-tag
        @click="handleTagClick"
        :round="isSpecial"
        :bordered="isSpecial"
        :style="colorStyle"  class="tag"  size="small" > {{props.content}}
    </n-tag>
  </template>
</template>

<script setup>

import {computed, h} from "vue";
import {tagColorManager} from "../../js/utools/tag";
import {$reactive, switchToFullUIMode} from "../../js/store";
import NormalTag from "./NormalTag.vue";

const props = defineProps({
  "content": String,
  "type": String,
  "isSpecial": Boolean,
  "defaultTheme": Boolean
})
const colorStyle = computed(()=>{
  return tagColorManager.get(props.content,props.defaultTheme);
})

/**
 *
 * @type {EmitFn<string[]>} to  refresh ListView or SideView
 */
const emit = defineEmits(['tagRefresh'])
function handleClose(){
  $kit_error_dialog({
    title: '删除标签',
    content: ()=> h(
        'div',
        [
          '删除标签 ',
          h(NormalTag,
              {
                content: props.content,
                type: 'raw'
              },null),
          ' 吗？',
        ]
    ),
    callback: ()=>{
      tagColorManager.clear(props.content)
      emit('tagRefresh')
    }
  })
}
function handleTagClick(){
  $reactive.main.tagName = props.content;
  switchToFullUIMode();
  $reactive.main.tagColorActive = true;
}

</script>

<style scoped>
.tag{
  height: 14px;
  line-height: 1;
  padding: 2px 5px;
}
.special{
  margin-top: 6px;
}
.tag.raw{
  transition: all .5s;
}
.tag.raw:hover{
  border-radius: 10px;
  box-shadow: #ccc 0 0 2px;
}
</style>