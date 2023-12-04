<template>
  <v-md-preview
      :beforeChange="storeLocalImageUrlBeforeMdChange"
      @change="assignLocalImageUrlWhenMdRender"
      :text="$reactive.currentCode"
      @copy-code-success="copyCodeSuccess"
      ref="preview"
  ></v-md-preview>
  <n-drawer v-model:show="$reactive.code.tocActive" :width="300" placement="right">
    <n-drawer-content title="目录">
      <div
          v-for="anchor in tocTitles"
          class="toc-link"
          :style="{ padding: `10px 0 10px ${anchor.indent * 20}px` }"
          @click="handleAnchorClick(anchor)"
      >
        <a  style="cursor: pointer">{{ anchor.title }}</a>
      </div>

    </n-drawer-content>
  </n-drawer>
</template>
<script setup>

import {$normal, $reactive} from "../../js/store";
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import {isNetWorkUri} from "../../js/utils/common";
import {utools_browser_open} from "../../js/core/base";

const preview = ref()
const tocTitles= ref([])
function copyCodeSuccess(){
  $message.info("已复制该代码块内容")
}

let cachedImageUrls = null;
let count = -1;
/**
 * 由于v-md-editor本身只能显示[http(s)://..]的图片，而不能显示本地图片（v-md-editor会直接移除该url），所以需要现将本地图片url保存起来，
 * @param {string} text
 * @param {(string)=> void} next
 */
function storeLocalImageUrlBeforeMdChange(text,next){
  count = -1;
  if($reactive.currentSnippet.path && !isNetWorkUri($reactive.currentSnippet.path)) {
    cachedImageUrls = new Map();
    const localDir = window.preload.getDirname($reactive.currentSnippet.path)
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
    // 同时支持[TOC]
    text = text.replace(/^\[TOC\]$/gm,"[[TOC]]")
  }else{
    cachedImageUrls = null;
  }
  next(text)
}
/**
 * 在MD渲染的时候，将本地图片的url补充回去
 */
function assignLocalImageUrlWhenMdRender(text,html){
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

/**
 * 处理点击Url事件
 * @param {MouseEvent} e
 */
function handleClickUrl(e){
  const a = e.target.closest('.github-markdown-body a')
  if(a){
    // [TOC] 跳转
    if(a.dataset['vMdAnchor']){
      // const heading = document.querySelector('.github-markdown-body').querySelector()
      const heading = document.querySelector(`.github-markdown-body [data-v-md-heading=${a.dataset['vMdAnchor']}]`)
      if(heading){
        $normal.scroll.codeVerticalInvoker?.scrollTo({
          top: heading.getBoundingClientRect().y - 100,
          behavior: 'smooth'
        })
      }
    }else if(a.href){
      // link
      e.preventDefault();
      if(e.ctrlKey || e.metaKey){
        utools.shellOpenExternal(a.href)
      }else{
        utools_browser_open(a.href)
      }
    }
  }
}
function _getVisiablePres(){
  const pres  = document.querySelectorAll(".v-md-editor-preview > .github-markdown-body .v-md-pre-wrapper > pre")
  // 获取窗口大小
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const middleHeight = windowHeight / 2;
  const result = [];
  // 判断视口
  for (const pre of pres) {
    const rect = pre.getBoundingClientRect();
    // before
    if (rect.bottom < 0) {
      continue;
    }
    // after: break
    if (rect.top > windowHeight) {
      break;
    }
    // optional check
    if (rect.right < 0 || rect.left > windowWidth) {
      continue;
    }
    result.push({
      distance: Math.min(Math.abs(rect.top - middleHeight),Math.abs(rect.bottom - middleHeight)),
      pre: pre
    })
  }
  return result
}
function adjustCenterPre(tab){
  const pres = _getVisiablePres();
  if(pres.length === 0){
    $normal.md.pre = null;
    $normal.md.index = null;
    return;
  }
  let finalIndex;
  if(tab){
    if($normal.md.index !== null){
      finalIndex = $normal.md.index +1;
      if(finalIndex >= pres.length){
        finalIndex = 0;
      }
    }else{
      finalIndex = 0;
    }
  }else{
    // find min distance
    let minDistance = pres[0].distance;
    finalIndex = 0;
    for (let i = 1; i < pres.length; i++) {
      if(pres[i].distance < minDistance){
        minDistance = pres[i].distance;
        finalIndex = i;
      }
    }
  }
  $normal.md.index = finalIndex;
  const finalPre = pres[finalIndex].pre;
  if($normal.md.pre === finalPre){
    return;
  }else{
    if($normal.md.pre){
      // cancel border color
      $normal.md.pre.style.border = '';
    }
    $normal.md.pre = finalPre;
    $normal.md.pre.style.border = '2px solid '+$normal.theme.globalColor;
  }

}

function handleMdHorizonMove(left,fast){
  if($normal.md.pre){
    const distance = fast? 50 : 10;
    if(left){
      if($normal.md.pre.scrollLeft < distance){
        $normal.md.pre.scrollLeft = 0;
      }else{
        $normal.md.pre.scrollLeft -= distance;
      }
    }else{
      $normal.md.pre.scrollLeft += distance;
    }
  }
}
/**
 * 处理键盘事件
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e){
  switch (e.code){
    case 'Tab':
      adjustCenterPre(true)
      break
    case "KeyH":
    case "ArrowLeft":
      handleMdHorizonMove(true,e.shiftKey)
      break;
    case "KeyJ":
    case "ArrowDown":
    case "KeyK":
    case "ArrowUp":
      adjustCenterPre()
      break;
    case "KeyL":
    case "ArrowRight":
      handleMdHorizonMove(false,e.shiftKey)
      break;
    case 'KeyT':
      if($reactive.common.shortcutActive){
        return
      }
      if($reactive.code.infoActive){
        $reactive.code.infoActive = false
      }
      $reactive.code.tocActive = !$reactive.code.tocActive;
      break;
    case 'Space':
      if($normal.md.pre){
        utools.copyText($normal.md.pre.querySelector('code').innerText)
        $message.info("已复制该代码块内容")
      }
      break
  }
}

function handleAnchorClick(anchor) {
  const { lineIndex } = anchor;

  const heading = preview.value.$el.querySelector(`[data-v-md-line="${lineIndex}"]`);
  console.log(heading)
  if (heading) {
    // Note: If you are using the preview mode of the editing component, the method name here is changed to previewScrollToTarget
    preview.value.scrollToTarget({
      target: heading,
      scrollContainer: $normal.scroll.codeVerticalInvoker.scrollbarInstRef.containerRef,
      top: 200,
    });
  }
}
onMounted(()=>{
  const anchors = preview.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const titles = Array.from(anchors).filter((title) => !!title.innerText.trim());
  if(!titles.length){
   return
  }
  const hTags = Array.from(new Set(titles.map(title => title.tagName))).sort()
  tocTitles.value = titles.map((el)=>({
    title: el.innerText,
    lineIndex: el.getAttribute('data-v-md-line'),
    indent: hTags.indexOf(el.tagName)
  }))
  document.addEventListener('click',handleClickUrl)
  document.addEventListener('keydown',handleKeyDown)
})
onUnmounted(()=>{
  document.removeEventListener('click',handleClickUrl)
  document.removeEventListener('keydown',handleKeyDown)
  $reactive.code.tocActive = false;
})
</script>



<style lang="scss">
.github-markdown-body{
  background-image: linear-gradient(90deg, rgba(60, 10, 30, .04) 3%, transparent 0), linear-gradient(1turn, rgba(60, 10, 30, .04) 3%, transparent 0);
  background-size: 20px 20px;
  background-position: 50%;

  h1{
    text-align: center;
    border-bottom-color: transparent;
  }

  img{
    background-color: transparent;
  }
  .hljs{
    background: #fafafa !important;
  }
  code:not(pre) {
    color: #de414c;
    font-family: Consolas;
    background-color: #fff5f5;
  }
  pre{
    border: 2px solid transparent;
    code{
      font-family: 'Consolas' !important;
    }
  }
}
.toc-link:hover{
  color: #de414c;
}
#dark-app{
  .toc-link:hover{
    color:#ff7875;
  }
}
// 适配 暗黑模式
#dark-app .github-markdown-body{
  background-image: linear-gradient(90deg, rgba(145, 142, 142, 0.04) 3%, transparent 0), linear-gradient(1turn, rgba(201, 194, 197, 0.04) 3%, transparent 0);
  color: #ccc !important;

  div[class*=v-md-pre-wrapper-]{
    background-color: #242425;
  }

  table{
    background-color: #313134;
    tr{
      background-color: #353539;
      border-top-color: #313134;
    }

    tr:nth-child(2n){
      background-color: #313134;
    }
    thead  tr{
      background-color: #313134;
    }

    td, th {
      border-color: #444 !important;
    }
  }

  blockquote{
    border-left-color: #515154;
  }

  h1,h2{
    border-bottom-color: #515154;
  }

  code:not(pre) {
    color: #ff7875;
    background-color: #363636;
  }
  pre {
    background: #282c34 !important;
    code {
      color: #a0a1a7 !important;
      background-color: unset;
    }
    &.v-md-mermaid{
      background-color: #cccccc;
    }
    &::-webkit-scrollbar-track-piece{
      background-color: var(--plugin-background-color);
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px !important;
      border: none !important;
      background: rgba(0, 0, 0, 0.2) !important;
    }
    &::-webkit-scrollbar-track {
      border-radius: 0;
      background: rgba(0, 0, 0, 0.1);
    }
  }

  a {
    color: #1c84f9;
  }
}

</style>