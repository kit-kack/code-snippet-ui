<template>
  <template v-for="(func,key) in formatManager.funcMap">
    <div class="func">
    <n-popover
        width="trigger"
        :show-arrow="false"
        display-directive="show"
    >
      <template #trigger>
          <h4>⚡{{func.name}}</h4>
      </template>
        <n-scrollbar style="max-height:100px;margin-bottom: 5px;padding-right: 10px" x-scrollable>
          <p class="func-desc" v-html="func.desc?.replaceAll('\n','<br/>')??'暂无描述'"></p>
        </n-scrollbar>
    </n-popover>
      <n-space>
        <n-button tertiary size="tiny" v-for="command in func.commands"
                  @click="$emit('choose',command)" >
          {{command}}
        </n-button>
      </n-space>
    </div>
  </template>

</template>

<script setup>

import {formatManager} from "../../js/core/func";

defineEmits(['choose'])
</script>


<style lang="scss" scoped>
.func{
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #777;
  &:last-child{
    border-bottom: none;
  }
}

.n-list-item{
  min-height: 90px;
  max-height: 150px;
  padding: 0 5px;
  width: 428px;
}
p{
  font-size: 11px;
}
</style>