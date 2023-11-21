<template>
  <div  id="code-view" class="kit-top">
<!--    :x-scrollable="!pair.renderable || !$reactive.view.isRendering"-->
    <n-scrollbar
        style="max-height:calc(100vh - 15px)"
        trigger="none" ref="verticalScroller">
      <template v-if="refreshFlag">
        <template v-if="pair.renderable && $reactive.view.isRendering">
          <template v-if="pair.type === 'image'">
            <img :src="snippet.path??snippet.code" alt="图片加载失败了哦" style="width: 100vw;">
          </template>
          <template v-else-if="pair.type === 'markdown' || pair.type === 'md'">
            <markdown-view/>
          </template>
          <template v-else>
            未知渲染类型
          </template>
        </template>
        <template v-else>
          <div class="hljs-container" v-code>
            <n-scrollbar  x-scrollable :ref="(el)=> $normal.scroll.codeHorizontalInvoker = el">
              <template v-if="pair.valid">
                <highlightjs :language="pair.type" :autodetect="false" :code="pair.code" width="100%"/>
              </template>
              <template v-else>
                <highlightjs language="plaintext" :autodetect="false" :code="pair.code" width="100%"/>
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
        <div class="bottom"></div>
      </template>
    </n-scrollbar>
    <div id="extra">
      <n-space>
<!--        <template v-if="snippet.path && pair.type !=='image'">-->
<!--          <n-button quaternary-->
<!--                    @click="updateCachedCode"-->
<!--                    :color="configManager.getGlobalColor()">-->
<!--            {{  snippet.code? '已缓存 [B]': '未缓存 [B]' }}-->
<!--          </n-button>-->
<!--        </template>-->
        <template v-if="pair.renderable">
          <n-button quaternary
                    @click=" $reactive.view.isRendering = !$reactive.view.isRendering"
                    :color="configManager.getGlobalColor()"
                    :disabled="pair.type === 'image' && snippet.path"
          >
            {{ $reactive.view.isRendering? '已渲染 [R]': '未渲染 [R]' }}
          </n-button>
        </template>
        <n-popover trigger="hover" :show="hover || $reactive.view.codeTipActive" placement="top" :show-arrow="false" style="padding:5px">
          <template #trigger>
            <n-button
                @mouseenter="hover = true"
                @mouseleave="hover = false"
                quaternary :color="configManager.getGlobalColor()">{{ (snippet.type??'plaintext')+' [S]'}}</n-button>
          </template>
          <n-list hoverable clickable :show-divider="false" @mouseenter="hover = true" @mouseleave="hover = false">
            <n-list-item >
              <div align="center">{{snippet.name}}</div>
            </n-list-item>
            <n-list-item>
              <div>{{"📢 "+(snippet.desc??'暂无描述~')}}</div>
            </n-list-item >
            <n-list-item >
              <div>{{`⏰ ${calculateTime(snippet.time)} 🎲${snippet.count??0} 📃${pair.count}字 ${snippet.sections?.length > 0 ? '⚑×'+snippet.sections.length:''}`}}</div>
            </n-list-item>
            <n-list-item  v-if="snippet.keyword">
              <div>★ 已注册为uTools关键字</div>
            </n-list-item >
            <n-list-item  v-if="snippet.tags && snippet.tags.length > 0">
              <n-scrollbar x-scrollable :size="10" style="margin-left: 5px">
                <n-space :wrap="false">
                  <normal-tag type="raw" v-for="item in snippet.tags"  :key="item" :content="item"/>
                </n-space>
              </n-scrollbar>
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
import {configManager} from "../js/core/config";
import {computed, onMounted, ref, watch} from "vue";
import {section_generate} from "../js/utils/section";
import {getRealTypeAndValidStatus} from "../js/utils/language";
import {calculateTime, getRefreshFunc, isNetWorkUri} from "../js/utils/common";
import {$normal, $reactive, LIST_VIEW} from "../js/store";
import NormalTag from "../components/NormalTag.vue";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import MarkdownView from "../components/item/MarkdownView.vue";
import {renderFormatBlock} from "../js/core/func";

const verticalScroller = ref(null)
/**
 * @type CodeSnippet
 */
const snippet = $reactive.currentSnippet;
const isNetWorkPath = snippet.path && isNetWorkUri(snippet.path)
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
      result.code = $reactive.currentCode.slice(0,100000)+'\n由于性能限制，最多可显示100000个字符（放心，不会影响复制粘贴），后续'+(result.count - 100000)+'个字符被省略显示...'
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
  $normal.scroll.codeVerticalInvoker = verticalScroller.value;
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
  // 分析path
  if(isNetWorkPath){
    // network
    if(snippet.type !== 'image' && snippet.type !== 'x-image'){
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
const handleClose = ()=>{
  $reactive.view.codeTipActive = false;
  $normal.keepSelectedStatus = true;
  GLOBAL_HIERARCHY.changeView(LIST_VIEW)
}
// function updateCachedCode(){
//   if(snippet.code){   // 清除缓存
//     snippet.code = undefined;
//     $reactive.currentCode = getCodeFromPath();  // 抓取数据
//   }else{  // 添加缓存
//     snippet.code = $reactive.currentCode;
//   }
//   GLOBAL_HIERARCHY.update(snippet,"buffer")
// }
function getNumShow(num){
  return ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'][num]
}




onMounted(()=>{
    // $normal.updateCacheCodeFunc = updateCachedCode
    $normal.scroll.codeVerticalInvoker = verticalScroller.value;
    if(snippet.type && snippet.type.length>2 && snippet.type.startsWith('x-')){
      renderFormatBlock(pair.value.renderable && $reactive.view.isRendering)
      watch(()=>$reactive.view.isRendering,(newValue)=>{
        renderFormatBlock(newValue)
      },{
        flush:'post',
        immediate:true
      })
    }
})



</script>

<style >
#code-view{
  position: relative;
  height: calc(100vh - 15px);
}
#light-app #code-view{
  background-color: white;
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

</style>