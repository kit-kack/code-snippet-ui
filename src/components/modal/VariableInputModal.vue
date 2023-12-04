<template>
  <base-modal :show="$reactive.common.variableActive"
              :title="$reactive.currentSnippet.name"
              @cancel="doCancel"
              @confirm="doYes"
  >
    <n-scrollbar style="max-height: 60vh">
      <div style="padding-right: 6px">
        <template v-for="(template,index) in templates">
          <p style="font-size: 13px;margin: 5px">{{template.label}}</p>
          <template v-if="template.type === 'input'">
            <n-input v-model:value="template.value" clearable placeholder="输入值"/>
          </template>
          <template v-else>
            <n-select v-model:value="template.value"
                      :options="template.option"
                      @focus="$normal.funcs.vimSupport = true"
                      @blur="$normal.funcs.vimSupport = false"
                      placeholder="选择或输入值"/>
          </template>
        </template>
      </div>
    </n-scrollbar>
  </base-modal>
</template>

<script setup>
import {$normal, $reactive, handleRecoverLiteShow} from "../../js/store";
import {ref} from "vue";
import {formatManager} from "../../js/core/func";
import BaseModal from "./BaseModal.vue";

const templates = ref( $normal.funcs.variables.map(en =>{
  if(en[1] === 'input'){
    return {
      label: en[0],
      value: $normal.funcs.defaultValues[en[0]],
      type: en[1]
    }
  }else{
    const array = $normal.funcs.defaultValues[en[0]]??[]
    if(array.length === 0){
      return {
        label: en[0],
        type: en[1]
      }
    }else{
      let first = array[0];
      const ind  = first.indexOf("||")
      if(ind !== -1){
        first = first.slice(0,ind)
      }
      return {
        label: en[0],
        type: en[1],
        value: first,
        option: array.map(item => {
          const index = item.indexOf('||')
          if(index === -1){
            return {
              value: item,
              label: item
            }
          }
          const value = item.slice(0,index);
          return {
            value: value,
            label: value + "  （"+item.slice(index+2)+"）"
          }
        })
      }
    }

  }
}))

function doCancel(){
  $reactive.common.variableActive = false;
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
  $reactive.common.variableActive = false;
  handleRecoverLiteShow();
}

</script>
<style scoped>

</style>