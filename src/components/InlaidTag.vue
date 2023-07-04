<template>
  <n-space :wrap="false" size="small" >
    <template v-if="configManager.get('showTagIcon')">
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showOriginTag') && origin!=='normal'" >
        {{origin}}
        <template #avatar>
          {{origin==='network'? '🌐':'⭐'}}
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showLanguageTag')" >
        {{type}}
        <template #avatar>
          🚀
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showCountTag')">
        {{count??0}}
        <template #avatar>
          🎲
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showTimeTag')">
        {{calculateTime(time)}}
        <template #avatar>
          ⏰
        </template>
      </n-tag>
    </template>
    <template v-else>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showOriginTag') && origin!=='normal'" >
        {{origin}}
        <template #avatar>
          <span class="circle blue" ></span>
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showLanguageTag')" >
        {{type}}
        <template #avatar>
          <span class="circle" :class="{
            blue: origin === 'network',
            cran: origin === 'local'
          }" ></span>
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showCountTag')">
        {{count??0}}
        <template #avatar>
          <span class="circle yellow"></span>
        </template>
      </n-tag>
      <n-tag size="small" round :bordered="false" v-if="configManager.get('showTimeTag')">
        {{calculateTime(time)}}
        <template #avatar>
          <span class="circle red"></span>
        </template>
      </n-tag>
    </template>
  </n-space>
</template>
<script setup>

import {configManager} from "../js/core.js";
import {calculateTime} from "../js/some";

defineProps(["type","count","time","origin"])




</script>

<style scoped>
.n-tag{
  height: 17px;
  //background-color: rgba(128,128,128,.1);
  background-color: transparent;
  color: #aaa;
}
.circle {
  display: block;
  width: 8px;
  height: 8px;
  background-color: #31c648;
  border-radius: 50%;
  margin-left: 0px;
  margin-right: 0px;
}
.red{

  background-color: #fc6057;
}
.yellow{
  background-color: #feba1b;
}
.blue{
  background-color: #3087de;
}
.cran{
  background-color: #22b8cf;
}
</style>