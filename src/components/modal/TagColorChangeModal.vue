<template>
  <base-modal title="修改标签配色" @cancel="operate(false)" @confirm="operate(true)">
    <n-tag class="tag" :style="{
      background: instance.background,
      color: instance.color
    }"   :bordered="false" size="small"  > {{$reactive.main.tagName}}
    </n-tag>
    <h5 @click="instance.picker = !instance.picker">背景色(点击切换)</h5>
    <template v-if="instance.picker">
      <n-color-picker
          style="width: 50%"
          :modes="['hex','rgb','hsl']"
          :show-alpha="false"
          placement="right"
          v-model:value="instance.background">
      </n-color-picker>
    </template>
    <template v-else>
      <n-input v-model:value="instance.background" placeholder="对应CSS background属性"/>
    </template>
    <h5>字体色</h5>
    <n-color-picker
        style="width: 50%"
        :modes="['hex','rgb','hsl']"
        placement="right"
        :show-alpha="false"
        v-model:value="instance.color">
    </n-color-picker>

    <h5>预设</h5>
    <n-space>
      <div class="circle" v-for="(o,index) in DEFAULT_INSTANCE" @click="changePreset(index)" :style="{
      background: o.background,
      color: o.color
    }">{{index}}</div>
    </n-space>
  </base-modal>
</template>

<script setup>
import BaseModal from "./BaseModal.vue";
import {$reactive, handleRecoverLiteShow, refreshSearchResult} from "../../js/store";
import {tagColorManager} from "../../js/core/tag";
import {ref} from "vue";

const instance = ref({
  ...tagColorManager.get($reactive.main.tagName),
  picker: true
})
const DEFAULT_INSTANCE = [{
  background: '#84ecb4',
  color: '#18a057',
},{
  background: '#daebfc',
  color: '#4090e1',
},{
  background: '#e4d4f8',
  color: '#6a1fc7',
},{
  background: '#fbd9eb',
  color: '#d41678',
},{
  background: '#fcedd0',
  color: '#d9950d',
},{
  background: 'linear-gradient(135deg,#90f7ec,#32ccbc)',
  color: '#FFFFFF',
},{
  background: 'linear-gradient(154deg,#43c6ac,#f8ffae)',
  color: '#FFFFFF',
},{
  background: 'linear-gradient(135deg,#c9ffbf,#ffafbd)',
  color: '#FFFFFF',
},{
  background: 'linear-gradient(135deg,#c6ffdd,#fbd786,#f7797d)',
  color: '#FFFFFF',
},{
  background: 'linear-gradient(89deg,#acb6e5,#86fde8)',
  color: '#FFFFFF',
},{
  background: 'linear-gradient(188deg,#70e1f5,#ffd194)',
  color: '#FFFFFF',
}]
function changePreset(index){
  instance.value.background = DEFAULT_INSTANCE[index].background
  instance.value.color = DEFAULT_INSTANCE[index].color
}
function operate(confirm){
  if(confirm){
    tagColorManager.update($reactive.main.tagName,{
      background:  instance.value.background,
      color:  instance.value.color
    })
    refreshSearchResult()
  }
  handleRecoverLiteShow();
  $reactive.main.tagColorActive = false
}
</script>

<style scoped>
h5{
  margin-top: 10px;
  margin-bottom: 5px;
}
.tag{
  transition: all .3s;
}
.circle{
  width: 24px;
  height: 24px;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  user-select: none;
  transition: all .3s;
}
.circle:hover{
  border-radius: 5px;
}
</style>