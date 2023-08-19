<template>
  <div  id="code-view">
    <n-scrollbar
        style="max-height: 100vh"
        :x-scrollable="!pair.renderable || !$var.view.isRendering"
        trigger="hover" ref="scrollBar">
      <template v-if="refreshFlag">
        <template v-if="pair.renderable && $var.view.isRendering">
          <template v-if="pair.type === 'image'">
            <img :src="snippet.path??snippet.code" alt="图片加载失败了哦" style="width: 100vw;">
          </template>
          <template v-else-if="pair.type === 'markdown' || pair.type === 'md'">
            <v-md-preview :text="$var.currentCode" ></v-md-preview>
          </template>
          <template v-else>
            未知渲染类型
          </template>
        </template>
        <template v-else>
          <div class="hljs-container" v-code>
            <template v-if="pair.valid">
              <highlightjs :language="pair.type" :autodetect="false" :code="pair.code" width="100%"/>
            </template>
            <template v-else>
              <highlightjs language="plaintext" :autodetect="false" :code="pair.code" width="100%"/>
            </template>
            <div class="hljs-line-container">
              <template v-for="(section,sindex) in snippet.sections">
                <div class="hljs-line-item"
                     v-for="(line,lindex) in section_generate(section)"
                     :style="{
                       color: configManager.getGlobalColor(),
                        backgroundColor:configManager.getColor('HighlightColor'),
                   top: (22*line-22)+'px'}">{{lindex === 0? (sindex <9? getNumShow(sindex): ''):''}}</div>
              </template>
            </div>
          </div>
        </template>
        <div class="bottom"></div>
      </template>
    </n-scrollbar>
    <div id="extra">
      <n-space>
        <template v-if="snippet.path && pair.type !=='image'">
          <n-button quaternary
                    @click="updateCachedCode"
                    :color="configManager.getGlobalColor()">
            {{  snippet.code? '🌝已缓存 [B]': '未缓存 [B]' }}
          </n-button>
        </template>
        <template v-if="pair.renderable">
          <n-button quaternary
                    @click=" $var.view.isRendering = !$var.view.isRendering"
                    :color="configManager.getGlobalColor()"
                    :disabled="pair.type === 'image' && snippet.path"
          >
            {{ $var.view.isRendering? '✨已渲染 [R]': '未渲染 [R]' }}
          </n-button>
        </template>
        <n-popover trigger="hover" :show="hover || $var.view.showCodeTip" placement="top" :show-arrow="false" style="padding:5px">
          <template #trigger>
            <n-button
                @mouseenter="hover = true"
                @mouseleave="hover = false"
                quaternary :color="configManager.getGlobalColor()">🚀{{ (snippet.type??'plaintext')+' [S]' }}</n-button>
          </template>
          <n-list hoverable clickable :show-divider="false" @mouseenter="hover = true" @mouseleave="hover = false">
            <n-list-item >
              <div align="center">{{snippet.name}}</div>
            </n-list-item>
            <n-list-item  v-if="snippet.desc != null">
              <div>{{"📢 "+snippet.desc}}</div>
            </n-list-item >
            <n-list-item  v-if="snippet.tags && snippet.tags.length > 0">
              <div>{{"🔖 "+snippet.tags.join()}}</div>
            </n-list-item >
            <n-list-item >
              <div>{{`⏰ ${calculateTime(snippet.time)} 🎲${snippet.count??0}`}}</div>
            </n-list-item>
            <n-list-item >
              <div>{{`📃 ${pair.count}字`}}</div>
            </n-list-item>
            <n-list-item  v-if="snippet.sections && snippet.sections.length > 0">
              <div>{{`🧩 ${snippet.sections.length}个子代码片段`}}</div>
            </n-list-item >
          </n-list>
        </n-popover>

        <n-button strong quaternary circle :color="configManager.getGlobalColor()"  @click="handleClose">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z" fill="currentColor"></path></svg>
          </template>
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import {codeSnippetManager, configManager, formatManager} from "../js/core.js";
import {computed, onMounted, ref, toRaw, watch} from "vue";
import {handleRecoverLiteShow, isSupportedLanguage} from "../js/some.js";
import {$var, LIST_VIEW} from "../js/store";
import {section_generate} from "../js/utils/section";
import {calculateTime, getRefreshFunc} from "../js/utils/common";

const scrollBar = ref(null)
const snippet = $var.currentSnippet;
$var.currentCode = getCode()
const hover = ref(false)
const refreshFlag = ref(true)
const pair = computed(()=>{
  // 分析类型
  const result = {};
  if(snippet.type){
    if(snippet.type.length>2 && snippet.type.startsWith('x-')){
      result.type = snippet.type.slice(2);
    }else{
      result.type = snippet.type;
    }
    if(result.type === 'md'){
      result.type = 'markdown';
    }else if(result.type === 'image'){
      $var.view.isRendering = true;
    }
    result.valid = isSupportedLanguage(result.type)
    result.renderable = (result.type === 'markdown' || result.type === 'image' || result.type === 'md')
  }else{
    result.type = 'plaintext';
  }
  if($var.currentCode){
    result.count = $var.currentCode.length;
    if($var.currentCode.length > 100000){
      $message.info("代码长度超限，只会显示前100000个字符")
      result.code = $var.currentCode.slice(0,100000)
    }else{
      result.code = $var.currentCode;
    }
  }else{
    result.count = 0;
    result.code = '';
  }
  return result;
})

const doRefresh = getRefreshFunc(refreshFlag,()=>{
  // 滚动条重新绑定
  $var.scroll.codeInvoker = scrollBar.value;
})
function getCode(){
  if(snippet.path){
    if(snippet.code){
      return snippet.code;
    }else{
      return getCodeFromPath();
    }
  }
  return snippet.code;
}
function getCodeFromPath(){
  if(snippet.local){
    try{
      return window.preload.readConfig(snippet.path)?? '[本地内容为空]'
    }catch (e){
      $message.error(e.message)
      return `😅加载失败: 本地文件[ ${snippet.path} ]`
    }
  }else if(snippet.type !== 'image' && snippet.type !== 'x-image'){
    fetch(snippet.path).then(resp=>{
      if(resp.ok){
        resp.text().then(value=>{
          // 刷新页面
          $var.currentCode = value;
          doRefresh();
        })
      }else{
        $var.currentCode = "网络文件[ "+snippet.path +" ]数据抓取失败!"
      }
    })
    return "网络文件[ "+snippet.path +" ]数据正在获取中..."
  }
}
const handleClose = ()=>{
  $var.view.showCodeTip = false;
  $var.utools.keepSelectedStatus = true;
  handleRecoverLiteShow();
  $var.currentMode = LIST_VIEW;
}
function updateCachedCode(){
  if(snippet.code){   // 清除缓存
    snippet.code = undefined;
    $var.currentCode = getCodeFromPath();  // 抓取数据
  }else{  // 添加缓存
    snippet.code = $var.currentCode;
  }
  codeSnippetManager.update(toRaw(snippet))
}
function getNumShow(num){
  return ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'][num]
}
const _darkFormatBlockStyle = "color:#ffa400;border-radius:3px;background-color:#414141;font-weight: bolder;"
const _lightFormatBlockStyle = "color:#ffa400;border-radius:3px;background-color:#f1f1f1;font-weight: bolder;";
const _errorFormatBlockStyle = "color:red";

onMounted(()=>{
    $var.others.updateCacheCodeFunc = updateCachedCode
    $var.scroll.codeInvoker = scrollBar.value;
    if(snippet.type && snippet.type.length>2 && snippet.type.startsWith('x-')){
      watch(()=>$var.view.isRendering,(newValue)=>{
        const codeViewer = document.querySelector(newValue? '#code-view  div.v-md-editor-preview > div.github-markdown-body':'#code-view pre > code')
        if(codeViewer){
          codeViewer.innerHTML = codeViewer.innerHTML.replace(/#{.+?}#/g,(substring)=>{
            const temp = substring.slice(2,-2);
            let style = utools.isDarkColors()? _darkFormatBlockStyle:_lightFormatBlockStyle;
            if(!temp.startsWith('@')  && !formatManager.contain(temp)){
              style = _errorFormatBlockStyle;
            }
            return `<span style="${style}">${substring}</span>`
          })
        }
      },{
        flush:'post',
        immediate:true
      })

    }
})


</script>

<style >
#bg{
  background-color: white;
}
#code-view{
  position: relative;
}

#dark-app .github-markdown-body div[class*=v-md-pre-wrapper-]{
  background-color: #242425;
}
#extra{
  position: fixed;
  right:20px;
  bottom: 12px;
  z-index: 10;
}
.n-list-item{
  height: 32px;
  padding: 0 5px
}
#code-view .hljs-container pre{
  width: 100%;
  padding-left: 10px;
  z-index: 1;
  background: transparent;
}
#code-view pre code  {
  line-height: 22px;
  z-index: 2;
  background: transparent;
}
#code-view pre code > *{
  z-index: 100;
  background: transparent;
}

#code-view pre code.hljs::selection{
  background-color: rgba(0,0,0,.1) !important;
}
#code-view pre code.hljs span::selection{
  background-color: rgba(0,0,0,.1) !important;
}
#dark-app #code-view pre code.hljs::selection{
  background-color: rgba(255,255,255,.1) !important;
}
#dark-app #code-view pre code.hljs span::selection{
  background-color: rgba(255,255,255,.1) !important;
}

.hljs-container {
  position: relative;
  display: flex;
  padding-top: 4px;
  padding-bottom: 8px;
}
.hljs-line-container{
  position: absolute;
  width: 100%;
}
.hljs-line-item{
  position: absolute;
  font-size: 12px;
  line-height: 12px;
  height: 12px;
  padding: 5px 0;
  width: 100%;
  z-index: 0;
}


.bottom{
  height: 40px;
  width: 100%;
}

/** 行数样式 */
.hljs-code-number {
  padding: 0 10px 0 10px;
  color: #999;
  font-size: 14px;
  list-style: none;
  border-right: 1px solid #dcdfe5;
  user-select:none;
  z-index: 1;
}
#dark-app .hljs-code-number{
  color: #666;
  border-right-color:  #3a3c41;
}
.hljs-code-number :first-child{
  margin-top: 0;
}
.hljs-code-number li{
  line-height: 12px;
  padding: 5px 0;
  font-size: 14px;
  text-align: center;
  z-index: 2;
  //line-height: 1.6;
}

#dark-app .v-md-editor {
  background-color: transparent !important;
}
#dark-app .v-md-editor.v-md-editor--edit {
  background-color: transparent;
}
#dark-app .v-md-editor__toolbar {
  background-color: transparent;
  color: #ddd;
}
#dark-app .v-md-textarea-editor textarea{
  background-color: transparent;
  color: #ddd !important;
}

#dark-app .github-markdown-body  {
  color: #ccc !important;
}
#dark-app .github-markdown-body table{
  background-color: #313134;
}
#dark-app .github-markdown-body table thead  tr{
  background-color: #313134;
}
#dark-app .github-markdown-body table tr{
  background-color: #353539;
  border-top-color: #313134;
}
#dark-app .github-markdown-body table tr:nth-child(2n){
  background-color: #313134;
}
#dark-app .github-markdown-body table td, #dark-app .github-markdown-body table th{
  border-color: #444 !important;
}
#dark-app .github-markdown-body blockquote{
  border-left-color: #515154;
}
#dark-app .github-markdown-body h1, #dark-app .github-markdown-body h2{
  border-bottom-color: #515154;
}

</style>