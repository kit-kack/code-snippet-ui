<template>
  <v-md-preview
      :beforeChange="storeLocalImageUrlBeforeMdChange"
      @change="assignLocalImageUrlWhenMdRender"
      :text="$reactive.currentCode"
      @copy-code-success="copyCodeSuccess"
  ></v-md-preview>
</template>
<script setup>

import {$normal, $reactive} from "../../js/store";
import {nextTick, onMounted, onUnmounted} from "vue";
import {isNetWorkUri} from "../../js/utils/common";
import {utools_browser_open} from "../../js/core/base";

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
onMounted(()=>{
  document.addEventListener('click',handleClickUrl)
})
onUnmounted(()=>{
  document.removeEventListener('click',handleClickUrl)
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
  pre{
    border: 2px solid transparent;
    code{
      font-family: 'Consolas' !important;
    }
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
    background-color: #414141;
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