<template>
  <div id="form-view">
    <template v-if="$reactive.form.fullScreen">
      <code-editor v-model="codeTemplate.code"
                   ref="codeEditorRef"
                   height="calc( 100vh - 18px )"
                   history-key="code"
                   :placeholder="placeholders?.code"
                   @exit-full-screen="requestFullScreen(false)"
                   :languages="language"/>
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
                      <svg-star/>
                    </template>
                    <template v-else>
                      <svg-star-off/>
                    </template>
                  </template>
                </n-button>
              </template>
              注册为uTools功能关键字
            </n-tooltip>
          </template>
        </n-form-item>

        <n-form-item label="描述" path="desc">
          <n-input v-model:value="codeTemplate.desc" :placeholder="placeholders?.desc ?? '请输入描述（可选）'" clearable :disabled="!properties.desc" />
        </n-form-item>

        <n-form-item label="标签" path="tags" >
          <n-select
              v-model:value="codeTemplate.tags"
              filterable
              multiple
              tag
              show-on-focus
              :placeholder="placeholders?.tags ?? '请选择或输入标签（可选）'"
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
                <div id="form-image" v-if="codeTemplate.image">
                  <n-scrollbar style="padding-right: 10px">
                    <utools-image class="core-image" :url="codeTemplate.imgUrl" :id="codeTemplate.imgId" style="width: 100%;"/>
                  </n-scrollbar>
                  <div class="clear-image">
                    <n-button  circle type="error" quaternary @click="handleClearImage">
                      <template #icon>
                        <svg-close/>
                      </template>
                    </n-button>
                  </div>

                </div>
                <div id="form-code"
                     :style="{
                        borderColor: dragTrigger ? configManager.getGlobalColor() : ''
                     }"
                     v-else>
                  <div id="form-code-top-nav">
                    <n-space style="position: absolute;" :size="[0,0]">
                      <n-popover>
                        <template #trigger>
                          <n-button :focusable="false" quaternary>
                            <template #icon>
                              <svg-setting/>
                            </template>
                          </n-button>
                        </template>
                        <n-space align="center">
                          Tab 缩进：
                          <n-select
                              size="small"
                              :options="tabOptions"
                              :default-value="configManager.get('default_tab')??1"
                              :theme-overrides="selectThemeOverrides"
                              @update-value="v=> configManager.set('default_tab',v)"
                              style="width: 194px"
                          />
                        </n-space>
                        <n-space align="center">
                          默认语言：
                          <language-select is-on-default-setting-mode size="small"/>
                        </n-space>
                        <config-switch title="默认是否注册uTools关键字" config="default_keyword_enable"/>
                      </n-popover>
                      <n-tooltip>
                        <template #trigger>
                          <n-button :focusable="false" quaternary @click="handleChooseLocalImage">
                            <template #icon>
                              <svg-image2/>
                            </template>
                          </n-button>
                        </template>
                        选取图片
                      </n-tooltip>
                      <n-tooltip>
                        <template #trigger>
                          <n-button :focusable="false" quaternary @click="handleScreencut">
                            <template #icon>
                              <svg-screencut/>
                            </template>
                          </n-button>
                        </template>
                        屏幕截图
                      </n-tooltip>
                      <n-tooltip>
                        <template #trigger>
                          <n-button :focusable="false" quaternary @click="requestFullScreen(true)" >
                            <template #icon>
                              <svg-enter-fullscreen/>
                            </template>
                          </n-button>
                        </template>
                        进入全屏
                      </n-tooltip>
                      <n-tooltip v-if="finalType.startsWith('x-')">
                        <template #trigger>
                          <n-button :focusable="false" quaternary  @click="showFuncModal = true" >
                            <template #icon>
                              <svg-command/>
                            </template>
                          </n-button>
                        </template>
                        使用占位符
                      </n-tooltip>
                    </n-space>
                    <div id="form-code-language-select">
                      <language-select v-model:language="codeTemplate.type" :disabled="!properties.type"/>
                    </div>
                  </div>
                  <code-editor  v-model="codeTemplate.code"
                                ref="codeEditorRef"
                                height="220px"
                                history-key="code"
                                :placeholder="placeholders?.code"
                                @insert-image="handleInsertImage"
                                @img-drag-trigger = "e => dragTrigger = e"
                                @img-drop="handleImageDrop"
                                @exit-full-screen="requestFullScreen(false)"
                                :languages="language"/>
                </div>
              </n-tab-pane>
              <n-tab-pane name="link" tab="关联" :disabled="formProperties.codeSource === 'code'">
                <template v-if="codeTemplate.path || codeTemplate.dir">
                  <n-list hoverable clickable :show-divider="false" style="background: transparent;margin-top:10px;">
                    <n-list-item style="height: 100px">
                      <div class="file" style="position: relative;background-color: transparent;padding-top: 5px">
                        <div style="width: 24px" ><svg-path/></div>
                        <div style="position: absolute; left: 32px; bottom: 7px">[ {{linkDesc}} ]</div>
                        <div v-if="!codeTemplate.dir" style="position: absolute; right:36px; bottom: 7px;width: 230px;height: 24px">
                          <language-select v-model:language="codeTemplate.type" :disabled="!properties.type" size="small"/>
                        </div>
                        <n-button v-if="codeTemplate.conf && codeTemplate.ref === 'custom'" @click="openConfModal(null)" style="position: absolute; right:50px; bottom: 0px;" :color="$normal.theme.globalColor" quaternary circle :disabled="!properties.code">
                          <template #icon>
                            <svg-conf/>
                          </template>
                        </n-button>
                        <n-button @click="handleClearPath()" quaternary circle style="position: absolute; right:0; bottom: 0px;" type="error" :focusable="false" :disabled="!properties.code">
                          <template #icon>
                            <svg-delete/>
                          </template>
                        </n-button>
                      </div>
                      <n-ellipsis style="max-width: 600px;margin-left: 8px;margin-top: 10px">
                        {{(codeTemplate.dir&&!codeTemplate.ref)?
                          (GLOBAL_HIERARCHY.currentHierarchy.core ? '📢 使用目录来分类管理你的代码片段；建议设置uTools关键字，从而能够快速访问该目录': '📢其内容受父目录逻辑控制')
                          :codeTemplate.path}}
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
                    <n-button @click="showCustomHiearchyModal = true" quaternary type="error" v-if="!GLOBAL_HIERARCHY.currentPrefixIdStr">自定义目录</n-button>
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
        <n-button @click="importHierarchyJS" quaternary type="primary" >本地代码实现
          <template #icon>
            <svg-tip/>
          </template>
        </n-button>
      </template>
      <n-button type="info" @click="utools_browser_open('https://flowus.cn/share/87c95fcc-e9f2-420d-a6d3-6578cd424e58')" text>查看教程</n-button>
    </n-popover>
    <n-divider title-placement="left">预设</n-divider>
    <n-button @click="openHierarchyJS('plugin://git-repo.js')" quaternary>Github/Gitee</n-button>
  </n-modal>
</template>

<script setup>
import {computed, h, onMounted, onUnmounted, reactive, ref, toRaw, watch,} from "vue";
import {tagColorManager} from "../js/utools/tag";
import {configManager} from "../js/utools/config";
import {fullAlias, getFileName, getRealTypeAndValidStatus} from "../js/utils/language";
import {$normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../js/store";
import {CtrlStr} from "../js/some";
import CodeEditor from '../components/code-editor/MyCodeEditor.vue';
import ConfigSwitch from "../components/base/ConfigSwitch.vue";
import FuncSelectPane from "../components/modal/FuncChooseModal.vue";
import NormalTag from "../components/base/NormalTag.vue";
import BaseModal from "../components/modal/BaseModal.vue";
import SvgStar from "../asserts/star.svg";
import SvgStarOff from "../asserts/star-off.svg";
import SvgSetting from "../asserts/setting.svg";
import SvgEnterFullscreen from "../asserts/enter-fullscreen.svg";
import SvgCommand from "../asserts/command.svg";
import SvgPath from "../asserts/path.svg";
import SvgConf from "../asserts/conf.svg";
import SvgDelete from "../asserts/delete.svg";
import SvgTip from "../asserts/tip.svg";
import SvgClose from "../asserts/close.svg";
import SvgImage2 from "../asserts/image2.svg";
import SvgScreencut from "../asserts/screencut.svg";

import {GLOBAL_HIERARCHY, loadValidHierarchyJS} from "../js/hierarchy/core";
import {isNetWorkUri, isXmlOrEscapeCharsExisting} from "../js/utils/common";
import {utools_browser_open} from "../js/utools/base";
import {isArray as _isArray} from "lodash-es"
import {replaceRenderBlock} from "../js/utools/func";
import hljs from "../js/dep/highlight-dep";
import UtoolsImage from "../components/base/UtoolsImage.vue";
import LanguageSelect from "../components/base/LanguageSelect.vue";
import {selectThemeOverrides} from "../js/theme";
import {removeHistory} from "../components/code-editor/history";

const codeEditorRef = ref()
const dragTrigger = ref(false)
const form = ref()
const formProperties = GLOBAL_HIERARCHY.currentConfig.form;
const properties = formProperties.allowUpdatedProperties;
const placeholders = formProperties.placeholders;
const edit = $reactive.currentMode === EDIT_VIEW;
const codeTemplate = reactive((edit || $reactive.main.isRecycleConflict)?{
  code: "",
  ...toRaw($reactive.currentSnippet)} :{
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
      message: "代码片段名 必须非空且不重复",
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
      message: "代码片段名 不能包含/",
      validator(rule, value) {
        if(value!= null){
          return !value.includes('/')
        }
      },
      trigger: ["input","blur"]
    },
    {
      message: "代码片段名 不能包含xml标签以及转义符号",
      validator(rule, value) {
        return !isXmlOrEscapeCharsExisting(value);
      },
      trigger: ["input","blur"]
    }

  ],
  "code":{
    validator(rule,value){
      if(currentTab.value === 'code' && !codeTemplate.imgUrl){
        return value && value.length > 0;
      }
      return true;
    },
    message:"代码片段不能为空"
  },
  "desc":{
    message: "描述 不能包含xml标签以及转义符号",
    validator(rule, value) {
      return !value || !isXmlOrEscapeCharsExisting(value);
    },
    trigger: ["input","blur"]
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

/**
 *
 * @param { NativeImage } image
 */
function handleInsertImage(image,format) {
  codeTemplate.imgUrl = image.toDataURL();
  codeTemplate.image = true;
  codeTemplate.nativeImage = image
  codeTemplate.imageItem = undefined;
  codeTemplate.format = format
}

function handleClearImage(){
  codeTemplate.image = undefined;
  codeTemplate.imgUrl = undefined;
  codeTemplate.format = undefined
  codeTemplate.nativeImage = undefined
  codeTemplate.imageItem = undefined
}

function handleChooseLocalImage(){
  const realPathList = utools.showOpenDialog({
    title: '选取图片' ,
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '确定',
    properties: [
      'openFile'
    ],
    filters:[
      {name: '图片', extensions: ['jpg', 'png', 'webp', 'jpeg']}
    ]
  })
  if (realPathList != null) {
    const path = realPathList[0];
    // io操作
    let buffer = preload.readFile(path);
    let blob = new Blob([buffer], { type: 'image/png' });
    codeTemplate.imgUrl = URL.createObjectURL(blob);
    codeTemplate.image = true;
    codeTemplate.format = 'image/png'
    codeTemplate.nativeImage = {
      toPNG(){
        return buffer
      }
    }
    codeTemplate.imageItem = undefined
    blob = null
  }
}
function handleImageDrop(item){
  codeTemplate.image = true;
  let reader = new FileReader();
  let file = item.getAsFile()
  reader.onload = () => {
    codeTemplate.imgUrl = reader.result;
    codeTemplate.image = true;
    codeTemplate.format = item.type
    codeTemplate.imageItem = item
    codeTemplate.nativeImage = undefined
  }
  reader.readAsDataURL(file);
}

function handleScreencut(){
  utools.screenCapture(async (imgBase64)=>{
    const response = await fetch(imgBase64)
    const blob = await response.blob();
    let reader = new FileReader();
    reader.onload = () => {
      codeTemplate.imgUrl = reader.result;
      codeTemplate.image = true;
      codeTemplate.format = 'image/png'
      codeTemplate.imageItem = {
        async arrayBuffer(){
          return new Uint8Array(await blob.arrayBuffer())
        }
      };
      codeTemplate.nativeImage = undefined
    }
    reader.readAsDataURL(blob);
  })
}

function handleCancel(){
  if($normal.quickCode){
    $normal.quickCode = undefined
  }
  $normal.keepSelectedStatus = true;
  $reactive.main.isRecycleConflict = false;
  GLOBAL_HIERARCHY.changeView(LIST_VIEW)
}
function handleUpdate(){
  form.value.validate().then(async (error)=>{
      if(error!=null && error.length >= 0){
        window.$message.warning("请按要求填写")
      }else{
        codeTemplate.name = codeTemplate.name.trim()
        if(currentTab.value === 'code'){  // code
          if(codeTemplate.image){
            codeTemplate.code = undefined;
          }else{
            if(!codeTemplate.code){
              $message.warning("代码不能为空")
              return;
            }
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
          if(!await GLOBAL_HIERARCHY.form.createOrEdit(toRaw(codeTemplate),$reactive.currentSnippet.name)){
            return;
          }
          // 是否维持选中
          $normal.keepSelectedStatus = (codeTemplate.name === $reactive.currentSnippet.name);
        }else{
          $normal.keepSelectedStatus = false;
          if(! await GLOBAL_HIERARCHY.form.createOrEdit(toRaw(codeTemplate),null)){
            return;
          }
        }
        if($normal.quickCode){
          $normal.quickCode = undefined
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
    if(currentTab.value !== 'code' || codeTemplate.image){
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
      if(!codeTemplate.dir && !codeTemplate.image && !showFuncModal.value){
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
      if(currentTab.value === 'code' && !codeTemplate.image){
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
    }else if(e.code === 'KeyK'){
      codeTemplate.keyword = ! codeTemplate.keyword;
    }else if(e.code === 'KeyF' ){
      if(currentTab.value !== 'code' || codeTemplate.image){
        return;
      }
      $reactive.form.fullScreen = !$reactive.form.fullScreen;
    }
  }
}
function handleChooseCommand(command,lite){
  showFuncModal.value = false;
  codeEditorRef.value.insertCommand(lite ? command : "{{"+command+"}}");
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
  removeHistory("code")
})
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
    codeTemplate.local = true;
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
    const hierarchy = loadValidHierarchyJS(codeTemplate.path,true);
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
  const hierarchy = loadValidHierarchyJS(path,true);
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
  codeTemplate.local = undefined;
}
function handleSetUrlAsPath(){
  if(url.value && isNetWorkUri(url.value)){
    codeTemplate.path = url.value;
    codeTemplate.local = undefined;
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
  codeTemplate.local = undefined;
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
  background-color: white;
}
#dark-app #form-code{
  background-color: transparent;
  .code-editor{
    --plugin-background-color: #454647;
    --scrollbar-thumb-background-color: #5a5a5a;
  }
}
#light-app-v5 #form-code .code-editor{
  --plugin-background-color: #ffffff;
}
#form-image{
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 48vh;
  padding: 10px;
  border-radius: 5px;
  border: 2px solid transparent;
  transition: all .3s;
  z-index: 1000;
  background-color: white;
  .core-image{
    border-radius: 6px;
  }

  .clear-image{
    position: absolute;
    top: 10px;
    right: 10px;
  }

}
#dark-app #form-image{
  background-color: #454647;
}
#form-image:hover{
  border-color: #ccc;
}
#form-code:hover{
  border-color: #ccc;
}
#dark-app #form-code:hover{
  border-color: #555758;
}#dark-app #form-image:hover{
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