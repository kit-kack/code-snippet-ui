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
            content-style="padding: 0 10px"
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
              <span class="snippet-item__title"   v-html="snippet.temp??snippet.name"></span>
              <!-- 描述（标题右侧）  子代码片段 -->
              <span class="snippet-item__desc">{{ configManager.get('strategy_item_code_show') > 0 ? snippet.desc: pair.sideInfo}}</span>
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
        <multi-line-code :type="pair.renderType" :code="pair.code" :active="$index === index"/>
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
          <span class="snippet-item__desc" style="margin-left: 0px;">{{snippet.desc}}</span>
        </n-ellipsis>
      </template>


      <!-- 右侧下方 （语言类型|使用次数|上次使用时间） -->
      <span  class="snippet-item-info" style="  transform-origin: 100% 0;right:0;margin-right:3px;"
             :style="{
               color: snippet.dir ? $normal.theme.globalColor: '#888'
             }"
      >
              {{pair.showType}}
      </span>
    </n-card>

    <transition>
      <template v-if="$reactive.main.isDel && selected">
        <div class="snippet-item-btn">
          <span style="color: gray">确认删除?</span>
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
            <selectable-button  :disabled="snippet.help || !GLOBAL_HIERARCHY.currentConfig?.edit"  :mid="305"  type="warning" tip="编辑" :index="0" @invoke="doEdit" >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M20.998 6.25A3.25 3.25 0 0 0 17.748 3H6.25A3.25 3.25 0 0 0 3 6.25v11.499a3.25 3.25 0 0 0 3.25 3.25h4.914l.356-1.424l.02-.076H6.25a1.75 1.75 0 0 1-1.75-1.75v-9.25h14.998v2.733c.48-.19.994-.264 1.5-.22V6.25zM6.25 4.5h11.499c.966 0 1.75.783 1.75 1.75V7h-15v-.75c0-.967.784-1.75 1.75-1.75zm12.848 8.169l-5.901 5.901a2.685 2.685 0 0 0-.707 1.248l-.457 1.83c-.2.797.522 1.518 1.318 1.319l1.83-.458a2.685 2.685 0 0 0 1.248-.706L22.33 15.9a2.286 2.286 0 0 0-3.233-3.232z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button  :mid="350" type="primary" tip="预览" :index="1" @invoke="doViewCode" >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M8.086 18.611l5.996-14.004a1 1 0 0 1 1.878.677l-.04.11l-5.996 14.004a1 1 0 0 1-1.878-.677l.04-.11l5.996-14.004L8.086 18.61zm-5.793-7.318l4-4a1 1 0 0 1 1.497 1.32l-.083.094L4.414 12l3.293 3.293a1 1 0 0 1-1.32 1.498l-.094-.084l-4-4a1 1 0 0 1-.083-1.32l.083-.094l4-4l-4 4zm14-4.001a1 1 0 0 1 1.32-.083l.093.083l4.001 4.001a1 1 0 0 1 .083 1.32l-.083.095l-4.001 3.995a1 1 0 0 1-1.497-1.32l.084-.095L19.584 12l-3.293-3.294a1 1 0 0 1 0-1.414z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button :disabled="snippet.dir || snippet.link"  :mid="395"  type="info" tip="复制" :index="2" @invoke="copyCode(false)" >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M5.503 4.627L5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123zM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button :disabled="!GLOBAL_HIERARCHY.currentConfig?.remove" :mid="440"  type="error" tip="删除" :index="3" @invoke="$reactive.main.isDel = true;$reactive.utools.subItemSelectedIndex=1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <template v-if="props.snippet.index !== undefined">
              <selectable-button :disabled="snippet.help" :mid="485"  type="primary"  color="#9b59b6" :index="4" tip="取消置顶" @invoke="handleCancelTop">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><g fill="none"><path d="M10.5 11.174l.874-.998a.5.5 0 0 1 .752.658l-1.75 2a.5.5 0 0 1-.752 0l-1.75-2a.5.5 0 1 1 .752-.658l.874.998V7.495a.5.5 0 0 1 1 0v3.68zM4 16a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zm-1-2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9h-5.5V7.495a1.5 1.5 0 1 0-3 0V9H3v5z" fill="currentColor"></path></g></svg>
              </selectable-button>
            </template>
            <template v-else>
              <selectable-button :disabled="snippet.help" :mid="485"  type="primary"  color="#9b59b6" :index="4" tip="置顶" @invoke="handleSetTop">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><g fill="none"><path d="M10.5 8.826l.874.998a.5.5 0 0 0 .752-.658l-1.75-2a.5.5 0 0 0-.752 0l-1.75 2a.5.5 0 0 0 .752.658l.874-.998v3.679a.5.5 0 0 0 1 0v-3.68zM4 16a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zm-1-2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9h-3.834a1.495 1.495 0 0 0-.287-.493l-1.75-2a1.5 1.5 0 0 0-2.258 0l-1.75 2c-.13.15-.226.317-.287.493H3v5z" fill="currentColor"></path></g></svg>
              </selectable-button>
            </template>
          </n-space>
        </div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {configManager} from "../js/core/config";
import SelectableButton from "./base/SelectableButton.vue";
import {$index, $normal, $reactive, CODE_VIEW, EDIT_VIEW, refreshSearchResult} from "../js/store";
import NormalTag from "./base/NormalTag.vue";
import SingleLineCode from "./item/SingleLineCode.vue";
import MultiLineCode from "./item/MultiLineCode.vue";
import {copyCode} from "../js/utils/copy";
import {GLOBAL_HIERARCHY} from "../js/hierarchy/core";

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
    sideInfo = '📗描述匹配';
  }else if(props.snippet.matchType === 2){
    sideInfo = '📘内容匹配';
  }
  if(props.snippet.sections){
    if(props.snippet.sections.length > 0){
      if(props.snippet.keyword){
        sideInfo = '✬×'+props.snippet.sections.length + ' ' + sideInfo;
      }else{
        sideInfo = '⚑×'+props.snippet.sections.length + ' ' + sideInfo;
      }
    }
  }else if(props.snippet.keyword){
    sideInfo = '✬' + ' ' + sideInfo;
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
  if(configManager.get('strategy_item_code_show') > 0){
    if(props.snippet.dir){
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
        }else{
          code = '[关联片段]: '+props.snippet.path;
        }
        renderType = 'plaintext';
      }else{
        code = props.snippet.code;
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
  GLOBAL_HIERARCHY.remove(props.snippet)
  $index.value--;
  $normal.keepSelectedStatus = true;
  $reactive.main.isDel = false;
  doItemRefresh()
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
    copyCode(true)
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
function doItemRefresh(){
  $normal.keepSelectedStatus = true;
  // refreshListView(true)
  refreshSearchResult();
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
  }
  .n-card-header{
    padding-left: 12px;
  }
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
  width: 98vw;
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
  top:11px;
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