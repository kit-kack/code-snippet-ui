<template>
  <base-modal
              :title="$normal.funcs.snippetName"
              @cancel="doCancel"
              @confirm="doYes">
    <n-scrollbar style="max-height: 60vh">
      <div style="padding-right: 6px">
        <template v-for="(template,index) in templates">
          <p style="font-size: 13px;margin: 5px">{{template.desc ?? template.name}}</p>
          <template v-if="template.type === 'input'">
            <n-input @keydown.enter.passive.stop="handleEnter(index)" v-model:value="template.value" clearable placeholder="输入值"/>
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
import {$normal, $reactive, CODE_VIEW, handleRecoverLiteShow, LIST_VIEW} from "../../js/store";
import {ref} from "vue";
import {formatManager} from "../../js/utools/func";
import BaseModal from "./BaseModal.vue";
import {throttle} from "lodash-es";

/**
 * $normal.funcs.variabls item
 * [ name, type, desc ]
 */
const templates = ref( $normal.funcs.variables.map(en =>{
  if(en[1] === 'input'){
    return {
      name: en[0],
      desc: en[2],
      value: $normal.funcs.defaultValues[en[0]],
      type: en[1]
    }
  }else{
    const array = $normal.funcs.defaultValues[en[0]]??[]
    if(array.length === 0){
      return {
        name: en[0],
        type: en[1],
        desc: en[2],
      }
    }else{
      let first = array[0];
      const ind  = first.indexOf("||")
      if(ind !== -1){
        first = first.slice(0,ind)
      }
      return {
        name: en[0],
        type: en[1],
        desc: en[2],
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
const tab = throttle(()=>{
  utools.simulateKeyboardTap('tab')
},120)
function handleEnter(index){
  if(index === templates.value.length - 1){
    doYes()
    return;
  }
  tab();
}

function doCancel(){
  $reactive.common.variableActive = false;
  if($reactive.currentMode === LIST_VIEW){
    handleRecoverLiteShow();
  }
}

function doYes(){
  if($reactive.currentMode <= CODE_VIEW){
    // 将值写入到pairs中
    for (const template of templates.value) {
      formatManager.globalVar['@'+template.name] = template.value;
    }
    // 继续进行解析
    formatManager.continueFormat().then(()=>{
      // 关闭
      $reactive.common.variableActive = false;
      handleRecoverLiteShow();
    })
  }else{
    $normal.funcs.syncDataFunc(templates.value)
    $reactive.common.variableActive = false;
  }
}

</script>
<style scoped>

</style>