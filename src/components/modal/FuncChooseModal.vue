<template>
  <div class="func" v-for="(func,key) in formatManager.funcMap">
    <h4>⚡{{func.name}}</h4>
    <n-scrollbar style="max-height:50px;margin-bottom: 5px" x-scrollable>
      <p v-html="func.desc?.replaceAll('\n','<br/>')??'暂无描述'"></p>
    </n-scrollbar>

    <n-scrollbar style="max-width: 420px;padding-bottom: 10px;"     x-scrollable>
      <n-space :wrap="false">
        <n-button tertiary size="tiny" v-for="command in func.commands" @click="$emit('choose',command)" >
          {{command}}
        </n-button>
      </n-space>
    </n-scrollbar>
  </div>

</template>

<script setup>

import {formatManager} from "../../js/core/func";

defineEmits(['choose'])
</script>


<style lang="scss" scoped>
.func{
  border-bottom: 1px solid #777;
  margin-bottom: 10px;

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