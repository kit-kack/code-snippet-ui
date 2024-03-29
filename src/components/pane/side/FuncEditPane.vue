<template>
  <div v-if="refreshFlag">
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
                <svg-edit/>
              </template>
            </n-button>
            <n-button circle size="tiny" quaternary type="error" @click="doDel(key)">
              <template #icon>
                <svg-delete/>
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
        <div class="func-edit-tab">
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
                  <div style="width: 99%;padding-left: 11px">
                    <code-editor v-model="pair.desc"
                                 font-size="14px"
                                 padding="5px"
                                 line-nums
                                 :header="false" width="99%" :languages="[['html']]"/>
                  </div>
                </n-form-item>
              </n-scrollbar>
            </n-tab-pane>
            <n-tab-pane name="impl" tab="代码实现">
              <div class="func-impl">
                <p class="func-impl-preset-content" style="margin-bottom: 5px">function func(command,param){</p>
                <div style="padding-left: 10px">
                  <code-editor v-model="pair.expression"
                               font-size="14px"
                               padding="5px"
                               height="250px"
                               line-nums
                               :header="false" width="100%"/>
                </div>
                <p class="func-impl-preset-content">}
                  <n-tooltip>
                    <template #trigger>
                      <n-button text size="tiny" :focusable="false">
                        <template #icon>
                          <svg-tip/>
                        </template>
                      </n-button>
                    </template>
                    tips:<br/>
                    1. 运行环境为<span class="global-color">Node.js</span>，可<span class="global-color">require</span>内置模块使用<br/>
                    2. 支持异步，可返回<span class="global-color">Promise</span>结果
                  </n-tooltip>
                </p>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
    </base-modal>
  </div>
</template>
<script setup>
import {h, ref, toRaw} from "vue";
import {formatManager} from "../../../js/utools/func";
import {getRefreshFunc} from "../../../js/utils/common";
import {$reactive} from "../../../js/store";
import BaseModal from "../../modal/BaseModal.vue";
import CodeEditor from "../../code-editor/MyCodeEditor.vue";
import SvgEdit from "../../../asserts/edit.svg"
import SvgDelete from "../../../asserts/delete.svg"
import SvgTip from "../../../asserts/tip.svg"

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
    expression: 'return "hello code-snippet!";',
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