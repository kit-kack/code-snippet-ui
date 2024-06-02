<template>
  <div  id="code-view">
<!--    :x-scrollable="!pair.renderable || !$reactive.view.isRendering"-->
    <n-scrollbar
        style="max-height:calc(100vh - 15px)"
        trigger="none" ref="verticalScroller">
      <template v-if="refreshFlag">
        <template v-if="pair.renderable && $reactive.code.isRendering">
          <template v-if="snippet.image ||  pair.type === 'image' || pair.type === 'svg'">
            <image-render :url="snippet.path?? snippet.code" :img-id="snippet.imgId"  :type="getImageType(pair.type,snippet.path)"/>
          </template>
          <template v-else-if="pair.type === 'markdown' || pair.type === 'md'">
            <markdown-render/>
          </template>
          <template v-else>
            未知渲染类型
          </template>
        </template>
        <template v-else>
<!--          <code-editor :value="$reactive.currentCode"-->
<!--                       :ref="(el) => $normal.scroll.newCodeInvoker = el?.$el?.children?.[0]?.children?.[0]?.children?.[1]"-->
<!--                       font-size="14px"-->
<!--                       padding="5px"-->
<!--                       height="auto"-->
<!--                       read-only-->
<!--                       :header="false"-->
<!--                       code-on-->
<!--                       line-nums width="100%" :languages="[[pair.type]]"/>-->
          <div class="hljs-container" v-code-line>
            <n-scrollbar  x-scrollable :ref="(el)=> $normal.scroll.codeHorizontalInvoker = el" style="padding-bottom: 2px">
              <template v-if="pair.valid">
                <highlightjs :language="pair.type" :autodetect="false" :code="pair.code" width="100%"/>
              </template>
              <template v-else>
                <highlightjs autodetect :code="pair.code" width="100%"/>
              </template>
            </n-scrollbar>
            <div class="hljs-line-container">
              <template v-for="(section,sindex) in snippetSections">
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
        <div class="code-view-codearea-bottom" v-if="!$reactive.code.isPure"></div>
      </template>
    </n-scrollbar>
    <base-modal v-if="$reactive.code.sectionsChangeModal"
                vim
                @cancel="exitWithHandlingSectionChange(false)"
                @confirm="exitWithHandlingSectionChange(true)"
    >
      在退出之前，<strong>子代码片段发生变更</strong>，是否进行保存?
    </base-modal>

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
                    :disabled="$reactive.currentSnippet.image ||  pair.type === 'image'"
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
            <svg-close/>
          </template>
        </n-button>
      </n-space>
    </div>
    <n-drawer v-model:show="$reactive.code.infoActive" :width="300" placement="right" :auto-focus="false">
      <n-drawer-content class="code-view-side-info">
        <template #header>
          {{snippet.name}}
        </template>
        <template #footer>
          {{calculateTime(snippet.time)}} • {{snippet.count??0}}次 • {{pair.count}}字
          <n-button v-if="snippet.keyword" :color="$normal.theme.globalColor" text style="margin-left: 5px" >
            <template #icon>
              <svg-star/>
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
          <h4>子代码片段×{{snippet.sections.length}}
            <n-button
                text
                type="error"
                style="height: 15px" size="small" @click="clearSnippetSections()" >
              清空
            </n-button>
          </h4>
          <n-space>
            <span class="code-view-side-tag" v-for="section in snippet.sections">
              {{section[0]+'~'+section[1]}}
            </span>
          </n-space>
        </template>
        <template v-if="snippet.path">
          <h4>关联地址
            <n-button  v-if="isNetWorkUri(snippet.path)"
                       @click="handleSelectOpenWay('openWithBrowser')"
                       text
                       style="height: 15px" size="small" :focusable="false">
              <template #icon>
                <svg-open/>
              </template>
            </n-button>
            <n-dropdown v-else trigger="hover" :options="[
                  {
                    label: '默认打开',
                    key: 'open',
                  },
                  {
                    label: '资源管理器打开',
                    key: 'openWithExplorer',
                  }
              ]" style="padding: 0" @select="handleSelectOpenWay">
              <n-icon>
                <svg-open/>
              </n-icon>
            </n-dropdown>
          </h4>
          <div>{{snippet.path}}</div>
        </template>


      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import {configManager} from "../js/utools/config";
import {computed, onMounted, onUnmounted, reactive, ref, toRaw, watch, watchPostEffect} from "vue";
import {
  section_add,
  section_clone,
  section_compare,
  section_contain,
  section_del,
  section_generate
} from "../js/utils/section";
import {getRealTypeAndValidStatus} from "../js/utils/language";
import {calculateTime, getImageType, getRefreshFunc, isNetWorkUri} from "../js/utils/common";
import {$normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../js/store";
import NormalTag from "../components/base/NormalTag.vue";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import MarkdownRender from "../components/render/MarkdownRender.vue";
import {renderFormatBlock} from "../js/utools/func";
import {isEmpty as _isEmpty} from "lodash-es"
import ImageRender from "../components/render/ImageRender.vue";
import BaseModal from "../components/modal/BaseModal.vue";
import SvgClose from "../asserts/close.svg"
import SvgStar from "../asserts/star.svg"
import SvgOpen from "../asserts/open.svg"

const verticalScroller = ref(null)
/**
 * @type CodeSnippet
 */
const snippet = reactive({...toRaw($reactive.currentSnippet)})
const snippetSections = ref(section_clone(snippet.sections))
watch(snippetSections, (newValue, oldValue) => {
  $reactive.code.sectionsChange = !section_compare(snippet.sections,newValue)
},{
  deep: true
})
const isNetWorkPath = snippet.path && isNetWorkUri(snippet.path)
$reactive.currentCode = getCode()
const refreshFlag = ref(true)
const vCodeLine = {
  mounted(el) {
    //获取代码片段
    let collection = el.querySelector('code.hljs')?.innerHTML.split('\n');
    let size = collection.length;
    if(collection[size -1].trim() === ''){
      size --;
    }
    //插入行数
    let ul = document.createElement('ul')
    for (let i = 1; i <= size; i++) {
      let li = document.createElement('li')
      li.innerText = i + ''
      li.value = i;
      ul.appendChild(li)
    }
    ul.onclick = (event)=>{
      let target = event.target;
      if(target && target.value){
        if(snippetSections.value){
          if(section_contain(snippetSections.value,target.value)){
            section_del(snippetSections.value,target.value,false)
          }else{
            section_add(snippetSections.value,target.value,false)
          }
        }else{
          snippetSections.value = [[target.value,target.value]]
        }
      }
    }
    ul.oncontextmenu = (event) =>{
      let target = event.target;
      if(target && target.value){
        if(snippetSections.value){
          if(section_contain(snippetSections.value,target.value)){
            section_del(snippetSections.value,target.value,true)
          }else{
            section_add(snippetSections.value,target.value,true)
          }
        }else{
          snippetSections.value = [[0,target.value]]
        }
      }
    }
    ul.classList.add('hljs-code-number')
    el.prepend(ul)
  }
}
function handleSectionChange(clear){
  if(clear){
    snippetSections.value = section_clone($reactive.currentSnippet.sections);
  }else{
    $reactive.currentSnippet.sections = snippetSections.value;
    GLOBAL_HIERARCHY.update(null,"sections");
    $reactive.code.sectionsChange = false;
  }
}
function exitWithHandlingSectionChange(confirm){
  if(confirm){
    handleSectionChange();
  }
  $reactive.code.sectionsChangeModal = false;
  GLOBAL_HIERARCHY.changeView($reactive.code.sectionsChangeTriggerIsListView ? LIST_VIEW : EDIT_VIEW)
}
function clearSnippetSections(){
  $kit_error_dialog({
    title: '清空',
    content: '清空 当前所有子代码片段？',
    callback: ()=>{
      $reactive.currentSnippet.sections = undefined;
      snippetSections.value = []
      GLOBAL_HIERARCHY.update(null,"sections");
    }
  })
}
const pair = computed(()=>{
  // 分析类型
  const result = getRealTypeAndValidStatus(snippet.type);
  if(result.type === 'image' || result.type === 'svg'){
    $reactive.code.isRendering = true;
  }
  if(snippet.image){
    snippet.type = 'image';
  }
  result.renderable = (result.type === 'markdown' || result.type === 'image' || result.type === 'svg' || snippet.image);
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
  if($reactive.code.sectionsChange){
    $reactive.code.sectionsChangeModal = true;
    $reactive.code.sectionsChangeTriggerIsListView = true;
  }else{
    GLOBAL_HIERARCHY.changeView(LIST_VIEW);
  }
}
function handleSelectOpenWay(way){
  switch (way){
    case 'open':
      utools.shellOpenPath(snippet.path)
      break
    case 'openWithExplorer':
      utools.shellShowItemInFolder(snippet.path)
      break
    case 'openWithBrowser':
      utools.shellOpenExternal(snippet.path)
      break
  }
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

const MARKDOWN_BLOCK = '#code-view  div.v-md-editor-preview > div.github-markdown-body'
const NORMAL_BLOCK = '#code-view pre > code'
onMounted(()=>{
    // $normal.updateCacheCodeFunc = updateCachedCode
    $normal.scroll.codeVerticalInvoker = verticalScroller.value;
    $reactive.code.isRendering = pair.value.renderable;
    $normal.handle_sections_change = handleSectionChange;
    if(snippet.type && snippet.type.length>2 && snippet.type.startsWith('x-')){
      if(pair.value.renderable){
        watchPostEffect(()=>{
          renderFormatBlock($reactive.code.isRendering ? MARKDOWN_BLOCK: NORMAL_BLOCK,!$reactive.code.isRendering)
        })
      }else{
        renderFormatBlock(NORMAL_BLOCK,true)
      }
    }
})

onUnmounted(()=>{
  $reactive.code.infoActive = false;
  $reactive.code.sectionsChange = false;
  delete $normal.handle_sections_change;
})

</script>

<style lang="scss">
#code-view{
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
#light-app-v5{
  .code-view-side-info{
    h4{
      border-bottom-color: #e0e0e0;
    }
  }
  .n-drawer{
    --n-header-border-bottom: 1px solid #e0e0e0;
    --n-footer-border-top: 1px solid #e0e0e0;
  }
}
#dark-app {
  .hljs-code-number{
    color: #abb2bf;
    border-right-color:  #424447;
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