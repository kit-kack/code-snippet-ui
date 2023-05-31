<template>
  <n-space :wrap="false">
    <template v-if="configManager.get('showTagIcon')">
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showLanguageTag')" >
        {{props.type}}
        <template #avatar>
          🚀
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showCountTag')">
        {{props.count??0}}
        <template #avatar>
          🎲
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showTimeTag')">
        {{calculateTime(props.time)}}
        <template #avatar>
          ⏰
        </template>
      </n-tag>
    </template>
    <template v-else>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showLanguageTag')" >
        {{props.type}}
        <template #avatar>
          <span class="circle" ></span>
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showCountTag')">
        {{props.count??0}}
        <template #avatar>
          <span class="circle yellow"></span>
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showTimeTag')">
        {{calculateTime(props.time)}}
        <template #avatar>
          <span class="circle green"></span>
        </template>
      </n-tag>
    </template>
  </n-space>
</template>
<script setup>

import {configManager} from "../js/core.js";
import {calculateTime} from "../js/utils/variable.js";

const props = defineProps(["type","count","time"])




</script>

<style scoped>
.n-tag{
  height: 17px;
}
.circle {
  display: block;
  width: 8px;
  height: 8px;
  background-color: #fc6057;
  border-radius: 50%;
  margin-left: 2px;
  margin-right: 5.5px;
}
.green{
  background-color: #31c648;
}
.yellow{
  background-color: #feba1b;
}


</style>