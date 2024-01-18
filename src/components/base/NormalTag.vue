<template>
  <template v-if="type === 'raw'">
    <n-tag size="small" class="tag" :round="isSpecial"  :style="colorStyle" >{{props.content}}</n-tag>
  </template>
  <template v-else-if="type === 'closable'">
    <n-tag closable size="small" :round="isSpecial" :style="colorStyle" >{{props.content}}</n-tag>
  </template>
  <template v-else-if="type === 'clear'">
    <n-tooltip>
      <template #trigger>
        <n-tag closable class="tag" size="small" :style="colorStyle"  @close="handleClose">{{props.content}}</n-tag>
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
    <n-tag
        @click="handleTagClick"
        :round="isSpecial"
        :bordered="isSpecial"
        :style="colorStyle"  class="tag"  size="small" > {{props.content}}
    </n-tag>
  </template>
</template>

<script setup>

import {computed} from "vue";
import {tagColorManager} from "../../js/core/tag";
import {$reactive, switchToFullUIMode} from "../../js/store";

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
  tagColorManager.clear(props.content)
  emit('tagRefresh')
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
</style>