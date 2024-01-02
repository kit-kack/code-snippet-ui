<template>
  <div  id="code-view">
<!--    :x-scrollable="!pair.renderable || !$reactive.view.isRendering"-->
    <n-scrollbar
        style="max-height:calc(100vh - 15px)"
        trigger="none" ref="verticalScroller">
      <template v-if="refreshFlag">
        <template v-if="pair.renderable && $reactive.code.isRendering">
          <template v-if="pair.type === 'image'">
            <div style="text-align: center">
              <img :src="snippet.path??snippet.code" alt="图片加载失败了哦" style="width: 98vw;">
            </div>
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
            <n-scrollbar  x-scrollable :ref="(el)=> $normal.scroll.codeHorizontalInvoker = el" style="padding-bottom: 2px">
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
        <div class="code-view-codearea-bottom"></div>
      </template>
    </n-scrollbar>

    <div id="code-view-bottom-nav" v-if="!$reactive.code.isPure">
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
                    @click=" $reactive.code.isRendering = !$reactive.code.isRendering"
                    :disabled="pair.type === 'image' && snippet.path"
          >
            {{ $reactive.code.isRendering? '已渲染 [R]': '未渲染 [R]' }}
          </n-button>
        </template>
        <n-button
            @click="$reactive.code.infoActive = true"
            quaternary>{{ (snippet.type??'plaintext')+' [S]'}}</n-button>
        <n-button v-if="$reactive.code.isRendering && pair.type === 'markdown'" quaternary
                  @click="$reactive.code.tocActive = !$reactive.code.tocActive"
        >
          目录 [T]
        </n-button>
        <n-button strong quaternary circle  @click="handleClose">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z" fill="currentColor"></path></svg>
          </template>
        </n-button>
      </n-space>
    </div>
    <n-drawer v-model:show="$reactive.code.infoActive" :width="300" placement="right">
      <n-drawer-content class="code-view-side-info">
        <template #header>
          {{snippet.name}}
        </template>
        <template #footer>
          {{calculateTime(snippet.time)}} • {{snippet.count??0}}次 • {{pair.count}}字
          <n-button v-if="snippet.keyword" :color="$normal.theme.globalColor" text style="margin-left: 5px" >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M10.788 3.102c.495-1.003 1.926-1.003 2.421 0l2.358 4.778l5.273.766c1.107.16 1.549 1.522.748 2.303l-3.816 3.719l.901 5.25c.19 1.104-.968 1.945-1.959 1.424l-4.716-2.48l-4.715 2.48c-.99.52-2.148-.32-1.96-1.423l.901-5.251l-3.815-3.72c-.801-.78-.359-2.141.748-2.302L8.43 7.88l2.358-4.778z" fill="currentColor"></path></g></svg>
            </template>
          </n-button>
        </template>
        <p>
          <span v-if="snippet.createTime" class="code-view-create-time" >创建于 {{calculateTime(snippet.createTime)}}</span>
          {{snippet.desc??'暂无描述~'}}
        </p>
<!--        <p>{{calculateTime(snippet.time)}} • {{snippet.count??0}}次 • {{pair.count}}字</p>-->
        <template v-if="!_isEmpty(snippet.tags)">
          <h4>标签</h4>
          <n-space>
            <normal-tag type="raw" v-for="item in snippet.tags" :is-special="snippet.editor?.[item]"  :key="item" :content="item"/>
          </n-space>
        </template>
        <template v-if="!_isEmpty(snippet.sections)">
          <h4>子代码片段×{{snippet.sections.length}}</h4>
          <n-space>
            <span class="code-view-side-tag" v-for="section in snippet.sections">
              {{section[0]+'~'+section[1]}}
            </span>
          </n-space>
        </template>
        <template v-if="snippet.path">
          <h4>关联地址</h4>
          <div>{{snippet.path}}</div>
        </template>


      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import {configManager} from "../js/core/config";
import {computed, onMounted, onUnmounted, ref, watchPostEffect} from "vue";
import {section_generate} from "../js/utils/section";
import {getRealTypeAndValidStatus} from "../js/utils/language";
import {calculateTime, getRefreshFunc, isNetWorkUri} from "../js/utils/common";
import {$normal, $reactive, LIST_VIEW} from "../js/store";
import NormalTag from "../components/base/NormalTag.vue";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import MarkdownView from "../components/item/MarkdownView.vue";
import {renderFormatBlock} from "../js/core/func";
import {isEmpty as _isEmpty} from "lodash-es"

const verticalScroller = ref(null)
/**
 * @type CodeSnippet
 */
const snippet = $reactive.currentSnippet;
const isNetWorkPath = snippet.path && isNetWorkUri(snippet.path)
$reactive.currentCode = getCode()
const refreshFlag = ref(true)
const pair = computed(()=>{
  // 分析类型
  const result = getRealTypeAndValidStatus(snippet.type);
  if(result.type === 'image'){
    $reactive.code.isRendering = true;
  }
  result.renderable = (result.type === 'markdown' || result.type === 'image')
  if($reactive.currentCode){
    result.count = $reactive.currentCode.length;
    if($reactive.currentCode.length > 100000){
      result.code = $reactive.currentCode.slice(0,100000)+'\n由于性能限制，最多可显示100000个字符（放心，不会影响复制粘贴），后续'+(result.count - 100000)+'个字符被省略显示...'
    }else{
      result.code = $reactive.currentCode;
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
    if(GLOBAL_HIERARCHY.currentHierarchy.resolveUrl){
      GLOBAL_HIERARCHY.currentHierarchy.resolveUrl(snippet.path,snippet.type).then(successData =>{
        $reactive.currentCode = successData;
        doRefresh();
      },error =>{
        $reactive.currentCode = "网络文件[ " + snippet.path + " ]数据抓取失败!原因为 " + error
      })
    }else{
      // network
      if(snippet.type !== 'image' && snippet.type !== 'x-image') {
        fetch(snippet.path).then(resp => {
          if (resp.ok) {
            resp.text().then(value => {
              // 刷新页面
              $reactive.currentCode = value;
              doRefresh();
            })
          } else {
            $reactive.currentCode = "网络文件[ " + snippet.path + " ]数据抓取失败!"
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
function handleClose(){
  $reactive.code.infoActive = false;
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
    $reactive.code.isRendering = pair.value.renderable;
    if(snippet.type && snippet.type.length>2 && snippet.type.startsWith('x-')){
      if(pair.value.renderable){
        watchPostEffect(()=>{
          renderFormatBlock($reactive.code.isRendering)
        })
      }else{
        renderFormatBlock(false)
      }
    }
})

onUnmounted(()=>{
  $reactive.code.infoActive = false;
})

</script>

<style lang="scss">
#code-view{
  overflow: hidden;
  z-index: 1000;
  width: 100%;
  position: relative;
  height: calc(100vh - 15px);

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
#light-app #code-view{
  background-color: white;
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
  font-size: 12px;
  line-height: 12px;
  height: 12px;
  padding: 5px 0;
  width: 100%;
  z-index: 0;
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

  &:first-child{
    margin-top: 0;
  }

  li{
    line-height: 12px;
    padding: 5px 0;
    font-size: 14px;
    text-align: center;
    z-index: 2;
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
.command-format{
  color: #ffa400;
  border-radius: 3px;
  background-color: #f1f1f1;
  font-weight: bolder;
}
.command-assign{
  color: #10be8e;
  border-radius: 3px;
  background-color: #f1f1f1;
  font-weight: bolder;
}

</style>