<template>
  <div  id="lite-code-view">
    <!--    :x-scrollable="!pair.renderable || !$reactive.view.isRendering"-->
    <n-scrollbar
        style="max-height:100vh"
        trigger="hover" ref="verticalScroller">
      <template v-if="refreshFlag">
        <template v-if="pair.renderable">
          <template v-if="pair.type === 'image' || pair.type === 'svg'">
            <image-render is-side-view :url="snippet.path?? snippet.code"  :type="getImageType(pair.type,snippet.path)"/>
          </template>
          <template v-else-if="pair.type === 'markdown' || pair.type === 'md'">
            <markdown-render is-side-view :code="pair.code"/>
          </template>
          <template v-else>
            未知渲染类型
          </template>
        </template>
        <template v-else>
          <div class="hljs-container" v-code-line>
            <n-scrollbar  x-scrollable :ref="(el)=> $normal.scroll.sideCodeHorizontalInvoker = el" style="padding-bottom: 2px">
              <template v-if="pair.valid">
                <highlightjs :language="pair.type" :autodetect="false" :code="pair.code" width="100%"/>
              </template>
              <template v-else>
                <highlightjs autodetect :code="pair.code" width="100%"/>
              </template>
            </n-scrollbar>
            <div class="hljs-line-container">
              <template v-for="(section,sindex) in snippet.sections">
                <div class="hljs-line-item"
                     v-for="(line,lindex) in section_generate(section)"
                     :style="{
                       color: configManager.getGlobalColor(),
                        backgroundColor:$normal.theme.highColor,
                   top: (22*line-22)+'px'}">{{lindex === 0? (sindex <9? getNumShow(sindex): ''):''}}</div>
              </template>
            </div>

          </div>
        </template>
      </template>
    </n-scrollbar>


  </div>
</template>

<script setup>
import {configManager} from "../js/utools/config";
import {nextTick, onBeforeMount, onBeforeUpdate, onMounted, onUnmounted, ref, toRaw} from "vue";
import {section_generate} from "../js/utils/section";
import {getRealTypeAndValidStatus} from "../js/utils/language";
import {getImageType, getRefreshFunc, isNetWorkUri} from "../js/utils/common";
import {$index, $normal, $reactive} from "../js/store";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import MarkdownRender from "../components/render/MarkdownRender.vue";
import ImageRender from "../components/render/ImageRender.vue";
import {renderFormatBlock} from "../js/utools/func";

const verticalScroller = ref(null)
const props = defineProps(['snippet'])
const pair = ref({
  code: '正在加载中',
  type: 'markdown',
  valid: true
})

const refreshFlag = ref(true)
/**
 *
 * @param {HTMLElement} el
 */
const vCodeLine = function (el){
  let first = el.firstElementChild
  if(first && first.matches('ul.hljs-code-number')){
    first.remove()
    first = null;
  }
  //获取代码片段
  let collection = el.querySelector('code.hljs')?.innerHTML.split('\n');
  let size = collection.length;
  if(collection[size -1].trim() === ''){
    size --;
  }
  let ul = document.createElement('ul') ;
  for (let i = 1; i <= size; i++) {
    let li = document.createElement('li')
    li.innerText = i + ''
    li.value = i;
    ul.appendChild(li)
  }
  ul.classList.add('hljs-code-number')
  el.prepend(ul)
}

function calculatePair(snippet){
  // 分析类型
  const result = getRealTypeAndValidStatus(snippet.type);
  let isImage = result.type === 'image' || result.type === 'svg';
  result.renderable = (result.type === 'markdown' || isImage );
  // 获取code
  let code = isImage ? '': getCode(snippet);
  if(code){
    result.count = code.length;
    if(code.length > 100000){
      result.code = code.slice(0,100000)+'\n由于性能限制，最多可显示100000个字符（放心，不会影响复制粘贴），后续'+(result.count - 100000)+'个字符被省略显示...'
    }else{
      result.code = code;
    }
    // 解析文件类型
    if(result.code){
      const code = result.code.slice(0,1000)
      let isText = true;
      for (const c of code) {
        const t = c.charCodeAt(0)
        if(t < 32 && t !== 9 && t!== 10 && t!== 13){
          isText = false;
          break
        }
      }
      if(!isText){
        result.code = '[提示]: 抱歉，二进制文件内容无法预览'
      }
    }
  }else{
    result.count = 0;
    result.code = '';
  }
  pair.value = result;
}



const doRefresh = getRefreshFunc(refreshFlag,()=>{
  // 滚动条重新绑定
  $normal.scroll.codeVerticalInvoker = verticalScroller.value;
})
function getCode(snippet){
  if(snippet.path){
    if(snippet.code){
      return snippet.code;
    }else{
      return getCodeFromPath(snippet);
    }
  }
  return snippet.code;
}

function getCodeFromPath(snippet){
  // 分析path
  if(snippet.path && isNetWorkUri(snippet.path)){
    if(GLOBAL_HIERARCHY.currentHierarchy.resolveUrl){
      GLOBAL_HIERARCHY.currentHierarchy.resolveUrl(snippet.path,snippet.type).then(successData =>{
        pair.value.code = successData;
        doRefresh();
      },error =>{
        pair.value.code = "网络文件[ " + snippet.path + " ]数据抓取失败!原因为 " + error
      })
    }else{
      // network
      if(snippet.type !== 'image' && snippet.type !== 'x-image') {
        fetch(snippet.path).then(resp => {
          if (resp.ok) {
            resp.text().then(value => {
              // 刷新页面
              pair.value.code = value;
              doRefresh();
            })
          } else {
            pair.value.code = "网络文件[ " + snippet.path + " ]数据抓取失败!"
          }
        })
      }
    }
    return "网络文件[ "+snippet.path +" ]数据正在获取中..."
  }else{
    // local
    try{
      return window.preload.readFile(snippet.path).toString()?? '[本地内容为空]'
    }catch (e){
      $message.error(e.message)
      return `😅加载失败: 本地文件[ ${snippet.path} ]`
    }
  }
}


function getNumShow(num){
  return ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'][num]
}

const MARKDOWN_BLOCK = '#lite-code-view  div.v-md-editor-preview > div.github-markdown-body'
const NORMAL_BLOCK = '#lite-code-view pre > code'

onBeforeMount(()=>{
  calculatePair(props.snippet)
})
onMounted(()=>{
  // $normal.updateCacheCodeFunc = updateCachedCode
  $normal.scroll.sideCodeVerticalInvoker = verticalScroller.value;

  // calculatePair(props.snippet)
  if(props.snippet.type && props.snippet.type.length>2 && props.snippet.type.startsWith('x-')){
    nextTick(()=>{
      renderFormatBlock(pair.value.renderable ? MARKDOWN_BLOCK: NORMAL_BLOCK)
    })
  }

})
let index = toRaw($index.value)
onBeforeUpdate(()=>{
  if(index === $index.value){
  }else{
    index = $index.value;
    calculatePair(props.snippet)
    if(props.snippet.type && props.snippet.type.length>2 && props.snippet.type.startsWith('x-')){
      nextTick(()=>{
        renderFormatBlock(pair.value.renderable ? MARKDOWN_BLOCK: NORMAL_BLOCK)
      })
    }

  }


})

onUnmounted(()=>{
  $reactive.code.infoActive = false;
  $reactive.code.sectionsChange = false;
})

</script>

<style lang="scss">
#lite-code-view{
  overflow: hidden;
  z-index: 1000;
  width: 100%;
  position: relative;
  height: calc(100vh - 17px);

  .n-button{
    color: var(--global-color)
  }

  .hljs-container pre{
    box-sizing: border-box;
    width: 100%;
    padding-left: 5px;
    padding-right: 10px;
    z-index: 1;
    background: transparent;
  }
  pre code  {
    line-height: 22px;
    z-index: 2;
    background: transparent;

    > *{
      z-index: 100;
      background: transparent;
    }
  }
}
#light-app #lite-code-view{
  background-color: #f5f5f5;
  .v-md-editor-preview{
    background-color: white;
  }
}

#code-view-bottom-nav{
  position: fixed;
  right:20px;
  bottom: 12px;
  z-index: 10;
}
.n-list-item{
  height: 32px;
  padding: 0 5px
}
.code-view-codearea-bottom{
  height: 40px;
  width: 100%;
}

.hljs-container {
  position: relative;
  display: flex;
  padding-top: 4px;
  padding-left: 5px;
  padding-bottom: 8px;

  pre code.hljs{
    padding: 0 !important;
  }
}
.hljs-line-container{
  position: absolute;
  width: 100%;
}
.hljs-line-item{
  position: absolute;
  left:-5px;
  font-size: 12px;
  line-height: 12px;
  height: 12px;
  padding: 5px 0;
  width: 100%;
  z-index: 0;
}


/** 行数样式 */
.hljs-code-number {
  padding: 0 8px 0 8px;
  font-size: 14px;
  list-style: none;
  border-right: 1px solid #e1e2e3;
  user-select:none;
  z-index: 1;

  &:first-child{
    margin-top: 0;
  }

  li{
    line-height: 12px;
    padding: 5px 0;
    font-size: 12px;
    text-align: right;
    opacity: 0.3;
    z-index: 2;
    &:hover{
      color: var(--global-color);
      text-decoration: underline;
    }
  }
}
.code-view-side-info {
  h4{
    font-weight: normal;
    margin-top:20px;
    margin-bottom: 5px;
    border-bottom: 1px solid #efeff5;
  }
  p{
    padding: 10px;
    border-radius: 5px;
    background-color: #ecf0f3;
  }
  .code-view-create-time{
    font-size: 12px;
    font-style: italic;
    float: right;
    margin-right: -10px;
    margin-top: -18px;
  }
  .code-view-side-tag{
    font-size: 12px;
    padding:0 5px;
    border-radius: 2px;
    background-color: #f0f0f0;
  }
}
#dark-app {
  .hljs-code-number{
    color: #666;
    border-right-color:  #3a3c41;
  }
  .code-view-side-info{
    p{
      background-color: #424244;
    }
    h4{
      border-bottom-color: #666;
    }
    .code-view-side-tag{
      background-color: #3a3c41;
    }
  }
  .command-format,.command-assign{
    background-color: #414141;
  }
}


</style>