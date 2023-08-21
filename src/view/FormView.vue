<template>
  <div id="root">
    <n-form
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        style="margin-top:10px;max-width: 750px; width: 100%;position: fixed;left: 50%; top:50%;transform: translate(-50%, -50%);height: 100%;"
        :rules="rules"
        :model="codeTemplate"
        ref="form"
    >
      <n-form-item label="代码片段名" path="name">
        <n-input v-model:value="codeTemplate.name" clearable autofocus/>
      </n-form-item>
      <n-form-item label="代码描述" path="desc">
        <n-input v-model:value="codeTemplate.desc" clearable/>
      </n-form-item>
      <n-form-item label="标签" path="tags">
        <n-dynamic-tags v-model:value="codeTemplate.tags">
          <template #input="{ submit, deactivate }">
            <n-select
                v-model:value="tempTag"
                filterable tag
                @blur="submit(tempTag);tempTag=null"
                :options="tags"
                placeholder="请选择或输入标签"
            />
          </template>
        </n-dynamic-tags>
      </n-form-item>
      <n-form-item label="代码片段" path="code">
        <template #default>
          <n-tabs  animated
                   v-model:value="currentTab"
                   justify-content="space-evenly"
                   type="line"
                   size="small">
            <n-tab-pane name="code" tab="代码">
              <div id="main">
                <n-input
                    v-model:value="codeTemplate.code"
                    placeholder="请输入代码片段"
                    type="textarea"
                    size="small"
                    style="padding-top: 40px;padding-bottom: 10px"
                    @keydown="handleKeyDown"
                    ref="codeTextArea"
                    show-count
                    :autosize="{minRows: 9,maxRows: 9}"/>
                <div id="sub">
                  <n-popover>
                    <template #trigger>
                      <n-button  quaternary style="position: absolute;">
                        <template #icon>
                          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M7.77 6.76L6.23 5.48L.82 12l5.41 6.52l1.54-1.28L3.42 12l4.35-5.24zM7 13h2v-2H7v2zm10-2h-2v2h2v-2zm-6 2h2v-2h-2v2zm6.77-7.52l-1.54 1.28L20.58 12l-4.35 5.24l1.54 1.28L23.18 12l-5.41-6.52z" fill="currentColor"></path></svg>
                        </template>
                      </n-button>
                    </template>
                    <n-space align="center">
                      Tab键行为：
                      <n-select
                          :options="tabOptions"
                          :default-value="configManager.get('whatTabDo')"
                          :theme-overrides="selectThemeOverrides"
                          @update-value="v=> configManager.set('whatTabDo',v)"
                          style="width: 190px"
                      />
                    </n-space>
                    <n-space align="center">
                      默认语言：
                      <n-select
                          filterable
                          placeholder="选择默认语言"
                          :options="languages"
                          :default-value="configManager.get('defaultLanguage')??'plaintext'"
                          tag
                          @update-value="v=> configManager.set('defaultLanguage',v)"
                          :theme-overrides="selectThemeOverrides"
                      />
                    </n-space>
                  </n-popover>
                  <div id="select">
                    <n-select
                        v-model:value="codeTemplate.type"
                        filterable
                        placeholder="选择代码类型"
                        :options="languages"
                        :default-value="configManager.get('defaultLanguage')??'plaintext'"
                        tag
                        :theme-overrides="selectThemeOverrides"
                    />
                  </div>
                </div>
              </div>
            </n-tab-pane>
            <n-tab-pane name="path" tab="链接文件">
              <n-button @click="handleImport" quaternary type="primary">关联本地文本文件</n-button> &nbsp;&nbsp;
              <n-button @click="showModal = true" quaternary type="info" >关联文本链接</n-button>
              <n-list hoverable clickable :show-divider="false" style="background: transparent;margin-top:10px;">
                <n-list-item v-if="codeTemplate.path" style="height: 100px">
                  <div class="file" style="position: relative;background-color: transparent;padding-top: 5px">
                    <div style="width: 24px" ><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"></path></svg></div>
                    <div style="position: absolute; left: 32px; bottom: 7px">[ {{codeTemplate.dir? '本地目录':(codeTemplate.local? '本地文件':'网络文件')}} ]</div>
                    <n-select
                        style="position: absolute; right:36px; bottom: 7px;width: 230px;height: 24px"
                        v-model:value="codeTemplate.type"
                        filterable
                        size="small"
                        placeholder="选择代码类型"
                        :options="languages"
                        default-value="plaintext"
                        tag
                        :theme-overrides="selectThemeOverrides"
                    />
                    <n-button @click="handleClearPath" quaternary circle style="position: absolute; right:0; bottom: 0px;" type="error">
                      <template #icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
                      </template>
                    </n-button>
                  </div>
                  <div style="margin-left: 8px;margin-top: 10px">{{codeTemplate.path}}</div>
                </n-list-item>
              </n-list>
            </n-tab-pane>
          </n-tabs>
        </template>
      </n-form-item>




      <div id="btn">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button id="cancel" strong secondary type="warning"  class="btn" @click="handleCancel">
              取消
            </n-button>
          </template>
          {{CtrlStr+'+Q'}}
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button strong secondary type="success"  class="btn" @click="handleUpdate">
              保存
            </n-button>
          </template>
          {{CtrlStr+'+S'}}
        </n-tooltip>
      </div>
    </n-form>
  </div>
  <n-modal v-model:show="showModal"
           preset="card"
           title="请输入链接"
            style="width: 60%"

  >
    <n-input v-model:value="url" clearable/>
    <template #footer>
      <div style="width: 100%;position: relative">
        <n-space style="position: absolute; right: 3px">
          <n-button quaternary @click="showModal = false">取消</n-button>
          <n-button quaternary type="success" @click="handleSetUrlAsPath">确定</n-button>
        </n-space>
      </div>
      <br/>
    </template>
  </n-modal>
</template>

<script setup>
import {computed, nextTick, onMounted, reactive, ref, toRaw} from "vue";
import {codeSnippetManager, configManager, tagColorManager} from "../js/core.js";
import {$var, handleRecoverLiteShow, LIST_VIEW, UPDATE_VIEW} from "../js/store";
import {languages} from "../js/utils/common";

const CtrlStr = utools.isMacOS()? 'Command':'Ctrl';
const form = ref()
const codeTemplate = reactive(($var.currentMode === UPDATE_VIEW)? {...codeSnippetManager.get($var.currentName)} :{
  code: $var.others.code
})
const tempTag = ref()
const tags = computed(()=>{
  return tagColorManager.all().map(v=>{
    return {
      label:v,
      value:v
    }
  })
})
const currentTab = ref(codeTemplate.path? 'path':'code')  // 当前Tab页
const codeTextArea = ref()
const showModal = ref(false)
const url = ref()
const tabOptions = [
  {label: '原生行为',value: 0},
  {label: '\\t制表符',value: 1},
  {label: '2个空格',value: 2},
  {label: '4个空格',value: 4}
]

const rules = {
  "name":[
    {
      required: true,
      message: '代码片段名必须为非空字符串',
      validator(rule,value){
        return value!=null && value.trim() !== '';
      },
      trigger: ["input","blur"]
    },
    {
      message: "代码片段名已重复",
      validator(rule, value) {
        if($var.currentMode === UPDATE_VIEW && $var.currentName === value){
          return true;
        }
        return !codeSnippetManager.contain(value)
      },
      trigger: ["input","blur"]
    }

  ],
  "code":{
    validator(rule,value){
      if(currentTab.value === 'code'){
        return value && value.length > 0;
      }
      return true;
    },
    message:"请放置代码片段"
  }
}
const handleCancel = ()=>{
  $var.utools.keepSelectedStatus = true;
  handleRecoverLiteShow()
  $var.currentMode = LIST_VIEW;
}
const handleUpdate = ()=>{
  form.value.validate().then(error=>{
      if(error!=null && error.length >= 0){
        window.$message.warning("请按要求填写")
      }else{
        //
        if(currentTab.value === 'path'){
          //
          if(!codeTemplate.path){
            $message.warning("请提供 链接文件")
            return;
          }
        }
        if(codeTemplate.type === undefined){
          codeTemplate.type = configManager.get('defaultLanguage')?? 'plaintext';
        }
        if($var.currentMode === UPDATE_VIEW){
          if($var.currentName === codeTemplate.name){
            $var.utools.keepSelectedStatus = true;
            codeSnippetManager.update(toRaw(codeTemplate))
          }else{
            $var.utools.keepSelectedStatus = null;
            // 这里清理查询缓存
            let codeSnippet = toRaw(codeTemplate);
            delete codeSnippet.query;
            codeSnippetManager.replace($var.currentName,codeSnippet)
          }
        }else{
          $var.utools.keepSelectedStatus = null;
          codeSnippetManager.add(toRaw(codeTemplate))
        }
        window.$message.success("操作成功")
        handleRecoverLiteShow()
        $var.currentMode = LIST_VIEW;
        $var.others.code = null;
      }
  },()=>{
    window.$message.warning("请按要求填写")
  })
}

onMounted(()=>{
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey){
      if(e.code === 'KeyQ'){
        handleCancel();
      }else if(e.code === 'KeyS'){
        handleUpdate();
        e.preventDefault();
      }
    }
  })
})

const handleKeyDown = (e)=>{
  if(e.code === 'Tab'){
    let char;
    switch (configManager.get('whatTabDo')){
      case 1:
        char = '\t';
        break;
      case 2:
        char = '  ';
        break;
      case 4:
        char = '    ';
        break;
      default:
        return;
    }
    e.preventDefault();
    const start = codeTextArea.value.textareaElRef.selectionStart;
    codeTemplate.code =
        codeTemplate.code.slice(0,start)
        +char
        +codeTemplate.code.slice(start)
  }
}


const selectThemeOverrides = {
  peers:{
    InternalSelection:{
      border: `1px solid transparent`,
      borderActive: `1px solid transparent`,
      borderHover: `1px solid transparent`,
      borderFocus: `1px solid transparent`,
      boxShadowHover: 'none',
      boxShadowActive: 'none',
      boxShadowFocus: 'none',
      textColor: utools.isDarkColors()? 'white':'black',
      borderRadius: 0,
      color:'transparent',
      colorFocus: 'white',
      colorActive: utools.isDarkColors()? '#575859': '#fff'
    }
  }
}
const handleImport = ()=>{
  const realPathList = utools.showOpenDialog({
    title: '指定你的本地关联文件' ,
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '确定',
    properties: [
      'openFile'
    ]
  })
  if (realPathList != null) {
    codeTemplate.path = realPathList[0]
    codeTemplate.local = true;
  }
}
const isFullUrlRegex = /^\w+:\/\/.*/
function handleSetUrlAsPath(){
  if(url.value && url.value.match(isFullUrlRegex)){
    codeTemplate.path = url.value;
    codeTemplate.local = undefined;
    showModal.value = false;
  }else{
    $message.warning("请填写合法链接")
  }
}
function handleClearPath(){
  codeTemplate.path = undefined;
  codeTemplate.local = undefined;
}
</script>

<style scoped>

#main{
  position: relative;
  width: 100%;
  height: 270px;
}
#sub{
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 2px);
  height: 37px;
  box-sizing: border-box;
  margin-left: 1px;
  border-bottom: 1px solid #efeff2;
  padding: 1px;
  z-index: 3;
}
#dark-app #sub{
  border-bottom-color: #848586;
}
#select{
  width:230px;
  float: right;
  border-left: 2px solid #efeff2;
}
#dark-app #select{
  border-left-color: #646666;
}
#setting{
  float: left;
  margin-top: 6px;
  margin-left: 6px;
}
#btn{
  position: fixed;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}
#cancel{
  margin-right: 20px;
}
.btn{
  width: 100px;
}
.n-card{
  padding-bottom: 50px;
}

</style>