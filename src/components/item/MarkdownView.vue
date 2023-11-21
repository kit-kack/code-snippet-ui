<template>
  <v-md-preview
      :beforeChange="beforeChangeFunc"
      @change="whenRender"
      :text="$reactive.currentCode"
      @copy-code-success="copyCodeSuccess"
  ></v-md-preview>
</template>
<script setup>

import {$normal, $reactive} from "../../js/store";
import {nextTick, onMounted, onUnmounted} from "vue";
import {isNetWorkUri} from "../../js/utils/common";

function copyCodeSuccess(){
  $message.info("已复制")
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

const handleClickUrl = (e)=>{
  const a = e.target.closest('.github-markdown-body a')
  if(a){
    if(a.dataset['vMdAnchor']){
      // const heading = document.querySelector('.github-markdown-body').querySelector()
      const heading = document.querySelector(`.github-markdown-body [data-v-md-heading=${a.dataset['vMdAnchor']}]`)
      if(heading){
        $normal.scroll.codeVerticalInvoker?.scrollTo({
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
onMounted(()=>{
  document.addEventListener('click',handleClickUrl)
})
onUnmounted(()=>{
  document.removeEventListener('click',handleClickUrl)
})
</script>



<style>
#dark-app .github-markdown-body div[class*=v-md-pre-wrapper-]{
  background-color: #242425;
}
.github-markdown-body h1{
  text-align: center;
  border-bottom-color: transparent;
}

.github-markdown-body img{
  background-color: transparent;
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
#dark-app .github-markdown-body pre.v-md-mermaid{
  background-color: #cccccc;
}
</style>