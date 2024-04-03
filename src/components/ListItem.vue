<template>
  <div class="snippet-item"
       @contextmenu="handleContextMenu"
       @click="handleClick"
       @dblclick="handleDoubleClick"
       @mouseleave="handleMouseLeave"
       @mouseenter="isHover = true"
       >
    <n-card
            embedded
            size="small"
            content-style="padding: 0 12px"
            header-style="height:28px;"
            :style="getSelectedStyle(props.selected,isHover&&$reactive.main.isCursorShow)"
    >
      <!-- 置顶 圆心 -->
      <div class="snippet-item__top"
           :style="{
              backgroundColor: (props.snippet.index !== undefined)? configManager.getGlobalColor(): ''
           }"
      ></div>
      <!-- 右侧 序号 -->
      <span class="snippet-item__index">{{index}}</span>
      <template #header>
        <n-scrollbar x-scrollable>
          <div class="snippet-item-head__left">
            <n-ellipsis>
              <!-- 标题 -->
              <span class="snippet-item__title"   v-html="escapeHtmlExceptB((snippet.temp && !snippet.matchType)? snippet.temp:snippet.name)"></span>
              <!-- 描述（标题右侧）  子代码片段 -->
              <span class="snippet-item__desc">
                <span v-if="configManager.get('strategy_item_code_show') > 0" v-html="(snippet.matchType === 1 && snippet.temp)? snippet.temp : snippet.desc"></span>
                <span v-else>{{pair.sideInfo}}</span>
              </span>
            </n-ellipsis>
          </div>
        </n-scrollbar>
      </template>
      <!-- 标签 -->
      <template #header-extra >
        <n-scrollbar x-scrollable :size="10" style="max-width: 250px;margin-left: 5px">
          <div class="snippet-item__tags">
            <n-space :wrap="false">
              <normal-tag v-for="item in snippet.tags"
                          :key="item"
                          :is-special="snippet.editor?.[item]"
                          :content="item" @tag-refresh="doItemRefresh"/>
            </n-space>
          </div>
        </n-scrollbar>
      </template>

      <template v-if="configManager.get('strategy_item_code_show')  === 2">
        <!-- 代码 -->
        <multi-line-code :type="pair.renderType" :img-id="snippet.imgId" :code="pair.code" :active="$index === index"/>
        <!-- no-code-desc -->
        <span  class="snippet-item-info no-item-code" style="left: 0;z-index: 20;" >
              {{pair.sideInfo}}
        </span>
      </template>
      <template v-else-if="configManager.get('strategy_item_code_show') === 1">
        <single-line-code :type="pair.renderType" :code="pair.code"/>
        <!-- no-code-desc -->
        <span  class="snippet-item-info no-item-code" style="left: 0;z-index: 20;" >
              {{pair.sideInfo}}
        </span>
      </template>
      <template v-else>
        <!-- 描述（标题下方） -->
        <n-ellipsis :tooltip="false">
          <span class="snippet-item__desc" style="margin-left: 0px;" v-html="(snippet.matchType === 1 && snippet.temp)? snippet.temp : snippet.desc" ></span>
        </n-ellipsis>
      </template>


      <!-- 右侧下方 （语言类型|使用次数|上次使用时间） -->
      <span  class="snippet-item-info" style="  transform-origin: 100% 0;right:0;margin-right:3px;"
             :style="{
               color: '#888'
             }"
      >
        <template v-if="$reactive.main.isRecycleBinActive">
          剩余{{calculateExpiredDesc(snippet.expired)}} ~
        </template>
        <template v-if="snippet.dir">
          <n-icon size="16" class="global-color"><svg-directory/></n-icon>
        </template>
        <template v-else-if="snippet.image || snippet.type === 'image' || snippet.type === 'svg'">
          <n-icon size="16" class="global-color">
            <svg-image/>
          </n-icon>
        </template>
        <template v-else-if="snippet.link">
          <n-icon size="16" class="global-color"><svg-link/></n-icon>
        </template>
        <template v-else>
          {{pair.showType}}
        </template>
      </span>
    </n-card>

    <transition>
      <template v-if="$reactive.main.isDel && selected">
        <div class="snippet-item-btn">
          <span style="color: gray">确定删除?</span>
          <selectable-button  :mid="395"  type="primary" tip="搞错了" :index="0" @invoke="$reactive.main.isDel = false;" >
            ✗
          </selectable-button>
          <selectable-button :mid="440"  type="error" tip="真的删" :index="1" @invoke="handleDelete" >
            ✓
          </selectable-button>
        </div>
      </template>
      <template v-else-if="isShowBtn">
        <div class="snippet-item-btn" >
          <n-space>
            <selectable-button v-if="$reactive.main.isRecycleBinActive"  :disabled="snippet.help"  :mid="305"  type="warning" tip="恢复" :index="0" @invoke="doResume" >
              <svg-resume/>
            </selectable-button>
            <selectable-button v-else  :disabled="snippet.help || !GLOBAL_HIERARCHY.currentConfig?.edit"  :mid="305"  type="warning" tip="编辑" :index="0" @invoke="doEdit" >
              <svg-edit/>
            </selectable-button>
            <selectable-button :disabled="$reactive.main.isRecycleBinActive && snippet.dir"  :mid="350" type="primary" tip="预览" :index="1" @invoke="doViewCode" >
              <svg-view/>
            </selectable-button>
            <selectable-button :disabled="snippet.dir || snippet.link"  :mid="395"  type="info" tip="复制" :index="2" @invoke="snippetCopyOrPaste(false,false)" >
              <svg-copy/>
            </selectable-button>
            <selectable-button :disabled="!GLOBAL_HIERARCHY.currentConfig?.remove" :mid="440"  type="error" tip="删除" :index="3" @invoke="$reactive.main.isDel = true;$reactive.utools.subItemSelectedIndex=1">
              <svg-delete/>
            </selectable-button>
            <template v-if="props.snippet.index !== undefined">
              <selectable-button :disabled="snippet.help || $reactive.main.isRecycleBinActive" :mid="485"  type="primary"  color="#9b59b6" :index="4" tip="取消置顶" @invoke="handleCancelTop">
                <svg-top-down/>
              </selectable-button>
            </template>
            <template v-else>
              <selectable-button :disabled="snippet.help || $reactive.main.isRecycleBinActive" :mid="485"  type="primary"  color="#9b59b6" :index="4" tip="置顶" @invoke="handleSetTop">
                <svg-top-up/>
              </selectable-button>
            </template>
          </n-space>
        </div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import {computed, nextTick, queuePostFlushCb, ref} from "vue";
import {configManager} from "../js/utools/config";
import SelectableButton from "./item/SelectableButton.vue";
import {$index, $normal, $reactive, CODE_VIEW, EDIT_VIEW, refreshListView, refreshSearchResult} from "../js/store";
import NormalTag from "./base/NormalTag.vue";
import SingleLineCode from "./item/SingleLineCode.vue";
import MultiLineCode from "./item/MultiLineCode.vue";
import SvgEdit from "../asserts/edit.svg"
import SvgView from "../asserts/view.svg"
import SvgCopy from "../asserts/copy.svg"
import SvgDelete from "../asserts/delete.svg"
import SvgTopUp from "../asserts/top-up.svg"
import SvgTopDown from "../asserts/top-down.svg"
import SvgImage from "../asserts/image.svg"
import SvgDirectory from "../asserts/directory.svg"
import SvgLink from "../asserts/link.svg"
import SvgResume from "../asserts/resume.svg"
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";
import {snippetCopyOrPaste} from "../js/keyboard/k-common";
import {calculateExpiredDesc, calculateTime, escapeHtmlExceptB} from "../js/utils/common";
import {hierachyHubManager} from "../js/utools/hub";
import {doScrollForListView} from "../js/utils/scroller";

const showBtnModal = ref(false)
const props = defineProps(['snippet','selected','index','last'])
const isShowBtn = computed(()=>{
  if(showBtnModal.value){
    return true;
  }
  return !!(props.selected && $reactive.utools.subItemSelectedIndex > -1);
})
const isHover = ref(false)
const pair = computed(()=>{

  // type
  let showType = props.snippet.type?? 'plaintext';
  let renderType = showType;
  let code;
  // sideInfo
  let sideInfo = '';
  if(props.snippet.matchType === 1){
    sideInfo = ' 📗描述匹配';
  }else if(props.snippet.matchType === 2){
    sideInfo = ' 📘内容匹配';
  }
  if(props.snippet.sections){
    if(props.snippet.sections.length > 0){
      if(props.snippet.keyword){
        sideInfo = '✬×'+props.snippet.sections.length +  sideInfo;
      }else{
        sideInfo = '⚑×'+props.snippet.sections.length +  sideInfo;
      }
    }
  }else if(props.snippet.keyword){
    sideInfo = '✬' +  sideInfo;
  }
  if(props.snippet.dir){
    // if(props.snippet.ref === "local"){
    //   showType = "本地目录"
    // }else if(props.snippet.ref === "custom"){
    //   showType = "自定义目录"
    // }else{
    //   showType = "目录"
    // }
    showType = "目录"
  }else if(props.snippet.path && props.snippet.link) {
    showType = '🔗'
  }
  const mode = configManager.get('strategy_item_code_show');
  if(mode > 0){
    if(props.snippet.image){
      code = "[图片]: 存储在utools中，支持同步";
      renderType = 'plaintext';
    }
    else if(props.snippet.dir){
      if(props.snippet.ref === "local"){
        code = "[本地目录]: "+props.snippet.path;
      }else if(props.snippet.ref === "custom"){
        code = "[自定义目录]: "+props.snippet.path;
      }else{
        code = "[普通目录] ";
      }
      renderType = 'plaintext';
    }else{
      // file
      if(props.snippet.path){
        if(props.snippet.link) {
          code = '[关联链接]: ' + props.snippet.path;
          renderType = 'plaintext';
        }else{
          if(renderType === 'image' || renderType === 'svg'){
            if(mode === 1){
              code = '[关联图片]: '+props.snippet.path;
              renderType = 'plaintext';
            }else if(mode === 2){
              code = props.snippet.path;
              showType = '';
            }else{
              code = '[关联片段]: '+props.snippet.path;
              renderType = 'plaintext';
            }
          }else{
            code = '[关联片段]: '+props.snippet.path;
            renderType = 'plaintext';
          }
        }
      }else{ // normal code
        code = props.snippet.code;
        if(mode === 2 && renderType === 'svg'){
          showType = '';
        }
      }
    }
  }
  return {
    showType,renderType,code,sideInfo
  }
})

const getSelectedStyle =(selected,isHoverRef)=>{
  let style = utools.isDarkColors()? 'backgroundColor: #2a2a2c':'backgroundColor: #fff';
  if(isHoverRef){
    style = utools.isDarkColors()? 'backgroundColor: #3a3a3c' : 'background-color: #eaeef2'
  }
  if(selected){
    style = `background: ${$normal.theme.selectedColor}`
    // 保存当前滚动距离
    if($reactive.utools.focused){
      return `border: 2px solid transparent !important; ${style};`
    }
    return `border: 2px solid ${configManager.getGlobalColor()} !important; ${style}`;
  }else{
    return `border: 2px solid transparent !important; ${style}`;
  }
}


function handleDelete(){
  GLOBAL_HIERARCHY.remove(props.snippet,$reactive.main.isRecycleBinActive);
  $index.value--;
  $normal.keepSelectedStatus = true;
  $reactive.main.isDel = false;
  doItemRefresh(true);
}

function handleClick(e){
  $reactive.utools.focused = false;
  $reactive.utools.subItemSelectedIndex = -1;
  if(e.ctrlKey || e.metaKey){
    doViewCode()
  }
  if(props.selected){
    return;
  }
  if($reactive.main.isDel){
    $reactive.main.isDel = false;
  }
  $index.value = props.index;
}
function handleContextMenu(){
  showBtnModal.value=true;
  $reactive.utools.subItemSelectedIndex = -1;
  if(!props.selected){
    $index.value = props.index;
  }
}
function handleDoubleClick(){
  if(props.snippet.dir){
    GLOBAL_HIERARCHY.changeHierarchy("next")
  }else{
    snippetCopyOrPaste(true,false)
  }
}
function handleCancelTop(){
  GLOBAL_HIERARCHY.update(props.snippet,"top");
  $index.value = props.index;
  doItemRefresh()
}
function handleSetTop(){
  GLOBAL_HIERARCHY.update(props.snippet,"top");
  doItemRefresh()
}

function handleMouseLeave(e){
  if(showBtnModal.value){
    if($reactive.main.isOnlyOneElement){
      if(e.relatedTarget!=null){
        if(e.relatedTarget.classList.contains("n-popover") || e.relatedTarget.classList.contains("n-popover-arrow")){
          return;
        }
      }
    }
    showBtnModal.value=false;
    $reactive.main.isDel=false
  }
  isHover.value = false;
}
function doViewCode(){
  if(props.snippet.path && props.snippet.link){
    utools.shellOpenExternal(props.snippet.path)
    // fix
    $reactive.utools.subItemSelectedIndex = -1;
    return;
  }
  if(props.snippet.dir){
    GLOBAL_HIERARCHY.changeHierarchy("next")
    return
  }
  GLOBAL_HIERARCHY.changeView(CODE_VIEW);
}
function doEdit(){
  // $reactive.currentName = props.snippet.name;
  // $va r.currentMode = UPDATE_VIEW;
  GLOBAL_HIERARCHY.changeView(EDIT_VIEW)
}
function doResume(){
  hierachyHubManager.resumeElement(props.snippet.id);
  doItemRefresh(true);
}
function doItemRefresh(isDel){
  $normal.keepSelectedStatus = true;
  // refreshListView(true)
  if(isDel){
    refreshSearchResult()
  }
  refreshListView(true)
}

</script>

<style lang="scss">
.snippet-item{
  position: relative;
  overflow: hidden;

  .n-card{
    width:98vw;
    padding-bottom: 8px;
    margin: 3px 1vw 3px 1vw;
    position:relative;
    overflow: hidden;
    transition: width 0.4s ease-out;
  }
  .n-card-header{
    padding-left: 12px;
  }
}
#list-view .kitx-half-container .snippet-item .n-card{
  width: 50vw;
}

.snippet-item__tags{
  margin-bottom: 6px;
}
.snippet-item-btn{
  position: absolute;
  top:2px;
  left:0;
  z-index: 10;
  height: calc(100% - 4px);
  width: 98%;
  overflow: auto;
  margin-left: 1vw;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 磨砂感背景 */
  backdrop-filter: saturate(180%) blur(5px)!important;
  -webkit-backdrop-filter: saturate(180%) blur(5px)!important;
  /* 磨砂的背景颜色 */
  background: rgba(228,237,250,.1)!important;
}
#dark-app .snippet-item-btn{
  /* 磨砂的背景颜色 */
  background: rgba(255,255,255,.1)!important;
}



.snippet-item-head__left{
  z-index: 20;
}
.snippet-item__desc{
  font-size: 12px;
  display:inline-block;
  color: rgb(169, 168, 168);
  transform: scale(0.9); /* 用缩放来解决 */
  transform-origin: 0 0;  /* 左对齐 */
  margin-left: 10px;
}
.snippet-item__top {
  position: absolute;
  top:10px;
  left: 1px;
  width: 6px;
  height: 6px;
  background-color: transparent;
  border-radius: 50%;
}
.snippet-item__index{
  position: absolute;
  right: 0;
  top:-1px;
  font-size: 10px;
  transform: scale(0.9); /* 用缩放来解决 */
  transform-origin: 0 0;  /* 左对齐 */
  font-weight: bold;
  z-index: 20;
  color: #888;
}


.snippet-item-info{
  position: absolute;
  bottom: -1px;
  font-size:12px;
  transform: scale(0.8); /* 用缩放来解决 */
  line-height: 1;
}
.no-item-code {
  color: #676767;
}
#light-app .no-item-code{
  color:#bdbfc0;
}
.snippet-item__title{
  font-weight: bold;
  z-index: 20;
  color: #505050;
}
#dark-app .snippet-item__title{
  color: #E0E0E0;
}
.snippet-item__title i{
  color:red;
}


/* 下面我们会解释这些 class 是做什么的 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>