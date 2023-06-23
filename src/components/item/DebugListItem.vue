<template>
  <div id="main"
       @contextmenu="handleContextMenu"
       @mouseleave="handleMouseLeave"
       @mouseenter="isHover = true"
  >
    <n-card
        embedded
        size="small"
        content-style="padding: 0 10px"
        header-style="height:28px;"
        :style="getSelectedStyle(isSelected,isHover)"
    >
      <div class="circle"
           :style="{
              backgroundColor: configManager.getTopList().includes(snippet.name)? configManager.getGlobalColor(): ''
           }"
      ></div>
      <span class="index" :style="getTitleStyle(false)">0</span>
      <template #header>
        <n-scrollbar x-scrollable>
          <div id="left">
            <n-ellipsis >
              <span :style="getTitleStyle(true)"  >{{snippet.name}}</span>
              <span id="small">{{snippet.desc}}</span>
            </n-ellipsis>
          </div>
        </n-scrollbar>
      </template>
      <template #header-extra >
        <div id="right">
          <n-scrollbar x-scrollable :size="10">
            <div class="sub">
              <template v-if="flag">
                <n-tag id="tag"  :bordered="false" size="small" :color="colorStyle" >test</n-tag>
              </template>
              <template v-else>
                <inlaid-tag :type="snippet.type" :count="snippet.count" :time="snippet.time"/>
              </template>
            </div>
          </n-scrollbar>
        </div>
      </template>
      <template v-if="flag">
        <inlaid-tag :type="snippet.type" :count="snippet.count" :time="snippet.time"/>
      </template>
      <template v-else>
        <n-tag id="tag"  :bordered="false" size="small" :color="colorStyle" >test</n-tag>
      </template>
      <template v-if="configManager.get('fullItemCodeShow')">
        <multi-line-code :type="snippet.type" :code="snippet.code"/>
      </template>
      <template v-else>
        <single-line-code :type="snippet.type" :code="snippet.code"/>
      </template>
    </n-card>

    <transition>
      <template v-if="isShowBtn">
        <div id="child" >
          <n-space>
            <selectable-button :mid="305"  type="warning" tip="编辑" :index="0"  >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M20.998 6.25A3.25 3.25 0 0 0 17.748 3H6.25A3.25 3.25 0 0 0 3 6.25v11.499a3.25 3.25 0 0 0 3.25 3.25h4.914l.356-1.424l.02-.076H6.25a1.75 1.75 0 0 1-1.75-1.75v-9.25h14.998v2.733c.48-.19.994-.264 1.5-.22V6.25zM6.25 4.5h11.499c.966 0 1.75.783 1.75 1.75V7h-15v-.75c0-.967.784-1.75 1.75-1.75zm12.848 8.169l-5.901 5.901a2.685 2.685 0 0 0-.707 1.248l-.457 1.83c-.2.797.522 1.518 1.318 1.319l1.83-.458a2.685 2.685 0 0 0 1.248-.706L22.33 15.9a2.286 2.286 0 0 0-3.233-3.232z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button :mid="350" type="primary" tip="预览代码" :index="1"  >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M8.086 18.611l5.996-14.004a1 1 0 0 1 1.878.677l-.04.11l-5.996 14.004a1 1 0 0 1-1.878-.677l.04-.11l5.996-14.004L8.086 18.61zm-5.793-7.318l4-4a1 1 0 0 1 1.497 1.32l-.083.094L4.414 12l3.293 3.293a1 1 0 0 1-1.32 1.498l-.094-.084l-4-4a1 1 0 0 1-.083-1.32l.083-.094l4-4l-4 4zm14-4.001a1 1 0 0 1 1.32-.083l.093.083l4.001 4.001a1 1 0 0 1 .083 1.32l-.083.095l-4.001 3.995a1 1 0 0 1-1.497-1.32l.084-.095L19.584 12l-3.293-3.294a1 1 0 0 1 0-1.414z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button :mid="395" lite type="info" tip="复制" :index="2"  >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M5.503 4.627L5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123zM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button :mid="440" lite type="error" tip="删除" :index="3" >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
            </selectable-button>
            <selectable-button :mid="485" lite type="primary"  color="#9b59b6" :index="4" tip="取消置顶">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><g fill="none"><path d="M10.5 11.174l.874-.998a.5.5 0 0 1 .752.658l-1.75 2a.5.5 0 0 1-.752 0l-1.75-2a.5.5 0 1 1 .752-.658l.874.998V7.495a.5.5 0 0 1 1 0v3.68zM4 16a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zm-1-2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9h-5.5V7.495a1.5 1.5 0 1 0-3 0V9H3v5z" fill="currentColor"></path></g></svg>
            </selectable-button>
          </n-space>
        </div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import {computed, reactive, ref} from "vue";
import InlaidTag from "../InlaidTag.vue";
import {configManager} from "../../js/core.js";
import SelectableButton from "../SelectableButton.vue";
import {$var} from "../../js/store";
import SingleLineCode from "./SingleLineCode.vue";
import MultiLineCode from "./MultiLineCode.vue";
import Color from "../../js/lib/color";

const isHover = ref(false)
const isSelected = ref(false)
let showBtnModal = ref(false)
const flag = configManager.get('shiftTagPosition')
const isShowBtn = computed(()=>{
  if(showBtnModal.value){
    return true;
  }
  return !!(isSelected && $var.utools.subItemSelectedIndex > -1);
})
let color = configManager.getColor('TagColor')
if(color[0]==='#'){
  color = Color.hexaToRbga(color)
}
const colorStyle = reactive({
  color: Color(color).lightenByRatio(1),
  textColor:color
})
const props = defineProps(['mode'])
const getTitle=()=>{
  switch (props.mode){
    case 'normal':
      return "默认情况，可测试鼠标滑过Hover效果";
    case "selected":
      return "点击被选中情况";
    case "vim":
      return "Vim模式下被选中情况（体现为边框）"
  }
}

const snippet = {
  name: "test",
  desc: getTitle(),
  code: "console.log('当前代码代码片段仅用于测试自定义配置数据，共有七行')\nconsole.log('这是第二行数据')\nconsole.log('这是第三行数据')\nconsole.log('这是第四行数据')\nconsole.log('这是第五行数据')\nconsole.log('这是第六行数据')\nconsole.log('这是第七行数据')",
  type: 'javascript',
  tags: ['test'],
  count: 100,
  time: 0
}
const getSelectedStyle = (isSelectedRef, isHoverRef)=>{
  let style;
  switch (props.mode){
    case "normal":
      style = utools.isDarkColors()? 'backgroundColor: #2a2a2c':'';
      if(isHoverRef){
        style = utools.isDarkColors()? 'backgroundColor: #3a3a3c' : 'background-color: #f5f5f5'
      }
      return `border: 2px solid transparent !important; ${style}`;
    case "selected":
      style = `background: ${configManager.getColor('SelectedColor')}`
      // style = utools.isDarkColors()? 'backgroundColor: #515151' : `background-color: #f9fff5`;
      return `border: 2px solid transparent !important; ${style}`
    case "vim":
      style = `background: ${configManager.getColor('SelectedColor')}`
      // style = utools.isDarkColors()? 'backgroundColor: #515151' : `background-color: #f9fff5`
      return `border: 2px solid ${configManager.getGlobalColor()} !important; ${style}`;
  }
}
const getTitleStyle = (flag) =>{
  return {
    color: props.mode!=='normal'? configManager.getGlobalColor():(utools.isDarkColors()?'#E0E0E0':'#505050'),
    fontWeight: flag?'bold':'normal',
    'zIndex': 20
  }
}

const handleContextMenu = ()=>{
  showBtnModal.value=true;
  $var.utools.subItemSelectedIndex = -1;
}

const handleMouseLeave = (e)=>{
  if(showBtnModal.value){
    if($var.others.onlyOne){
      if(e.relatedTarget!=null){
        if(e.relatedTarget.classList.contains("n-popover") || e.relatedTarget.classList.contains("n-popover-arrow")){
          return;
        }
      }
    }
    showBtnModal.value=false;
    $var.view.isDel=false
  }
  isHover.value = false;
}

</script>

<style scoped>
#main{
  position: relative;
  overflow: hidden;
  margin-bottom: 5px;
}
#child{
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

.n-card{
  width:98vw;
  margin: 2px 1vw 2px 1vw;
  position:relative;
  overflow: hidden;
}



#left{
  max-width: 400px;
  z-index: 20;
}
#small{
  margin-left: 10px;
  font-size: 12px;
  display:inline-block;
  color: rgb(169, 168, 168);
  transform: scale(0.9); /* 用缩放来解决 */
  transform-origin: 0 0;  /* 左对齐 */
}
#right{
  max-width: 300px;
  overflow: auto;
  margin-right: 5px;
}
.sub{
  margin-bottom: 6px;
}


.circle {
  position: absolute;
  top:11px;
  left: 2px;
  width: 6px;
  height: 6px;
  background-color: transparent;
  border-radius: 50%;
  z-index: 100;
}
.index{
  position: absolute;
  right: 0;
  top:-1px;
  font-size: 10px;
  transform: scale(0.9); /* 用缩放来解决 */
  transform-origin: 0 0;  /* 左对齐 */
}

.n-card:hover .circle{
  animation: blink 1s 3 steps(1);
}


@keyframes blink{
  50% {
    background-color: transparent;
  }
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
#tag{
  height: 14px;
}
</style>