<template>
  <div :class="isSideView ? 'side-markdown-view': 'full-markdown-view'">
    <v-md-preview
        :beforeChange="storeLocalImageUrlBeforeMdChange"
        @change="assignLocalImageUrlWhenMdRender"
        :text="code ?? $reactive.currentCode"
        @copy-code-success="copyCodeSuccess"
        ref="preview"
    ></v-md-preview>
  </div>
  <n-drawer
      v-model:show="$reactive.code.tocActive"
      @after-enter="adjustCurrentHeading(true)"
      display-directive="show"
      :show-mask="false"
      :width="300" placement="right">
    <n-drawer-content title="目录" body-content-style="padding: 0 0 0 20px;" >
      <n-scrollbar ref="tocScrollRef">
        <div
            v-for="(anchor,index) in tocAnchors"
            class="toc-link"
            :class="{
            'active': currentHeadingIndex === index
          }"
            :style="{ padding: `10px 0 10px ${anchor.indent * 20}px` }"
            @click="handleAnchorClick(anchor,index)">
          <n-ellipsis>
            <a  style="cursor: pointer">{{ anchor.title }}</a>
          </n-ellipsis>
        </div>
      </n-scrollbar>

    </n-drawer-content>
  </n-drawer>
</template>
<script setup>
import {$normal, $reactive} from "../../js/store";
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import {isNetWorkUri} from "../../js/utils/common";
import {utools_browser_open} from "../../js/utools/base";
import {RENDER_KEYHANDLER} from "../../js/keyboard/k-codeview";
import {SIDE_RENDER_KEYHANDLER} from "../../js/keyboard/k-listview";

const preview = ref()
const tocScrollRef = ref()
const tocAnchors= ref([])
const currentHeadingIndex = ref(0)
function copyCodeSuccess(){
  $message.info("已复制该代码块内容")
}
const props = defineProps({
  code: String,
  isSideView: Boolean
})
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
    document.querySelectorAll(
        props.isSideView? "#lite-code-view  .github-markdown-body img"
            : "#code-view .github-markdown-body img"
    ).forEach((value,index)=>{
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
      const heading = document.querySelector(`${props.isSideView ? '#lite-code-view' : '#code-view'} .github-markdown-body [data-v-md-heading=${a.dataset['vMdAnchor']}]`)
      if(heading){
        const invoker = props.isSideView? $normal.scroll.sideCodeVerticalInvoker: $normal.scroll.codeVerticalInvoker;
        invoker?.scrollTo({
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
function _getVisiableBlocks(selectors){
  const blocks  = document.querySelectorAll(selectors)
  // 获取窗口大小
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const middleHeight = windowHeight / 2;
  const result = [];
  // 判断视口
  for (const block of blocks) {
    const rect = block.getBoundingClientRect();
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
      block:block
    })
  }
  return result
}
function adjustCenterPre(tab){
  const pres = _getVisiableBlocks(
      props.isSideView? "#lite-code-view .v-md-editor-preview > .github-markdown-body .v-md-pre-wrapper > pre"
          :"#code-view .v-md-editor-preview > .github-markdown-body .v-md-pre-wrapper > pre"
  );
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
  const finalPre = pres[finalIndex].block;
  if($normal.md.pre !== finalPre){
    if($normal.md.pre){
      // cancel border color
      $normal.md.pre.style.border = '';
    }
    $normal.md.pre = finalPre;
    if($normal.md.pre){
      // cancel border color
      $normal.md.pre.style.border = '2px solid '+$normal.theme.globalColor;
    }
  }

}
function handleMdHorizonMove(left,fast){
  if(!$normal.md.pre){
    adjustCenterPre()
  }
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
 * @type KeyDownHandler
 */
const K_CODEVIEW_MARKDOWN_DOWN = ({code,shift,ctrl,repeat})=>{
  switch (code){
    case "KeyH":
    case "ArrowLeft":
      handleMdHorizonMove(true,shift)
      break;
    case "KeyJ":
    case "ArrowDown":
      if($reactive.code.tocActive){
        if(tocAnchors.value.length > 0){
          if(currentHeadingIndex.value !== tocAnchors.value.length - 1){
            let index = currentHeadingIndex.value + 1;
            if(shift){
              const indent = tocAnchors.value[currentHeadingIndex.value].indent;
              let ind = -1;
              for (let i = index; i < tocAnchors.value.length; i++) {
                if(tocAnchors.value[i].indent === indent){
                  ind = i;
                  break
                }
              }
              if(ind === -1){
                return;
              }
              index = ind;
            }
            handleAnchorClick(tocAnchors.value[index],index)
            // tocRef.value.$el.children[1].children[0].scrollTop = `${(index> 5 ? index - 5 : 0) * 40}px`
            tocScrollRef.value.scrollTo({
              top: (index> 5 ? index - 5 : 0) * 42,
              behavior: 'smooth'
            })
          }
        }
      }else{
        if(ctrl){
          if(tocAnchors.value.length > 0){
            adjustCurrentHeading()
            if(currentHeadingIndex.value !== tocAnchors.value.length - 1){
              const index = currentHeadingIndex.value + 1;
              handleAnchorClick(tocAnchors.value[index],index)
            }
          }
        }
      }
      return ;
    case "KeyK":
    case "ArrowUp":
      if($reactive.code.tocActive){
        if(tocAnchors.value.length > 0){
          if(currentHeadingIndex.value !== 0){
            let index = currentHeadingIndex.value - 1;
            if(shift){
              const indent = tocAnchors.value[currentHeadingIndex.value].indent;
              let ind = -1;
              for (let i = index; i >= 0; i --) {
                if(tocAnchors.value[i].indent === indent){
                  ind = i;
                  break
                }
              }
              if(ind === -1){
                return true;
              }
              index = ind;
            }
            handleAnchorClick(tocAnchors.value[index],index)
            tocScrollRef.value.scrollTo({
              top: (index> 5 ? index - 5 : 0) * 42,
              behavior: 'smooth'
            })
          }
        }
      }else{
        if(ctrl){
          if(tocAnchors.value.length > 0){
            const top = adjustCurrentHeadingUpward();
            if(top === null){
              return true
            }
            let index = currentHeadingIndex.value;
            if(top < 0){
              // 先回正 当前小节
              index ++;
            }
            if(index !== 0){
              index --;
              handleAnchorClick(tocAnchors.value[index],index)
            }
          }
        }
      }
      return;
    case "KeyL":
    case "ArrowRight":
      handleMdHorizonMove(false,shift)
      break;
    case 'KeyT':
      if(repeat){
        return;
      }
      if($reactive.common.shortcutActive){
        $reactive.common.shortcutActive = false
        $reactive.code.tocActive = true
        return true;
      }
      if($reactive.code.infoActive){
        $reactive.code.infoActive = false
        $reactive.code.tocActive = true
        return true;
      }
      $reactive.code.tocActive = ! $reactive.code.tocActive;
      break;
    default:
      return $reactive.code.tocActive;
  }
  return true;
}
const K_SIDE_CODEVIEW_MARKDOWN_HANDLER = (code) =>{
  switch (code){
    case "KeyH":
    case "ArrowLeft":
      adjustCenterPre()
      handleMdHorizonMove(true,true);
      break;
    case "KeyL":
    case "ArrowRight":
      adjustCenterPre()
      handleMdHorizonMove(false,true)
      break;
    default:
      return false;
  }
  return true;
}
/**
 * @type KeyUpHandler
 */
const K_CODEVIEW_MARKDOWN_UP = ({code})=>{
  switch (code){
    case 'KeyQ':
      if($reactive.code.tocActive){
        $reactive.code.tocActive = false
        return true;
      }
      return;
    case 'KeyS':
      if($reactive.code.tocActive){
        $reactive.code.infoActive = true;
        $reactive.code.tocActive = false;
        return true;
      }
      return;
    case 'KeyJ':
    case 'KeyK':
    case 'ArrowUp':
    case 'ArrowDown':
      adjustCenterPre()
      break;
    case 'Tab':
      adjustCenterPre(true)
      break
    case 'Space':
      if($reactive.code.tocActive){
        $reactive.code.tocActive = false
        return true
      }
      if($reactive.code.infoActive){
        $reactive.code.infoActive = false
        return true
      }
      if($reactive.common.shortcutActive){
        $reactive.common.shortcutActive = false
        return true
      }
      if($normal.md.pre){
        utools.copyText($normal.md.pre.querySelector('code').innerText)
        $message.info("已复制该代码块内容")
      }
      break
    default:
      return $reactive.code.tocActive;
  }
  return true;
}
function adjustCurrentHeading(scrollable){
  if(tocAnchors.value.length > 0) {
    // 获取窗口大小
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const middleHeight = windowHeight / 2;
    let finalIndex = tocAnchors.value.length - 1;
    for (let i = 0; i < tocAnchors.value.length; i++) {
      const heading = preview.value.$el.querySelector(`[data-v-md-line="${tocAnchors.value[i].lineIndex}"]`);
      if (heading) {
        const rect = heading.getBoundingClientRect();
        // after: break
        if (rect.top < middleHeight) {
          finalIndex = i;
        } else {
          break;
        }
      }
    }
    currentHeadingIndex.value = finalIndex
    if(scrollable){
      if(finalIndex >= 0){
        tocScrollRef.value.scrollTo({
          top: (finalIndex> 5 ? finalIndex - 5 : 0) * 42,
          behavior: 'smooth'
        })
      }
    }
  }
}
function adjustCurrentHeadingUpward(){
  let top = null;
  if(tocAnchors.value.length > 0) {
    // 获取窗口大小
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const middleHeight = windowHeight / 2;
    let finalIndex = tocAnchors.value.length - 1;
    for (let i = 0; i < tocAnchors.value.length; i++) {
      const heading = preview.value.$el.querySelector(`[data-v-md-line="${tocAnchors.value[i].lineIndex}"]`);
      if (heading) {
        const rect = heading.getBoundingClientRect();
        // after: break
        if (rect.top < middleHeight) {
          finalIndex = i;
          top = rect.top;
        } else {
          break;
        }
      }
    }
    currentHeadingIndex.value = finalIndex
  }
  return top
}

function handleAnchorClick(anchor,index) {
  const { lineIndex } = anchor;

  const heading = preview.value.$el.querySelector(`[data-v-md-line="${lineIndex}"]`);
  if (heading) {
    // 获取窗口大小
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const middleHeight = windowHeight / 2;
    // Note: If you are using the preview mode of the editing component, the method name here is changed to previewScrollToTarget
    preview.value.scrollToTarget({
      target: heading,
      scrollContainer: $normal.scroll.codeVerticalInvoker.scrollbarInstRef.containerRef,
      top: middleHeight - 20,
    });
    currentHeadingIndex.value = index
  }
}

onMounted(()=>{
  const anchors = preview.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const titles = Array.from(anchors).filter((title) => !!title.innerText.trim());
  if(titles.length > 0){
    const hTags = Array.from(new Set(titles.map(title => title.tagName))).sort()
    tocAnchors.value = titles.map((el)=>({
      title: el.innerText,
      lineIndex: el.getAttribute('data-v-md-line'),
      indent: hTags.indexOf(el.tagName)
    }))
  }
  document.addEventListener('click',handleClickUrl)
  if(props.isSideView){
    SIDE_RENDER_KEYHANDLER.MARKDOWON_HANDLER = K_SIDE_CODEVIEW_MARKDOWN_HANDLER;
  }else{
    RENDER_KEYHANDLER.onKeyUp = K_CODEVIEW_MARKDOWN_UP
    RENDER_KEYHANDLER.onKeyDown = K_CODEVIEW_MARKDOWN_DOWN
  }
})
onUnmounted(()=>{
  document.removeEventListener('click',handleClickUrl)
  if(props.isSideView){
    SIDE_RENDER_KEYHANDLER.MARKDOWON_HANDLER = null
  }else{
    RENDER_KEYHANDLER.onKeyUp = null
    RENDER_KEYHANDLER.onKeyDown = null
  }
  $reactive.code.tocActive = false;
})
</script>



<style lang="scss">
.github-markdown-body{
  background-size: 20px 20px;
  background-position: 50%;

  hr{
    height: 2px !important;
  }
  h1{
    text-align: center;
  }
  h1,h2,h3{
    border-bottom-color: transparent !important;
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
    background-color: #fff5f590;
  }
  pre{
    border-radius: 5px !important;
    border: 2px solid transparent;
    code{
      font-weight: normal;
      font-family: 'Consolas' !important;
    }

    &::-webkit-scrollbar-track-piece{
      background-color: #f6f8fa;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px !important;
      border-color:  #f6f8fa;
      background-color:  #ddd !important;
    }
  }
  a:hover{
    text-decoration: underline !important;
  }
}
.toc-link{
  &:hover,&.active{
    color: var(--global-color)
  }
  &.active{
    font-weight: bold
  }
}
.full-markdown-view .github-markdown-body{
  background-image: linear-gradient(90deg, rgba(60, 10, 30, .04) 3%, transparent 0), linear-gradient(1turn, rgba(60, 10, 30, .04) 3%, transparent 0);
}
.side-markdown-view .github-markdown-body{
  background-color: #f5f5f5;
}
#light-app-v5{
  .github-markdown-body{
    table {
      thead th{
        background-color: #f6f8fa;
      }

    }
    pre {
      background: #eee !important;
      box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
      code {
        background-color: unset;
      }
      &::-webkit-scrollbar-track-piece{
        background-color: #eee;
      }
      &::-webkit-scrollbar-thumb {
        border-radius: 5px !important;

        //border: none !important;
        border-color: #eee;
        background: #d7d7d7 !important;
      }

    }


  }
}

// 适配 暗黑模式
#dark-app .github-markdown-body{
  color: #ccc !important;

  div[class*=v-md-pre-wrapper-]{
    background-color: #303133;
  }

  table{
    tr{
      background-color: #3d3d3f;
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
    color: #888;
  }
  hr{
    background-color: #515154;
  }

  //h1,h2{
  //  border-bottom-color: #515154;
  //}

  code:not(pre) {
    color: #ff7875;
    background-color: #36363660;
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
      background-color: #282c34;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px !important;

      //border: none !important;
      border-color:  #282c34;
      background:  #777 !important;
    }

  }

  a {
    color: #1c84f9;
  }
}
#dark-app .full-markdown-view .github-markdown-body{
  background-image: linear-gradient(90deg, rgba(145, 142, 142, 0.04) 3%, transparent 0), linear-gradient(1turn, rgba(201, 194, 197, 0.04) 3%, transparent 0);
}
#dark-app .side-markdown-view .github-markdown-body{
  background-color: #303133 !important;
}

.v-md-pre-wrapper.copy-code-mode .v-md-copy-code-btn:active{
  box-shadow: none;
}
</style>