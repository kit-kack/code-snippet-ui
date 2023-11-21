<template>
  <div>
    <n-form
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        style="margin-top:30px;max-width: 750px; width: 100%;position: fixed;left: 50%; top:50%;transform: translate(-50%, -50%);height: 100%;"
        :rules="rules"
        :model="codeTemplate"
        ref="form"
    >
      <n-form-item label="片段名" path="name">
        <n-input v-model:value="codeTemplate.name" :placeholder="placeholders?.name ?? '起个好名字呗~'"  clearable autofocus :disabled="!properties.name"/>
        <template v-if="GLOBAL_HIERARCHY.currentHierarchy.core" >
          <n-tooltip :show-arrow="false">
            <template #trigger>
              <n-button :color="$normal.theme.globalColor" text @click="codeTemplate.keyword = !codeTemplate.keyword" style="width: 60px" >
                <template #icon>
                  <template v-if="codeTemplate.keyword">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M10.788 3.102c.495-1.003 1.926-1.003 2.421 0l2.358 4.778l5.273.766c1.107.16 1.549 1.522.748 2.303l-3.816 3.719l.901 5.25c.19 1.104-.968 1.945-1.959 1.424l-4.716-2.48l-4.715 2.48c-.99.52-2.148-.32-1.96-1.423l.901-5.251l-3.815-3.72c-.801-.78-.359-2.141.748-2.302L8.43 7.88l2.358-4.778z" fill="currentColor"></path></g></svg>
                  </template>
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M10.788 3.102c.495-1.003 1.926-1.003 2.421 0l2.358 4.778l5.273.766c1.107.16 1.549 1.522.748 2.303l-3.816 3.719l.901 5.25c.19 1.104-.968 1.945-1.959 1.424l-4.716-2.48l-4.715 2.48c-.99.52-2.148-.32-1.96-1.423l.901-5.251l-3.815-3.72c-.801-.78-.359-2.141.748-2.302L8.43 7.88l2.358-4.778zm1.21.937L9.74 8.614a1.35 1.35 0 0 1-1.016.739l-5.05.734l3.654 3.562c.318.31.463.757.388 1.195l-.862 5.029l4.516-2.375a1.35 1.35 0 0 1 1.257 0l4.516 2.375l-.862-5.03a1.35 1.35 0 0 1 .388-1.194l3.654-3.562l-5.05-.734a1.35 1.35 0 0 1-1.016-.739L11.998 4.04z" fill="currentColor"></path></g></svg>
                  </template>
                </template>
              </n-button>
            </template>
            注册为uTools功能关键字
          </n-tooltip>

        </template>
      </n-form-item>
      <n-form-item label="描述" path="desc">
        <n-input v-model:value="codeTemplate.desc" :placeholder="placeholders?.desc ?? '可选：请输入描述'" clearable :disabled="!properties.desc" />
      </n-form-item>
      <n-form-item label="标签" path="tags" >
        <n-select
            v-model:value="codeTemplate.tags"
            filterable
            multiple
            tag
            :placeholder="placeholders?.tags ?? '可选：请选择或输入标签'"
            :show-arrow="false"
            :options="tags"
            :disabled="!properties.tags"
            :render-tag="renderTag"
        />
      </n-form-item>
      <n-form-item label="代码提供" path="code">
        <template #default>
          <n-tabs  animated
                   v-model:value="currentTab"
                   justify-content="space-evenly"
                   type="line"
                   size="small">
            <n-tab-pane name="code" tab="代码" :disabled="formProperties.codeSource === 'link'">
              <div id="main">
                <n-input
                    v-model:value="codeTemplate.code"
                    :placeholder="placeholders?.code ?? '请输入代码片段'"
                    type="textarea"
                    size="small"
                    style="padding-top: 40px;padding-bottom: 10px;"
                    :disabled="!properties.code"
                    @keydown="handleKeyDown"
                    ref="codeTextArea"
                    show-count
                    :autosize="{minRows: 8,maxRows: 8}"/>
                <div id="sub">
                  <n-popover>
                    <template #trigger>
                      <n-button  quaternary style="position: absolute;">
                        <template #icon>
                          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M32 26v-2h-2.101a4.968 4.968 0 0 0-.732-1.753l1.49-1.49l-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 26 20.101V18h-2v2.101a4.968 4.968 0 0 0-1.753.732l-1.49-1.49l-1.414 1.414l1.49 1.49A4.968 4.968 0 0 0 20.101 24H18v2h2.101a4.968 4.968 0 0 0 .732 1.753l-1.49 1.49l1.414 1.414l1.49-1.49a4.968 4.968 0 0 0 1.753.732V32h2v-2.101a4.968 4.968 0 0 0 1.753-.732l1.49 1.49l1.414-1.414l-1.49-1.49A4.968 4.968 0 0 0 29.899 26zm-7 2a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3z" fill="currentColor"></path><circle cx="7" cy="20" r="2" fill="currentColor"></circle><path d="M14 20a4 4 0 1 1 4-4a4.012 4.012 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2.006 2.006 0 0 0-2-2z" fill="currentColor"></path><circle cx="21" cy="12" r="2" fill="currentColor"></circle><path d="M13.02 28.271L3 22.427V9.574l11-6.416l11.496 6.706l1.008-1.728l-12-7a1 1 0 0 0-1.008 0l-12 7A1 1 0 0 0 1 9v14a1 1 0 0 0 .496.864L12.013 30z" fill="currentColor"></path></svg>                        </template>
                      </n-button>
                    </template>
                    <n-space align="center">
                      Tab键行为：
                      <n-select
                          :options="tabOptions"
                          :default-value="configManager.get('default_tab')??0"
                          :theme-overrides="selectThemeOverrides"
                          @update-value="v=> configManager.set('default_tab',v)"
                          style="width: 190px"
                      />
                    </n-space>
                    <n-space align="center">
                      默认语言：
                      <n-select
                          filterable
                          placeholder="选择默认语言"
                          :options="languages"
                          :default-value="configManager.get('default_language')??'plaintext'"
                          tag
                          @update-value="v=> configManager.set('default_language',v)"
                          :theme-overrides="selectThemeOverrides"
                      />
                    </n-space>
                    <config-switch title="默认是否注册uTools关键字" config="default_keyword_enable"/>
                  </n-popover>
                  <n-tooltip v-if="codeTemplate.type && codeTemplate.type.startsWith('x-')">
                    <template #trigger>
                      <n-button  quaternary style="position: absolute; left: 50px" @click="showFuncModal = true" >
                        <template #icon>
                          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6"></path><path d="M12 9v6"></path><path d="M6 19a2 2 0 0 1-2-2v-4l-1-1l1-1V7a2 2 0 0 1 2-2"></path><path d="M18 19a2 2 0 0 0 2-2v-4l1-1l-1-1V7a2 2 0 0 0-2-2"></path></g></svg>                        </template>
                      </n-button>
                    </template>
                    使用占位符
                  </n-tooltip>
                  <div id="select">
                    <n-select
                        v-model:value="codeTemplate.type"
                        filterable
                        placeholder="选择代码类型"
                        :options="languages"
                        :default-value="configManager.get('default_language')??'plaintext'"
                        tag
                        :disabled="!properties.type"
                        @update:value="handleTypeChange()"
                        :render-tag="renderCodeTypeTag"
                        :theme-overrides="selectThemeOverrides"
                    />
                  </div>
                </div>
              </div>
            </n-tab-pane>
            <n-tab-pane name="path" tab="关联" :disabled="formProperties.codeSource === 'code'">
              <template v-if="codeTemplate.path || codeTemplate.dir">
                <n-list hoverable clickable :show-divider="false" style="background: transparent;margin-top:10px;">
                  <n-list-item style="height: 100px">
                    <div class="file" style="position: relative;background-color: transparent;padding-top: 5px">
                      <div style="width: 24px" ><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"></path></svg></div>
                      <div style="position: absolute; left: 32px; bottom: 7px">[ {{linkDesc}} ]</div>
                      <n-select
                          v-if="!codeTemplate.dir"
                          style="position: absolute; right:36px; bottom: 7px;width: 230px;height: 24px"
                          v-model:value="codeTemplate.type"
                          filterable
                          size="small"
                          placeholder="选择代码类型"
                          :options="languages"
                          default-value="plaintext"
                          tag
                          :disabled="!properties.type"
                          @update:value="handleTypeChange()"
                          :render-tag="renderCodeTypeTag"
                          :theme-overrides="selectThemeOverrides"
                      />
                      <n-button @click="handleClearPath" quaternary circle style="position: absolute; right:0; bottom: 0px;" type="error" :disabled="!properties.code">
                        <template #icon>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
                        </template>
                      </n-button>
                    </div>
                    <div style="margin-left: 8px;margin-top: 10px">{{(codeTemplate.dir&&!codeTemplate.ref)? '📢无预设内容，其内容受父目录控制':codeTemplate.path}}</div>
                  </n-list-item>
                </n-list>
              </template>
              <template v-else>
                <template v-if="formProperties.linkType !== 'dir'">
                  <n-divider title-placement="left">
                    文件
                  </n-divider>
                  <n-button @click="importLocalFile" quaternary type="primary">本地文件</n-button>
                  <n-button @click="showModal = true" quaternary type="info" >网络文件</n-button>
                </template>
                <template v-if="formProperties.linkType !== 'file'">
                  <n-divider title-placement="left">
                    目录
                  </n-divider>
                  <n-button @click="importLocalDir" quaternary type="primary" v-if="!GLOBAL_HIERARCHY.currentPrefixIdStr">本地目录</n-button>
                  <n-button @click="setAsNormalDir" quaternary type="info" >普通目录</n-button>
                  <n-button @click="setAsCustomDir" quaternary type="error" v-if="!GLOBAL_HIERARCHY.currentPrefixIdStr">自定义目录(代码实现)</n-button>
                </template>
              </template>
            </n-tab-pane>
          </n-tabs>
        </template>
      </n-form-item>




      <div id="btn">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button id="cancel" strong secondary type="warning"  class="btn" @click="handleCancel">
              取消 (Q)
            </n-button>
          </template>
          {{CtrlStr+'+Q'}}
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button strong secondary type="success"  class="btn" @click="handleUpdate">
              保存 (S)
            </n-button>
          </template>
          {{CtrlStr+'+S'}}
        </n-tooltip>
      </div>
    </n-form>
  </div>
  <base-modal :show="showModal" raw title="请输入链接" @cancel="showModal = false" @confirm="handleSetUrlAsPath">
    <n-input v-model:value="url" clearable/>
  </base-modal>
  <n-modal v-model:show="showFuncModal"
           preset="card"
           title="选择占位符"
           style="width: 60%"

  >
    <n-scrollbar style="max-height: 60vh;width:100%" :x-scrollable="false">
      <func-select-pane @choose="handleChooseCommand"/>
    </n-scrollbar>
  </n-modal>
</template>

<script setup>
import {computed, h, onMounted, onUnmounted, reactive, ref, toRaw} from "vue";
import {tagColorManager} from "../js/core/tag";
import {configManager} from "../js/core/config";
import {fullAlias, languages} from "../js/utils/language";
import {$normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../js/store";
import {CtrlStr} from "../js/some";
import ConfigSwitch from "../components/ConfigSwitch.vue";
import FuncSelectPane from "../components/pane/FuncSelectPane.vue";
import NormalTag from "../components/NormalTag.vue";
import BaseModal from "../components/base/BaseModal.vue";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import {isNetWorkUri} from "../js/utils/common";


const form = ref()
const formProperties = GLOBAL_HIERARCHY.currentConfig.form;
const properties = formProperties.allowUpdatedProperties;
const placeholders = formProperties.placeholders;
const edit = $reactive.currentMode === EDIT_VIEW;
const codeTemplate = reactive(edit?{...toRaw($reactive.currentSnippet)} :{
  code: $normal.quickCode,
  keyword: configManager.get('default_keyword_enable')
})
const tags = computed(()=>{
  return tagColorManager.all().map(v=>{
    return {
      label:v,
      value:v
    }
  })
})
const currentTab = ref((codeTemplate.path || codeTemplate.dir)? 'path':(formProperties.codeSource === 'link' ?'path':'code'))  // 当前Tab页
const codeTextArea = ref()
const showModal = ref(false)
const showFuncModal = ref(false)
const url = ref()
const linkDesc = computed(()=>{
  if(codeTemplate.dir){
    if(codeTemplate.ref){
      if(codeTemplate.ref === "local"){
        return "本地目录"
      }else{
        return "自定义目录";
      }
    }else{
      return "普通目录";
    }
  }else{
    return '关联文件'
  }
})
const tabOptions = [
  {label: '原生行为',value: 0},
  {label: '\\t制表符',value: 1},
  {label: '2个空格',value: 2},
  {label: '4个空格',value: 4}
]
const renderCodeTypeTag = ({option})=>{
  if(option.value.length > 2 && option.value.startsWith('x-')){
    return option.label + ' （解析⚡）'
  }else{
    return option.label;
  }
}
const renderTag = ({ option, handleClose }) => {
  return h(
      NormalTag,
      {
        type: "closable",
        content: option.label,
        onMousedown: (e) => {
          e.preventDefault()
        },
        onClose: (e) => {
          e.stopPropagation()
          handleClose()
        }
      }, // <n-tag closable id="tag" size="small" :color="colorStyle" @close="handleClose">{{props.content}}</n-tag>
      null
  )
}
const rules = {
  "name":[
    {
      message: "代码片段名必须非空且不重复",
      required: true,
      validator(rule, value) {
        if(value!= null){
          const v = value.trim();
          if(v !== ''){
            if(edit && $reactive.currentSnippet.name === v){
              return true;
            }
            return !GLOBAL_HIERARCHY.form.containName(v)
          }
        }
        return false;
      },
      trigger: ["input","blur"]
    },
    {
      message: "代码片段名不能包含/",
      validator(rule, value) {
        if(value!= null){
          return !value.includes('/')
        }
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
    message:"代码片段不能为空"
  }
}
const handleCancel = ()=>{
  $normal.keepSelectedStatus = true;
  GLOBAL_HIERARCHY.changeView(LIST_VIEW)
}
const handleUpdate = ()=>{
  form.value.validate().then(error=>{
      if(error!=null && error.length >= 0){
        window.$message.warning("请按要求填写")
      }else{
        codeTemplate.name = codeTemplate.name.trim()
        //
        if(currentTab.value === 'path'){
          // link
          if(codeTemplate.dir){
            // dir
            if(codeTemplate.ref){
              if(codeTemplate.ref === "local"){
                if(!codeTemplate.path){
                  $message.warning("请提供 [关联目录路径]")
                  return;
                }
              }
            }else{
              // normal
            }
          }else{
            // file
            if(!codeTemplate.path){
              $message.warning("请提供 [关联项]")
              return;
            }
          }
        }else{
          // code
          if(!codeTemplate.code){
            $message.warning("代码不能为空")
            return;
          }
        }
        if(codeTemplate.type === undefined){
          codeTemplate.type = configManager.get('default_language')?? 'plaintext';
        }
        if(edit){
          const id = codeTemplate.id ?? codeTemplate.name;
          if(id === $normal.lastQueryCodeSnippetId){
            // 发生修改，缓存失效
            $normal.lastQueryCodeSnippetId = null;
          }
          // 更新
          GLOBAL_HIERARCHY.form.createOrEdit(toRaw(codeTemplate),$reactive.currentSnippet.name)
          // 是否维持选中
          $normal.keepSelectedStatus = (codeTemplate.name === $reactive.currentSnippet.name)? true : null;
        }else{
          $normal.keepSelectedStatus = null;
          GLOBAL_HIERARCHY.form.createOrEdit(toRaw(codeTemplate),null)
        }
        window.$message.success("操作成功")
        // handleRecoverLiteShow()
        // $var.currentMode = LIST_VIEW;
        // $var.others.code = null;
        GLOBAL_HIERARCHY.changeView(LIST_VIEW,true)
        // switchToListView(true)
      }
  },()=>{
    window.$message.warning("请按要求填写")
  })
}
const keyDownHandler = (e)=>{
  if(e.ctrlKey){
    if(e.code === 'KeyQ'){
      handleCancel();
    }else if(e.code === 'KeyS'){
      handleUpdate();
      e.preventDefault();
    }
  }
}
const handleChooseCommand = (command)=>{
  showFuncModal.value = false;
  if(codeTemplate.code){
    codeTemplate.code += "{{"+command+"}}"
  }else{
    codeTemplate.code = "{{"+command+"}}"
  }
}
const handleTypeChange = ()=>{
  if(GLOBAL_HIERARCHY.currentHierarchy.inline){
    codeTemplate.type = fullAlias(codeTemplate.type)
  }
}

onMounted(()=>{
  document.addEventListener('keydown',keyDownHandler)
})
onUnmounted(()=>{
  document.removeEventListener('keydown',keyDownHandler)
})

const handleKeyDown = (e)=>{
  if(e.code === 'Tab'){
    let char;
    switch (configManager.get('default_tab')){
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
const importLocalFile = ()=>{
  const realPathList = utools.showOpenDialog({
    title: '指定你的本地关联文件' ,
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '确定',
    properties: [
      'openFile'
    ]
  })
  if (realPathList != null) {
    const path = realPathList[0];
    codeTemplate.path = path;
    // 解析类型
    const index = path.lastIndexOf('.');
    if(index === -1){
      codeTemplate.type = configManager.get('default_language')?? 'plaintext';
    }else{
      codeTemplate.type = fullAlias(path.slice(index +1).toLowerCase())
    }
  }
}
const importLocalDir = ()=>{
  const realPathList = utools.showOpenDialog({
    title: '指定你的本地关联目录' ,
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '确定',
    properties: [
      'openDirectory'
    ]
  })
  if (realPathList != null) {
    codeTemplate.path = realPathList[0];
    // 解析类型
    codeTemplate.dir = true;
    codeTemplate.ref = "local";
  }
}
function setAsNormalDir() {
  codeTemplate.dir = true;
  codeTemplate.ref = undefined;
}
function setAsCustomDir(){
  codeTemplate.dir = true;
  codeTemplate.ref = "new-maven";
}
function handleSetUrlAsPath(){
  if(url.value && isNetWorkUri(url.value)){
    codeTemplate.path = url.value;
    showModal.value = false;
  }else{
    $message.warning("请填写合法链接")
  }
}
function handleClearPath(){
  codeTemplate.path = undefined;
  codeTemplate.dir = undefined;
  codeTemplate.ref = undefined;
}
</script>

<style scoped>

#main{
  position: relative;
  width: 100%;
  height: 270px;
  box-sizing: border-box;
  padding: 0 5px;
}
#sub{
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 10px);
  height: 37px;
  box-sizing: border-box;
  margin-left: 5px;
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
  bottom: 40px;
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
.n-form-item {
  --n-feedback-padding: 2px 0 0 2px;
  --n-feedback-font-size: 12px;
  --n-feedback-height: 22px !important;
}

</style>