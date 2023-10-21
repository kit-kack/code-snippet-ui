<template>
  <base-modal :show="$reactive.view.variableActive"
              title="输入变量"
              @cancel="doCancel"
              @confirm="doYes"
  >
    <n-scrollbar style="max-height: 60vh">
      <div style="padding-right: 6px">
        <template v-for="(template,index) in templates">
          <p style="font-size: 13px;margin: 5px">{{template.label}}</p>
          <n-input v-model:value="template.value" clearable placeholder="替换值"/>
        </template>
      </div>
    </n-scrollbar>
  </base-modal>
</template>

<script setup>
import {$normal, $reactive, handleRecoverLiteShow} from "../js/store";
import {ref} from "vue";
import {formatManager} from "../js/core/func";
import BaseModal from "./base/BaseModal.vue";

const templates = ref( $normal.variables.map(v =>{
  return {
    label: v,
    value: $normal.defaultValues[v]
  }
}))

function doCancel(){
  $reactive.view.variableActive = false;
  handleRecoverLiteShow();
}

function doYes(){
  // 将值写入到pairs中
  for (const template of templates.value) {
      formatManager.globalVar['@'+template.label] = template.value;
  }
  // 继续进行解析
  formatManager.continueFormat();
  // 关闭
  $reactive.view.variableActive = false;
  handleRecoverLiteShow();
}

</script>
<style scoped>

</style>