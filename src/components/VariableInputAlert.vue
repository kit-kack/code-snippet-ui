<template>
  <n-modal v-model:show="$var.view.variableActive"
           preset="card"
           title="输入变量"
           style="width: 60%"
           :mask-closable="false"
           :auto-focus="false"

  >
    <n-scrollbar style="max-height: 60vh">
      <div style="padding-right: 6px">
        <template v-for="(template,index) in templates">
          <p style="font-size: 12px;margin: 5px">{{template.label}}</p>
          <n-input v-model:value="template.value" clearable placeholder="替换值" :autofocus="index === 0"/>
        </template>
      </div>
    </n-scrollbar>
    <template #footer>
      <div style="width: 100%;position: relative">
        <n-space style="position: absolute; right: 3px">
          <n-button quaternary @click="doCancel()">取消</n-button>
          <n-button quaternary type="success" @click="doYes()" :color="configManager.getGlobalColor()">确定</n-button>
        </n-space>
      </div>
      <br/>
    </template>
  </n-modal>
</template>

<script setup>
import {$var, handleRecoverLiteShow} from "../js/store";
import {onMounted, onUnmounted, ref} from "vue";
import {configManager, formatManager} from "../js/core";
const templates = ref( $var.others.variables.map(v =>{
  return {
    label: v,
    value: formatManager.data.pairs[v]
  }
}))

function doCancel(){
  $var.view.variableActive = false;
  handleRecoverLiteShow();
}

function doYes(){
  // 将值写入到pairs中
  for (const template of templates.value) {
      formatManager.pairBuffer[template.label] = template.value;
  }
  // 继续进行解析
  formatManager.continueFormat();
  // 关闭
  $var.view.variableActive = false;
  handleRecoverLiteShow();
}
const keyDownHandler = (e)=>{
  if(e.ctrlKey){
    if(e.code === 'KeyQ'){
      doCancel()
    }else if(e.code === 'KeyS'){
      doYes();
      e.preventDefault();
    }
  }
}

onMounted(()=>{
  document.addEventListener('keydown',keyDownHandler)
})
onUnmounted(()=>{
  document.removeEventListener('keydown',keyDownHandler)
})

</script>
<style scoped>

</style>