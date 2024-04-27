<template>
  <div v-if="refreshFlag">
    <n-list hoverable clickable :show-divider="false" @mouseleave="activeKey = null">
      <n-list-item v-for="(value,key) in formatManager.funcMap"
        @mouseenter="activeKey = key"
      >
        <n-ellipsis :tooltip="false" style="max-width: 280px">
          {{value.name}} —— {{Object.keys(value.commands).length}}个占位符
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
    <n-button size="small" secondary style="margin:5px;"  @click="enterAddView">添加</n-button>
    <n-button size="small" secondary type="error" style="margin:5px;" @click="doReset()">重置</n-button>
    <base-modal v-if="$reactive.setting.funcEditActive"
                :title="pair.flag?'修改占位符实现': '新增占位符实现'"
                @cancel="$reactive.setting.funcEditActive = false"
                @confirm="doFinal"
                id="func-command-edit-tab"
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
                  <n-input v-model:value="pair.name" placeholder="起个好名字呗~"   clearable/>
                </n-form-item>
                <n-form-item path="commands" :rule="COMMAND_RULE" label-placement="left">
                  <template #label>
                    占位符
                    <n-tooltip>
                      <template #trigger>
                        <n-button text size="tiny" :focusable="false">
                          <template #icon>
                            <svg-tip/>
                          </template>
                        </n-button>
                      </template>
                      双击占位符来设置显示别名
                    </n-tooltip>
                  </template>
                  <n-dynamic-tags v-model:value="commandsArray" :render-tag="renderCommandTag"/>
                  <base-modal v-if="active.flag" to="#func-command-edit-tab"
                              preset="card"
                              :title="active.element"
                              style="width: 60%"
                              non-keydown-handler
                              @cancel="active.flag = false"
                              @confirm="doAddCommandDesc"
                              :auto-focus="false">
                    <h5>填写显示别名，方便后续在代码片段编辑页面选择相应占位符</h5>
                    <n-input placeholder="填写别名，方便选择" v-model:value="active.desc" maxlength="10" show-count clearable/>
                  </base-modal>
                </n-form-item>
                <n-form-item label="描述" path="desc" label-placement="left">
                  <div style="width: 99%;padding-left: 11px">
                    <code-editor v-model="pair.desc"
                                 placeholder="↪ 有些故事没讲完，那就算了吧"
                                 :languages="[['html']]"/>
                  </div>
                </n-form-item>
              </n-scrollbar>
            </n-tab-pane>
            <n-tab-pane name="impl" tab="代码实现">
              <div class="func-impl">
                <p class="func-impl-preset-content" style="margin-bottom: 5px">function func(command,param){</p>
                <div style="padding-left: 10px">
                  <code-editor v-model="pair.expression"
                               height="250px "
                               placeholder="↪ 我曾经试着忘掉你，但每次都是加深了记忆"/>
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
import SvgFlag from "../../../asserts/flag.svg"
import {NIcon, NTag} from "naive-ui";

const activeKey = ref(null)
const pair = ref({})
const commandsArray = ref([])
const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag)
const active = ref({
  flag:false,
  element:null,
  desc: null
})
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
    const commands = commandsArray.value;
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
function renderCommandTag(command,index){
  const desc = pair.value.commands[command]
  return h(
      NTag,
      {
        closable: true,
        bordered: false,
        style:{
          userSelect: 'none',
          backgroundColor: utools.isDarkColors()? '#424247': null,
        },
        title: desc? desc : null,
        onDblclick: () => {
          active.value.flag = true;
          active.value.element = command;
          active.value.desc = desc
        },
        onClose: () => {
          commandsArray.value.splice(index,1)
        }
      },
      {
        default: () => command,
        icon: desc? ()=>{
          return h(NIcon, {
            size: 18,
          }, {default: () => h(SvgFlag)})
        }: null
      }
  )
}
function doAddCommandDesc(){
  if(active.value.desc && active.value.desc.trim()){
    pair.value.commands[active.value.element] = active.value.desc.trim()
  }else{
    pair.value.commands[active.value.element] = null;
  }
  active.value.flag = false;
}
function enterAddView(){
  pair.value = {
    desc: '暂无描述~',
    expression: 'return "hello code-snippet!";',
    commands:{}
  };
  commandsArray.value = []
  nowKey = null;
  $reactive.setting.funcEditActive = true;
}
function doDel(key){
  $kit_error_dialog({
    title: '删除',
    content: ()=> h(
        'div',
        [
          '删除分组 ',
          h('span',
              {
                style:{
                  fontWeight: 'bolder',
                }
              },key),
          ' 以及相关占位符吗？',
        ]
    ),
    callback: ()=>{
      formatManager.del(key)
      doRefresh()
    }
  })
}
function doReset(){
  $kit_error_dialog({
    title: '重置',
    content: ()=> h(
        'div',
        [
          '进行 ',
          h('span',
              {
                style:{
                  fontWeight: 'bolder'
                }
              },'重置'),
          ' 为默认占位符实现？',
        ]
    ),
    callback: ()=>{
      formatManager.reset();
      doRefresh()
    }
  })
}
function enterEditView(key,value){
  pair.value = structuredClone(formatManager.funcMap[key])
  commandsArray.value = Object.keys(formatManager.funcMap[key].commands);
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
  for (const command of commandsArray.value) {
    if(!(command in func.commands)){
      func.commands[command] = null
    }
  }
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
#dark-app .code-editor{
  --plugin-background-color: #2c2c32;
  --scrollbar-thumb-background-color: #5a5a5a;
}
#light-app-v5 .code-editor{
  --plugin-background-color: #ffffff;
}
</style>