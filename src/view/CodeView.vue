<template>
  <div  id="code-view" class="kit-top">
    <n-scrollbar
        style="max-height:100vh"
        :x-scrollable="!pair.renderable || !$reactive.view.isRendering"
        trigger="hover" ref="scrollBar">
      <template v-if="refreshFlag">
        <template v-if="pair.renderable && $reactive.view.isRendering">
          <template v-if="pair.type === 'image'">
            <img :src="snippet.path??snippet.code" alt="图片加载失败了哦" style="width: 100vw;">
          </template>
          <template v-else-if="pair.type === 'markdown' || pair.type === 'md'">
            <v-md-preview :beforeChange="beforeChangeFunc" @change="whenRender" :text="$reactive.currentCode" ></v-md-preview>
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
                    @click=" $reactive.view.isRendering = !$reactive.view.isRendering"
                    :color="configManager.getGlobalColor()"
                    :disabled="pair.type === 'image' && snippet.path"
          >
            {{ $reactive.view.isRendering? '✨已渲染 [R]': '未渲染 [R]' }}
          </n-button>
        </template>
        <n-popover trigger="hover" :show="hover || $reactive.view.codeTipActive" placement="top" :show-arrow="false" style="padding:5px">
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
  <n-modal v-model:show="show">
    <img :src="url" alt="图片加载失败了哦" style="max-height: 90vh;">
  </n-modal>
</template>

<script setup>
import {codeSnippetManager} from "../js/core/snippet";
import {configManager} from "../js/core/config";
import {computed, nextTick, onMounted, onUnmounted, ref, toRaw, watch} from "vue";
import {section_generate} from "../js/utils/section";
import {calculateTime, getRealTypeAndValidStatus, getRefreshFunc, renderFormatBlock} from "../js/utils/common";
import {$normal, $reactive, LIST_VIEW, navigateView} from "../js/store";

const scrollBar = ref(null)
/**
 * @type CodeSnippet
 */
const snippet = $reactive.currentSnippet;
$reactive.currentCode = getCode()
const hover = ref(false)
const refreshFlag = ref(true)
const show = ref(false)
const url = ref()
const pair = computed(()=>{
  // 分析类型
  const result = getRealTypeAndValidStatus(snippet.type);
  if(result.type === 'image'){
    $reactive.view.isRendering = true;
  }
  result.renderable = (result.type === 'markdown' || result.type === 'image')
  if($reactive.currentCode){
    result.count = $reactive.currentCode.length;
    if($reactive.currentCode.length > 100000){
      $message.info("代码长度超限，只会显示前100000个字符")
      result.code = $reactive.currentCode.slice(0,100000)
    }else{
      result.code = $reactive.currentCode;
    }
  }else{
    result.count = 0;
    result.code = '';
  }
  return result;
})

const doRefresh = getRefreshFunc(refreshFlag,()=>{
  // 滚动条重新绑定
  $normal.scroll.codeInvoker = scrollBar.value;
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
          $reactive.currentCode = value;
          doRefresh();
        })
      }else{
        $reactive.currentCode = "网络文件[ "+snippet.path +" ]数据抓取失败!"
      }
    })
    return "网络文件[ "+snippet.path +" ]数据正在获取中..."
  }
}
const handleClose = ()=>{
  $reactive.view.codeTipActive = false;
  $normal.keepSelectedStatus = true;
  navigateView(LIST_VIEW)
}
function updateCachedCode(){
  if(snippet.code){   // 清除缓存
    snippet.code = undefined;
    $reactive.currentCode = getCodeFromPath();  // 抓取数据
  }else{  // 添加缓存
    snippet.code = $reactive.currentCode;
  }
  codeSnippetManager.update(toRaw(snippet))
}
function getNumShow(num){
  return ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'][num]
}
const handleClickUrl = (e)=>{
  const a = e.target.closest('.github-markdown-body a')
  if(a){
    console.dir(a)
    if(a.dataset['vMdAnchor']){
      // const heading = document.querySelector('.github-markdown-body').querySelector()
      const heading = document.querySelector(`.github-markdown-body [data-v-md-heading=${a.dataset['vMdAnchor']}]`)
      if(heading){
        $normal.scroll.codeInvoker?.scrollTo({
          top: heading.getBoundingClientRect().y - 100,
          behavior: 'smooth'
        })
      }
    }else if(a.href && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      utools.shellOpenExternal(a.href)
    }
  }
}

let cachedImageUrls = null;
let count = -1;
/**
 * 实现渲染本地相对图片
 * @param {string} text
 * @param {(string)=> void} next
 */
const beforeChangeFunc = (text,next) =>{
  count = -1;
  if(snippet.path && snippet.local) {
    cachedImageUrls = new Map();
    const localDir = window.preload.getDirname(snippet.path)
    text = text.replace(/!\[(.*?)]\((.*?)\)/g, (match, name, url) => {
      count ++;
      if(url){
        if(url.startsWith('http://') || url.startsWith('https://')){
          return match
        }else if(url.startsWith('./') || url.startsWith('../')){
          // 本地相对路径
          cachedImageUrls.set(count,window.preload.getFinalPath(localDir, url))
          // const abs = window.preload.encodeBase64(window.preload.getFinalPath(localDir, url))
          // return `<a href="https://file:::${abs}">${name}[本地图片需要预览显示]</a>`
        }else{
          // 本地绝对路径
          cachedImageUrls.set(count,url);
        }
      }
      return match
    })
    text = text.replace(/^\[TOC\]$/gm,"[[TOC]]")
  }else{
      cachedImageUrls = null;
  }
  next(text)
}
/**
 * 实现渲染本地相对图片
 *
 */
function whenRender(text,html){
  if(count === -1){
    return
  }
  nextTick(()=>{
    document.querySelectorAll('.github-markdown-body img').forEach((value,index)=>{
      value.parentElement.style.textAlign = 'center'
      if(cachedImageUrls && cachedImageUrls.has(index)){
        value.src = cachedImageUrls.get(index)
      }
    })
  })

}

onMounted(()=>{
    $normal.updateCacheCodeFunc = updateCachedCode
    $normal.scroll.codeInvoker = scrollBar.value;
    if(snippet.type && snippet.type.length>2 && snippet.type.startsWith('x-')){
      renderFormatBlock(pair.value.renderable && $reactive.view.isRendering)
      watch(()=>$reactive.view.isRendering,(newValue)=>{
        renderFormatBlock(newValue)
      },{
        flush:'post',
        immediate:true
      })
    }
    document.addEventListener('click',handleClickUrl)
})
onUnmounted(()=>{
  document.removeEventListener('click',handleClickUrl)
})


</script>

<style >
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
  padding-right: 10px;
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
}
.github-markdown-body h1{
  text-align: center;
  border-bottom-color: transparent;
}

.github-markdown-body img{
  background-color: transparent;
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
.github-markdown-body{
  background-image: linear-gradient(90deg, rgba(60, 10, 30, .04) 3%, transparent 0), linear-gradient(1turn, rgba(60, 10, 30, .04) 3%, transparent 0);
  background-size: 20px 20px;
  background-position: 50%;
}
#dark-app .github-markdown-body  {
  background-image: linear-gradient(90deg, rgba(145, 142, 142, 0.04) 3%, transparent 0), linear-gradient(1turn, rgba(201, 194, 197, 0.04) 3%, transparent 0);
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
#dark-app .github-markdown-body h2, #dark-app .github-markdown-body h1{
  border-bottom-color: #515154;
}
#dark-app .github-markdown-body code:not(pre) {
  background-color: #414141;
}
#dark-app .github-markdown-body pre code {
  background-color: unset;
}
#dark-app .github-markdown-body a {
  color: #1c84f9;
}

</style>