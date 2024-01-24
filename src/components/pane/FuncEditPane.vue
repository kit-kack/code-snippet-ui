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
                :title="pair.flag?'修改占位符实现': '新增占位符实现'"
                @cancel="$reactive.setting.funcEditActive = false"
                @confirm="doFinal"
                wide
    >
        <n-tabs  animated
                 justify-content="space-evenly"
                 style="height: 60vh"
                 size="small">
          <n-tab-pane name="command" tab="占位符" style="padding-right: 10px">
            <n-scrollbar style="max-height: 300px;padding-right: 10px">
              <n-form-item label="分组" path="name" :rule="NAME_RULE" label-placement="left">
                <n-input v-model:value="pair.name" placeholder="分组名需要非空且唯一"   clearable/>
              </n-form-item>
              <n-form-item label="占位符" path="commands" :rule="COMMAND_RULE" label-placement="left">
                <n-dynamic-tags v-model:value="pair.commands"/>
              </n-form-item>
              <n-form-item label="描述" path="desc" label-placement="left">
                <div style="width: 99%">
                  <code-editor v-model="pair.desc"
                               font-size="14px"
                               padding="5px"
                               line-nums
                               :header="false" width="100%" :languages="[['html']]"/>
                </div>
              </n-form-item>
            </n-scrollbar>
          </n-tab-pane>
          <n-tab-pane name="impl" tab="代码实现">
              <div class="func-impl">
                <p class="func-impl-preset-content" style="margin-bottom: 5px">function func(command,param){</p>
                <code-editor v-model="pair.expression"
                             font-size="14px"
                             padding="5px"
                             height="250px"
                             line-nums
                             :header="false" width="100%"/>
                <p class="func-impl-preset-content">}</p>
              </div>
          </n-tab-pane>
        </n-tabs>
    </base-modal>
  </div>
</template>
<script setup>
import {h, ref, toRaw} from "vue";
import {formatManager} from "../../js/core/func";
import {getRefreshFunc} from "../../js/utils/common";
import {$normal, $reactive} from "../../js/store";
import BaseModal from "../modal/BaseModal.vue";
import CodeEditor from "../lib/MyCodeEditor.vue";

const activeKey = ref(null)
const pair = ref({})
const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag)
let nowKey = null;
const NAME_RULE = {
  required: true,
  validator(){
    const name = pair.value.name;
    if(name && name.trim()){
      if(formatManager.checkNameRepeat(name,nowKey)){
        return new Error(`分组名 ${name} 已被定义使用，请重新定义`);
      }
    }else{
      return new Error('分组名不能为空')
    }
    return true;
  },
  trigger: ["input","blur"]
}
const COMMAND_RULE = {
  trigger: ['change'],
  validator() {
    const commands = pair.value.commands;
    // check repeat
    if(commands && commands.length > 0){
      if(new Set(commands).size !== commands.length){
        return new Error('当前存在重复的占位符，请剔除重复项');
      }
      for (const command of commands) {
        // check empty
        if(command && command.trim()){
          if(formatManager.checkCommandRepeat(command,nowKey)){
            return new Error(`占位符 ${command} 已被创建使用，请重新创建`);
          }
        }else{
          return new Error('占位符不能为空字符串')
        }
      }
    }else{
      return new Error('至少创建一个占位符');
    }
    return true;
  }
}
function enterAddView(){
  pair.value = {
    desc: '暂无描述~',
    expression: ''
  };
  nowKey = null;
  $reactive.setting.funcEditActive = true;
}
function doDel(key){
  $dialog.error({
    autoFocus: false,
    closable: false,
    title: '删除操作',
    content: ()=> h(
        'div',
        [
          '确定要删除分组 ',
            h('span',
                {
                  style:{
                    fontWeight: 'bolder',
                  }
                },key),
          ' 以及相关占位符吗？',
        ]
    ),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick(){
      formatManager.del(key)
      doRefresh()
    }
  })
}
function doReset(){
  $dialog.error({
    autoFocus: false,
    closable: false,
    title: '重置操作',
    content: ()=> h(
        'div',
        [
          '确定要进行 ',
          h('span',
              {
                style:{
                  fontWeight: 'bolder',
                }
              },'重置'),
          ' 吗？',
        ]
    ),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick(){
      formatManager.reset();
      doRefresh()
    }
  })
}
function enterEditView(key,value){
  pair.value = {
    ...formatManager.funcMap[key]
  }
  nowKey = key;
  $reactive.setting.funcEditActive= true;
}

function doFinal(){
  // 校验name
  let result = NAME_RULE.validator()
  if(result !== true){
    window.$message.warning(result.message)
    return
  }
  // 校验commands
  result = COMMAND_RULE.validator()
  if(result !== true){
    window.$message.warning(result.message)
    return
  }
  // 校验expression
  if(!pair.value.expression || pair.value.expression.length <= 0){
    window.$message.warning("请提供代码实现")
    return;
  }
  // parse commands
  const func = toRaw(pair.value)
  if(nowKey){ // edit
    if(formatManager.update(func,nowKey)){
      $reactive.setting.funcEditActive = false;
      doRefresh()
    }
  }else{ // create
    if(formatManager.add(func)){
      $reactive.setting.funcEditActive = false;
      doRefresh()
    }
  }
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
  padding-left: 10px;
  z-index: 3;
  font-style: italic;
  font-size: 12px;
  font-weight: bold;
}
</style>