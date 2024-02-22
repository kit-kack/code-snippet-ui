<template>
  <div id="form-view">
    <template v-if="$reactive.form.fullScreen">
      <code-editor v-model="codeTemplate.code"
                   ref="codeEditorRef"
                   font-size="14px"
                   padding="5px"
                   height="calc( 100vh - 18px )"
                   :header="false"
                   line-nums
                   @exit-full-screen="requestFullScreen(false)" width="100%" :languages="language"/>
    </template>
    <template v-else>
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
                <n-button :focusable="false" :color="$normal.theme.globalColor" text @click="codeTemplate.keyword = !codeTemplate.keyword" style="width: 60px" >
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
              show-on-focus
              :placeholder="placeholders?.tags ?? '可选：请选择或输入标签'"
              :show-arrow="false"
              :options="tags"
              :disabled="!properties.tags"
              :render-tag="renderTag"
              :render-label="renderTagSelectLabel"
          />
        </n-form-item>

        <n-form-item label="代码提供" path="code">
          <template #default>
            <n-tabs  animated
                     v-model:value="currentTab"
                     justify-content="space-evenly"
                     type="line"
                     :on-before-leave="()=> properties.code"
                     size="small">
              <n-tab-pane name="code" tab="代码" :disabled="formProperties.codeSource === 'link'">
                <div id="form-code">
                  <div id="form-code-top-nav">
                    <n-popover>
                      <template #trigger>
                        <n-button :focusable="false" quaternary style="position: absolute;">
                          <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M32 26v-2h-2.101a4.968 4.968 0 0 0-.732-1.753l1.49-1.49l-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 26 20.101V18h-2v2.101a4.968 4.968 0 0 0-1.753.732l-1.49-1.49l-1.414 1.414l1.49 1.49A4.968 4.968 0 0 0 20.101 24H18v2h2.101a4.968 4.968 0 0 0 .732 1.753l-1.49 1.49l1.414 1.414l1.49-1.49a4.968 4.968 0 0 0 1.753.732V32h2v-2.101a4.968 4.968 0 0 0 1.753-.732l1.49 1.49l1.414-1.414l-1.49-1.49A4.968 4.968 0 0 0 29.899 26zm-7 2a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3z" fill="currentColor"></path><circle cx="7" cy="20" r="2" fill="currentColor"></circle><path d="M14 20a4 4 0 1 1 4-4a4.012 4.012 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2.006 2.006 0 0 0-2-2z" fill="currentColor"></path><circle cx="21" cy="12" r="2" fill="currentColor"></circle><path d="M13.02 28.271L3 22.427V9.574l11-6.416l11.496 6.706l1.008-1.728l-12-7a1 1 0 0 0-1.008 0l-12 7A1 1 0 0 0 1 9v14a1 1 0 0 0 .496.864L12.013 30z" fill="currentColor"></path></svg>                        </template>
                        </n-button>
                      </template>
                      <n-space align="center">
                        Tab 行为：
                        <n-select
                            :options="tabOptions"
                            :default-value="configManager.get('default_tab')??0"
                            :theme-overrides="selectThemeOverrides"
                            @update-value="v=> configManager.set('default_tab',v)"
                            style="width: 194px"
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
                            :render-tag="renderCodeTypeTag"
                        />
                      </n-space>
                      <config-switch title="默认是否注册uTools关键字" config="default_keyword_enable"/>
                    </n-popover>
                    <n-tooltip>
                      <template #trigger>
                        <n-button :focusable="false" quaternary style="position: absolute; left: 50px" @click="requestFullScreen(true)" >
                          <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M5 6a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v2a1 1 0 0 0 2 0V6zm0 12a1 1 0 0 0 1 1h2a1 1 0 1 1 0 2H6a3 3 0 0 1-3-3v-2a1 1 0 1 1 2 0v2zM18 5a1 1 0 0 1 1 1v2a1 1 0 1 0 2 0V6a3 3 0 0 0-3-3h-2a1 1 0 1 0 0 2h2zm1 13a1 1 0 0 1-1 1h-2a1 1 0 1 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 1 0-2 0v2z" fill="currentColor"></path></g></svg>
                          </template>
                        </n-button>
                      </template>
                      进入全屏
                    </n-tooltip>
                    <n-tooltip v-if="finalType.startsWith('x-')">
                      <template #trigger>
                        <n-button :focusable="false" quaternary style="position: absolute; left: 100px" @click="showFuncModal = true" >
                          <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6"></path><path d="M12 9v6"></path><path d="M6 19a2 2 0 0 1-2-2v-4l-1-1l1-1V7a2 2 0 0 1 2-2"></path><path d="M18 19a2 2 0 0 0 2-2v-4l1-1l-1-1V7a2 2 0 0 0-2-2"></path></g></svg>                        </template>
                        </n-button>
                      </template>
                      使用占位符
                    </n-tooltip>
                    <div id="form-code-language-select">
                      <n-select
                          :focusable="false"
                          v-model:value="codeTemplate.type"
                          filterable
                          show-on-focus
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
                <!--                  <n-input-->
                <!--                      v-model:value="codeTemplate.code"-->
                <!--                      :placeholder="placeholders?.code ?? '请输入代码片段'"-->
                <!--                      type="textarea"-->
                <!--                      size="small"-->
                <!--                      style="padding-top: 40px;padding-bottom: 10px;"-->
                <!--                      wrap="off"-->
                <!--                      rows="9"-->
                <!--                      :disabled="!properties.code"-->
                <!--                      @keydown="handleKeyDown"-->
                <!--                      ref="codeTextArea"-->
                <!--                      show-count-->
                <!--                      :autosize="{minRows: 9,maxRows: 9}"-->
                <!--                  />-->
                  <code-editor v-model="codeTemplate.code"
                               ref="codeEditorRef"
                               font-size="14px"
                               height="220px"
                               :header="false"
                               padding="5px"
                               line-nums
                               @exit-full-screen="requestFullScreen(false)" width="100%" :languages="language"/></div>
              </n-tab-pane>

              <n-tab-pane name="link" tab="关联" :disabled="formProperties.codeSource === 'code'">
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
                        <n-button v-if="codeTemplate.conf" @click="openConfModal(null)" style="position: absolute; right:50px; bottom: 0px;" :color="$normal.theme.globalColor" quaternary circle :disabled="!properties.code">
                          <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M10 4h4v4h-4zM4 16h4v4H4zm0-6h4v4H4zm0-6h4v4H4zm12 0h4v4h-4zm-5 13.86V20h2.1l5.98-5.97l-2.12-2.12zm3-5.83V10h-4v4h2.03zm6.85-.47l-1.41-1.41c-.2-.2-.51-.2-.71 0l-1.06 1.06l2.12 2.12l1.06-1.06c.2-.2.2-.51 0-.71z" fill="currentColor"></path></svg>                        </template>
                        </n-button>
                        <n-button @click="handleClearPath()" quaternary circle style="position: absolute; right:0; bottom: 0px;" type="error" :disabled="!properties.code">
                          <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
                          </template>
                        </n-button>
                      </div>
                      <n-ellipsis style="max-width: 600px;margin-left: 8px;margin-top: 10px">
                        {{(codeTemplate.dir&&!codeTemplate.ref)? '📢无预设内容，其内容受父目录控制':codeTemplate.path}}
                      </n-ellipsis>
                    </n-list-item>
                  </n-list>
                </template>
                <template v-else>
                  <template v-if="formProperties.linkType !== 'dir'">
                    <n-divider title-placement="left">
                      文件
                    </n-divider>
                    <n-button @click="importLocalFile" quaternary type="primary">本地文件</n-button>
                    <n-button @click="showInternetLinkModal = true" quaternary type="info" >网络文件</n-button>
                  </template>
                  <template v-if="formProperties.linkType !== 'file'">
                    <n-divider title-placement="left">
                      目录
                    </n-divider>
                    <n-button @click="importLocalDir" quaternary type="primary" v-if="!GLOBAL_HIERARCHY.currentPrefixIdStr">本地目录</n-button>
                    <n-button @click="setAsNormalDir" quaternary type="info" >普通目录</n-button>
                    <n-button @click="showCustomHiearchyModal = true" quaternary type="error" >自定义目录</n-button>
                  </template>
                </template>
              </n-tab-pane>
            </n-tabs>
          </template>
        </n-form-item>

        <div id="form-btn">
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button :focusable="false" id="cancel" strong secondary type="warning"  @click="handleCancel">
                取消 (Q)
              </n-button>
            </template>
            {{CtrlStr+'+Q'}}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button :focusable="false" strong secondary type="success"   @click="handleUpdate">
                保存 (S)
              </n-button>
            </template>
            {{CtrlStr+'+S'}}
          </n-tooltip>
        </div>
      </n-form>
    </template>

  </div>
  <base-modal v-if="showInternetLinkModal" title="请输入链接" @cancel="showInternetLinkModal = false" @confirm="handleSetUrlAsPath">
    <n-input v-model:value="url" clearable/>
  </base-modal>
  <n-modal v-model:show="showFuncModal"
           preset="card"
           title="选择占位符"
           style="width: 66%"
           :auto-focus="false"

  >
    <n-scrollbar style="max-height: 60vh;width:100%;padding-right:10px" :x-scrollable="false">
      <func-select-pane @choose="handleChooseCommand"/>
    </n-scrollbar>
  </n-modal>
  <n-modal v-model:show="showCustomHiearchyModal" preset="card" title="自定义目录" style="width: 66%" :auto-focus="false">
    <n-popover>
      <template #trigger>
        <n-button @click="importHierarchyJS" quaternary type="primary" >💡本地代码实现</n-button>
      </template>
      <n-button type="info" @click="utools_browser_open('https://flowus.cn/share/87c95fcc-e9f2-420d-a6d3-6578cd424e58')" text>查看教程</n-button>
    </n-popover>
    <n-divider title-placement="left">预设</n-divider>
    <n-button @click="openHierarchyJS('plugin://git-repo.js')" quaternary>Github/Gitee</n-button>
  </n-modal>
</template>

<script setup>
import {
  computed,
  h,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRaw,
  watch,
} from "vue";
import {tagColorManager} from "../js/core/tag";
import {configManager} from "../js/core/config";
import {fullAlias, getFileName, getRealTypeAndValidStatus, languages} from "../js/utils/language";
import {$normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../js/store";
import {CtrlStr} from "../js/some";
import CodeEditor from '../components/lib/MyCodeEditor.vue';
import ConfigSwitch from "../components/base/ConfigSwitch.vue";
import FuncSelectPane from "../components/modal/FuncChooseModal.vue";
import NormalTag from "../components/base/NormalTag.vue";
import BaseModal from "../components/modal/BaseModal.vue";
import {GLOBAL_HIERARCHY, loadValidHierarchyJS} from "../js/hierarchy/core";
import {isNetWorkUri} from "../js/utils/common";
import {utools_browser_open} from "../js/core/base";
import {isArray as _isArray} from "lodash-es"
import {replaceRenderBlock} from "../js/core/func";
import hljs from "../js/dep/highlight-dep";

const codeEditorRef = ref()
const form = ref()
const formProperties = GLOBAL_HIERARCHY.currentConfig.form;
const properties = formProperties.allowUpdatedProperties;
const placeholders = formProperties.placeholders;
const edit = $reactive.currentMode === EDIT_VIEW;
const codeTemplate = reactive(edit?{...toRaw($reactive.currentSnippet)} :{
  code: $normal.quickCode ?? "",
  keyword: configManager.get('default_keyword_enable')
})
const finalType = computed(()=>{
  return codeTemplate.type ?? (configManager.get('default_language') ?? 'plaintext')
})
watch(()=> codeTemplate.type,(newValue)=>{
  if(currentTab.value === 'code'){
    codeEditorRef.value?.changeLang?.([getRealTypeAndValidStatus(newValue).type])
  }
})
const renderTagSelectLabel = (option) => {
  return h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center'
        }
      },
      [
        h(
            'div',
            {
              style:{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: tagColorManager.get(option.label).background
              }
            },
            null
        ),
        h(
            'div',
            {
              style: {
                marginLeft: '12px',
                padding: '4px 0'
              }
            },
            [
              option.label
            ]
        )
      ]
  )
}
const tags = computed(()=>{
  return tagColorManager.all().map(v=>{
    return {
      label:v,
      value:v
    }
  })
})
const currentTab = ref((codeTemplate.path || codeTemplate.dir)? 'link':(formProperties.codeSource === 'link' ?'link':'code'))  // 当前Tab页
const showInternetLinkModal = ref(false)
const showFuncModal = ref(false)
const showCustomHiearchyModal = ref(false)
const language = computed(()=>{
  return [[ getRealTypeAndValidStatus(finalType.value).type]]
})
const X_PLUGIN =  {
  'after:highlight': function(result) {
    result.value = replaceRenderBlock(result.value)
  }
};
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
  {label: '\\t制表符',value: 1},
  {label: '2个空格',value: 2},
  {label: '4个空格',value: 4}
]
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
function renderCodeTypeTag({option}){
  if(option.value.length > 2 && option.value.startsWith('x-')){
    return option.label + ' （解析⚡）'
  }else if(option.value === 'image'){
    return option.label + ' （🖼️ beta）'
  }else{
    return option.label;
  }
}
function renderTag({ option, handleClose }) {
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
      },
      null
  )
}

function handleCancel(){
  $normal.keepSelectedStatus = true;
  GLOBAL_HIERARCHY.changeView(LIST_VIEW)
}
function handleUpdate(){
  form.value.validate().then(error=>{
      if(error!=null && error.length >= 0){
        window.$message.warning("请按要求填写")
      }else{
        codeTemplate.name = codeTemplate.name.trim()
        if(currentTab.value === 'code'){  // code
          if(!codeTemplate.code){
            $message.warning("代码不能为空")
            return;
          }
          codeTemplate.dir = undefined;
          codeTemplate.ref = undefined;
          codeTemplate.path = undefined;
          codeTemplate.local = undefined;
          if(codeTemplate.type === undefined){
            codeTemplate.type = configManager.get('default_language')?? 'plaintext';
          }
        }else{ // link
          if(codeTemplate.dir){ // dir
            if(codeTemplate.ref){
              if(!codeTemplate.path){
                $message.warning("请提供 [关联目录路径]")
                return;
              }
            }else{
              // normal
              codeTemplate.path = undefined;
            }
            codeTemplate.type = undefined;
          }else{ // file
            if(!codeTemplate.path){
              $message.warning("请提供 [关联项]")
              return;
            }
            if(codeTemplate.type === undefined){
              codeTemplate.type = configManager.get('default_language')?? 'plaintext';
            }
          }
          codeTemplate.code = undefined;
        }
        codeTemplate.temp = undefined;
        codeTemplate.now = undefined;
        if(edit){
          const id = codeTemplate.id ?? codeTemplate.name;
          if(id === $normal.lastQueryCodeSnippetId){
            // 发生修改，缓存失效
            $normal.lastQueryCodeSnippetId = null;
          }
          // 更新
          GLOBAL_HIERARCHY.form.createOrEdit(toRaw(codeTemplate),$reactive.currentSnippet.name)
          // 是否维持选中
          $normal.keepSelectedStatus = (codeTemplate.name === $reactive.currentSnippet.name);
        }else{
          $normal.keepSelectedStatus = false;
          GLOBAL_HIERARCHY.form.createOrEdit(toRaw(codeTemplate),null)
        }
        window.$message.success("操作成功")
        GLOBAL_HIERARCHY.changeView(LIST_VIEW,true)
      }
  },()=>{
    window.$message.warning("请按要求填写")
  })
}
function requestFullScreen(isFullScreen) {
  if(isFullScreen){
    // codeEditorRef.value.$el.requestFullscreen()
    $reactive.form.fullScreen = true;
  }else {
    // document.exitFullscreen();
    $reactive.form.fullScreen = false;
  }
}
/**
 *
 * @param {KeyboardEvent} e
 */
function keyDownHandler(e){
  if(showInternetLinkModal.value){
    return
  }
  if($reactive.common.variableActive){
    return;
  }
  if(e.code === 'F11'){
    if(currentTab.value !== 'code'){
      return;
    }
    e.preventDefault();
    $reactive.form.fullScreen = !$reactive.form.fullScreen;
  }
  if(e.ctrlKey){
    if(e.code === 'KeyQ'){
      if(currentTab.value === 'code' && $reactive.form.fullScreen){
        $reactive.form.fullScreen = false;
        return;
      }
      handleCancel();
    }else if(e.code === 'KeyS'){
      if(currentTab.value === 'code' && $reactive.form.fullScreen){
        $reactive.form.fullScreen = false;
        return;
      }
      handleUpdate();
      e.preventDefault();
    }
  }else if(e.altKey){
    if(e.code === 'KeyX'){
      if(!codeTemplate.dir && !showFuncModal.value){
        if(codeTemplate.type){
          if(codeTemplate.type.startsWith('x-')){
            codeTemplate.type = codeTemplate.type.slice(2)
          }else{
            codeTemplate.type = 'x-'+codeTemplate.type
          }
        }else{
            codeTemplate.type = 'x-plaintext'
        }
      }
    }else if(e.code === 'KeyC'){
      if(currentTab.value === 'code'){
        if(codeTemplate.type){
          if(!codeTemplate.type.startsWith('x-')){
            codeTemplate.type = 'x-'+codeTemplate.type
          }
        }else{
          codeTemplate.type = 'x-plaintext'
        }
        showFuncModal.value =  ! showFuncModal.value;
      }
    }else if(e.code === 'KeyZ'){
      $reactive.common.shortcutActive = ! $reactive.common.shortcutActive
    }else if(e.code === 'KeyQ'){
      if(formProperties.codeSource !== "code" && formProperties.linkType !== "dir"){
        if(currentTab.value === 'code'){
          currentTab.value = 'link'
        }
        importLocalFile()
      }
    }else if(e.code === 'KeyW'){
      if(formProperties.codeSource !== "code"  && formProperties.linkType !== "dir"){

        if(currentTab.value === 'code'){
          currentTab.value = 'link'
        }
        showInternetLinkModal.value = true
      }
    }else if(e.code === 'KeyA'){
      if(formProperties.codeSource !== "code"  && formProperties.linkType !== "file"){

        if(currentTab.value === 'code'){
          currentTab.value = 'link'
        }
        importLocalDir()
      }
    }else if(e.code === 'KeyS'){
      if(formProperties.codeSource !== "code"  && formProperties.linkType !== "file"){
        if(currentTab.value === 'code'){
          currentTab.value = 'link'
        }
        setAsNormalDir();
      }
    }else if(e.code === 'KeyD'){
      if(formProperties.codeSource !== "code"  && formProperties.linkType !== "file"){
        if(currentTab.value === 'code'){
          currentTab.value = 'link'
        }
        importHierarchyJS()
      }
    }else if(e.code === 'KeyK'){
      codeTemplate.keyword = ! codeTemplate.keyword;
    }else if(e.code === 'KeyF'){
      if(currentTab.value !== 'code'){
        return;
      }
      $reactive.form.fullScreen = !$reactive.form.fullScreen;
    }
  }
}
function handleChooseCommand(command){
  showFuncModal.value = false;
  if(codeTemplate.code){
    const start =codeEditorRef.value.$refs.textarea.selectionStart;
    codeTemplate.code =
        codeTemplate.code.slice(0,start)
        + "{{"+command+"}}"
        +codeTemplate.code.slice(start)
  }else{
    codeTemplate.code = "{{"+command+"}}"
  }
}
function handleTypeChange(){
  if(GLOBAL_HIERARCHY.currentHierarchy.inline){
    codeTemplate.type = fullAlias(codeTemplate.type)
  }
}

onMounted(()=>{
  watch(()=> codeTemplate.type,(newValue) =>{
    hljs.removePlugin(X_PLUGIN);
    const type = newValue ?? (configManager.get('default_language') ?? 'plaintext')
    if(type.startsWith('x-')){
      hljs.addPlugin(X_PLUGIN)
    }
  },{
    immediate: true,
    flush: 'pre'
  })
  document.addEventListener('keydown',keyDownHandler)
})
onUnmounted(()=>{
  hljs.removePlugin(X_PLUGIN)
  document.removeEventListener('keydown',keyDownHandler)
  $reactive.form.fullScreen = false;
})
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
function setSnippetNameWhenUrl(url) {
  if(!codeTemplate.name){
    codeTemplate.name = getFileName(url);
  }
}
function importLocalFile(){
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
    setSnippetNameWhenUrl(path);
    // 解析类型
    const index = path.lastIndexOf('.');
    if(index === -1){
      codeTemplate.type = configManager.get('default_language')?? 'plaintext';
    }else{
      codeTemplate.type = fullAlias(path.slice(index +1).toLowerCase())
    }
  }
}
function importLocalDir(){
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
    setSnippetNameWhenUrl(realPathList[0]);
    // 解析类型
    codeTemplate.dir = true;
    codeTemplate.ref = "local";
  }
}
function openConfModal(config){
  if(!config){
    const hierarchy = loadValidHierarchyJS(codeTemplate.path);
    if(hierarchy && hierarchy.conf) {
      config = hierarchy.conf
    }
  }
  if(!config){
    $message.warning('无配置项')
    return
  }
  if(!codeTemplate.conf){
    codeTemplate.conf = {}
  }
  const variables = [];
  const defaultValues = {};
  for (let key in config) {
    const item = config[key];
    const isValidOptions = _isArray(item.value) && item.value.length > 0;
    variables.push([key, isValidOptions? "select":"input",item.name])
    if(isValidOptions){
      // conf
      if(codeTemplate.conf && key in codeTemplate.conf){
        defaultValues[key] = Array.from(new Set([codeTemplate.conf[key].toString(),...item.value]))
      }else{
        defaultValues[key] = item.value;
      }
    }else {
      defaultValues[key] = (codeTemplate.conf && key in codeTemplate.conf)? codeTemplate.conf[key]: item.value;
    }
  }
  $normal.funcs.snippetName = '自定义目录配置项'
  $normal.funcs.variables = variables;
  $normal.funcs.defaultValues = defaultValues;
  $reactive.common.variableActive = true;
  $normal.funcs.syncDataFunc = syncData;

}
function syncData(results){
  const obj = {};
  for (const result of results) {
    obj[result.name] = result.value;
  }
  codeTemplate.conf = obj;
}
function openHierarchyJS(path){
  if(showCustomHiearchyModal.value){
    showCustomHiearchyModal.value = false
  }
  const hierarchy = loadValidHierarchyJS(path);
  if(hierarchy){
    codeTemplate.path = path;
    setSnippetNameWhenUrl(path);
    // 解析类型
    codeTemplate.dir = true;
    codeTemplate.ref = "custom";
    if(hierarchy.conf){
      openConfModal(hierarchy.conf);
    }
  }else {
    $message.warning("无效的自定义目录代码实现文件")
  }
}
function importHierarchyJS(){
  const realPathList = utools.showOpenDialog({
    title: '指定你的【自定义目录】代码实现文件' ,
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '确定',
    properties: [
      'openFile'
    ],
    filters:[
      {
        name: 'js',
        extensions: ['js','javascript']
      }
    ]
  })
  if (realPathList != null) {
    openHierarchyJS(realPathList[0])
  }
}
function setAsNormalDir() {
  codeTemplate.dir = true;
  codeTemplate.ref = undefined;
}
function handleSetUrlAsPath(){
  if(url.value && isNetWorkUri(url.value)){
    codeTemplate.path = url.value;
    setSnippetNameWhenUrl(url.value);
    showInternetLinkModal.value = false;
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

<style lang="scss" scoped>

#form-code{
  box-sizing: border-box;
  width: 100%;
  border-radius: 5px;
  border: 2px solid transparent;
  transition: all .3s;
  z-index: 1000;
}
#form-code:hover{
  border-color: #ccc;
}
#dark-app #form-code:hover{
  border-color: #555758;
}
#form-code-top-nav{
  position: relative;
  //top: 0;
  //left: 0;
  width: 100%;
  height: 37px;
  box-sizing: border-box;
  background: white;
  border-bottom: 1px solid #efeff2;
  padding: 1px;
  z-index: 3;
}
#dark-app #form-code-top-nav{
  border-bottom-color: #848586;
  background:#454647;
}
#dark-app #form-view #form-code .code-editor{
  background:#454647 ;
}
#form-code-language-select{
  width:230px;
  float: right;
  border-left: 2px solid #efeff2;
}
#dark-app #form-code-language-select{
  border-left-color: #646666;
}
#form-btn{
  position: fixed;
  bottom: 40px;
  width: 100%;
  display: flex;
  justify-content: center;

  .n-button{
    width: 100px;
  }
}
#cancel{
  margin-right: 20px;
}

.n-card{
  padding-bottom: 50px;
}
.n-form-item {
  --n-feedback-padding: 2px 0 0 2px;
  --n-feedback-font-size: 12px;
  --n-feedback-height: 22px !important;
}
.n-form .n-form-item:nth-child(3){
  --n-feedback-height: 10px !important;
}

</style>