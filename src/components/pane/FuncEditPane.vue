<template>
  <div v-if="refreshFlag">
    <n-divider title-placement="center">
      自定义占位符
    </n-divider>
    <n-list hoverable clickable :show-divider="false" @mouseleave="activeKey = null">
      <n-list-item v-for="(value,key) in formatManager.funcMap"
        @mouseenter="activeKey = key"
      >
        <n-ellipsis :tooltip="false" style="max-width: 280px">
          {{value.name}} —— {{value.commands.length}}个占位符
        </n-ellipsis>
        <template #suffix>
          <n-space v-if="activeKey === key && !value.default" :wrap="false" style="margin-right: -16px;margin-top: 5px">
            <n-button circle size="tiny" type="info" quaternary @click="enterEditView(key)">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M20.998 6.25A3.25 3.25 0 0 0 17.748 3H6.25A3.25 3.25 0 0 0 3 6.25v11.499a3.25 3.25 0 0 0 3.25 3.25h4.914l.356-1.424l.02-.076H6.25a1.75 1.75 0 0 1-1.75-1.75v-9.25h14.998v2.733c.48-.19.994-.264 1.5-.22V6.25zM6.25 4.5h11.499c.966 0 1.75.783 1.75 1.75V7h-15v-.75c0-.967.784-1.75 1.75-1.75zm12.848 8.169l-5.901 5.901a2.685 2.685 0 0 0-.707 1.248l-.457 1.83c-.2.797.522 1.518 1.318 1.319l1.83-.458a2.685 2.685 0 0 0 1.248-.706L22.33 15.9a2.286 2.286 0 0 0-3.233-3.232z" fill="currentColor"></path></g></svg>
              </template>
            </n-button>
            <n-button circle size="tiny" quaternary type="error" @click="doDel(key)">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
              </template>
            </n-button>
          </n-space>
        </template>
      </n-list-item>
    </n-list>
    <n-button size="small" style="margin:5px;"  @click="enterAddView">添加</n-button>
    <n-button size="small" ghost type="error" style="margin:5px;" @click="doReset()">重置</n-button>
    <base-modal v-if="$reactive.setting.funcEditActive"
                :title="pair.flag?'修改占位符函数': '新增占位符函数'"
                @cancel="$reactive.setting.funcEditActive = false"
                @confirm="doFinal"
                wide
    >
      <n-form
          label-placement="left"
          label-width="auto"
          size="small"
          require-mark-placement="right-hanging"
          :model="pair"
          ref="form"
          :rules="rules"
      >
        <n-form-item label="标识符" path="name">
          <n-input v-model:value="pair.name" placeholder="标识符（需要唯一）"  clearable/>
        </n-form-item>
        <n-form-item label="描述" path="desc">
          <n-input
              v-model:value="pair.desc"
              clearable
              placeholder="可选：请输入描述"
              type="textarea"
              size="small"
              style="width:100%"
              :autosize="{maxRows:2}"/>
        </n-form-item>
        <n-form-item label="响应占位符" path="commands">
          <n-dynamic-tags v-model:value="pair.commands" />
        </n-form-item>
        <n-form-item label="函数实现" path="expression" size="small">
          <div class="func-impl">
            <p class="func-impl-preset-content" style="top:5px">function func(command,param){</p>
            <n-input
                v-model:value="pair.expression"
                placeholder="请输入函数实现"
                type="textarea"
                size="small"
                style="padding: 25px 10px 30px 30px;width:100%"
                :autosize="{maxRows:4}"/>
            <p class="func-impl-preset-content" style="bottom: 5px">}</p>
          </div>
        </n-form-item>
      </n-form>
    </base-modal>
  </div>
</template>
<script setup>
import {ref, toRaw} from "vue";
import {formatManager} from "../../js/core/func";
import {getRefreshFunc} from "../../js/utils/common";
import {$reactive} from "../../js/store";
import BaseModal from "../modal/BaseModal.vue";

const activeKey = ref(null)
const pair = ref({})
const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag)
const form = ref()
let nowKey = null;
const rules = {
  "name":[
    {
      required: true,
      message: '标识符必须非空唯一',
      validator(rule,value){
        return value && value.trim() &&  !formatManager.checkNameRepeat(value,nowKey);
      },
      trigger: ["input","blur"]
    }
  ],
  "code":{
    validator(rule,value){
      return value && value.length > 0;
    },
    message:"请提供函数实现"
  },
  "commands":{
    validator(rule,value){
      return value && value.length > 0;
    },
    message:"请至少提供一个响应命令名"
  }
}
function enterAddView(){
  pair.value = {};
  nowKey = null;
  $reactive.setting.funcEditActive = true;
}
function doDel(key){
  formatManager.del(key)
  doRefresh()
}
function doReset(){
  formatManager.reset();
  doRefresh()
}
function enterEditView(key,value){
  pair.value = {
    ...formatManager.funcMap[key]
  }
  nowKey = key;
  $reactive.setting.funcEditActive= true;
}

function doFinal(){
  form.value.validate().then(error=>{
    if(error!=null && error.length >= 0){
      window.$message.warning("请按要求填写")
    }else{
      // parse commands
      const func = toRaw(pair.value)
      if(nowKey){  // edit
        if(formatManager.update(func,nowKey)){
          $reactive.setting.funcEditActive = false;
          doRefresh()
        }
      }else{
        if(formatManager.add(func)){
          $reactive.setting.funcEditActive = false;
          doRefresh()
        }
      }
    }
  },()=>{
    window.$message.warning("请按要求填写")
  })

}

</script>
<style scoped>
.n-list-item{
  height: 40px;
  padding: 0 5px
}
.func-impl{
  position: relative;
  width: 100%;
}
.func-impl-preset-content{
  position: absolute;
  left: 0;
  padding-left: 10px;
  z-index: 3;
  font-style: italic;
  font-size: 12px;
}
</style>