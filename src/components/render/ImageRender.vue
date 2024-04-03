<template>
  <div class="image-render">
    <template v-if="imgId">
       <utools-image :id="imgId" :style="{
        maxHeight: '80vh',
        maxWidth: '90vw',
      transform: `translate(${x}px,${y}px)  scale( calc(${rate}/100))  rotate(${deg}deg) `}"/>
    </template>
    <template v-else-if="type === 'svg-code'">
      <div class="image-render-svg"
           :style="{
      transform: `translate(${x}px,${y}px)  scale( calc(${rate}/100))  rotate(${deg}deg) `
    }"
           v-html="url" draggable="true" @dragstart="handleDrag"></div>
    </template>
    <template v-else>
      <img :src="url" alt="图片加载失败了哦" :style="{
      transform: `translate(${x}px,${y}px)  scale( calc(${rate}/100))  rotate(${deg}deg) `,

    }" :class="{
        'svg-as-image': type === 'svg-url'
    }"
      >
    </template>
  </div>
</template>
<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import {RENDER_KEYHANDLER} from "../../js/keyboard/k-codeview";
import {Direction} from "../../js/utils/scroller";
import {SIDE_RENDER_KEYHANDLER} from "../../js/keyboard/k-listview";
import UtoolsImage from "../base/UtoolsImage.vue";

const props = defineProps({
  url: String,
  type: String, // image / svg-code / svg-url
  isSideView: Boolean,
  imgId: String
});
const rate = ref(100)
const deg = ref(0)
const x = ref(0)
const y = ref(0)
function doScale(up,step=5){
  let newRate = rate.value + (up ? step : -step)
  if(newRate < 10){
    newRate = 10
  }
  rate.value = newRate;
}
function doMove(direction){
  switch (direction){
    case Direction.UP:
      y.value += 10;
      break;
    case Direction.DOWN:
      y.value -= 10;
      break;
    case Direction.LEFT:
      x.value += 10;
      break;
    case Direction.RIGHT:
      x.value -= 10;
      break;
  }
}
function doRotate(up){
  deg.value += (up ? 90 : -90)
}
/**
 * @type KeyDownHandler
 */
const K_CODEVIEW_IMAGE_DOWN= ({code,shift})=>{
  switch (code){
    case 'KeyL':
    case 'ArrowRight':
      if(shift){
        doRotate(true)
      }else{
        doMove(Direction.RIGHT);
      }
      break;
    case 'KeyH':
    case 'ArrowLeft':
      if(shift){
        doRotate(false)
      }else{
        doMove(Direction.LEFT)
      }
      break;
    case 'KeyJ':
    case 'ArrowDown':
      if(shift){
        doScale(true)
      }else{
        doMove(Direction.DOWN)
      }
      break;
    case 'KeyK':
    case 'ArrowUp':
      if(shift){
        doScale(false)
      }else{
        doMove(Direction.UP)
      }
      break;
    case 'Digit0':
      rate.value = 100;
      deg.value = 0;
      x.value = 0;
      y.value = 0;
      break;

    default:
      return;
  }
  return true;
}
const K_SIDE_CODEVIEW_IMAGE_HANDLER = (code)=>{
  switch (code){
    case 'KeyL':
    case 'ArrowRight':
      doMove(Direction.RIGHT);
      break;
    case 'KeyH':
    case 'ArrowLeft':
      doMove(Direction.LEFT)
      break;
    case 'KeyJ':
    case 'ArrowDown':
      doMove(Direction.DOWN)
      break;
    case 'KeyK':
    case 'ArrowUp':
      doMove(Direction.UP)
      break;
    case 'KeyG':
      rate.value = 100;
      deg.value = 0;
      x.value = 0;
      y.value = 0;
      break;
    default:
      return true;
  }
  return true;
}
function handleWheel(e){
  const up = e.wheelDelta > 0
  if(e.ctrlKey || e.metaKey){  // scale
    doScale(up)
  }else if(e.shiftKey){  // horizon translate
    doMove(up? Direction.LEFT: Direction.RIGHT)
  }else if(e.altKey){  // rotate
    doRotate(!up)
  }else{  // vertical translate
    doMove(up? Direction.UP: Direction.DOWN)
  }
}


function handleDrag(e){
  e.dataTransfer.dropEffect = 'copy';
  e.dataTransfer.setData('text/html',e.target.innerHTML)
  e.dataTransfer.setData('image/svg+xml',e.target.innerHTML)
  e.dataTransfer.setData('text/plain', props.url);

}
onMounted(()=>{
  document.querySelector('#code-view')?.classList?.toggle('dot-bg')
  window.onwheel = handleWheel;
  if(props.isSideView){
    SIDE_RENDER_KEYHANDLER.IMAGE_HANDLER = K_SIDE_CODEVIEW_IMAGE_HANDLER
  }else{
    RENDER_KEYHANDLER.onKeyDown = K_CODEVIEW_IMAGE_DOWN
  }
})
onUnmounted(()=>{
  document.querySelector('#code-view')?.classList?.toggle('dot-bg')
  window.onwheel = null;
  if(props.isSideView){
    SIDE_RENDER_KEYHANDLER.IMAGE_HANDLER = null
  }else{
    RENDER_KEYHANDLER.onKeyDown = null
  }
})
</script>
<style>
#code-view.dot-bg{
  background-image: radial-gradient(#eee 20%, transparent 0), radial-gradient(#eee 20%, transparent 0);
  background-size: 20px 20px;
  /* 第二背景的偏移定位值必须是贴片宽高的一半 30/2 */
  background-position: 0 0, 10px 10px;
}
#light-app-v5 #code-view.dot-bg{
  background-image: radial-gradient(#ccc 20%, transparent 0), radial-gradient(#e0e0e0 20%, transparent 0);
}
#dark-app #code-view.dot-bg{
  background-image: radial-gradient(#444 20%, transparent 0), radial-gradient(#444 20%, transparent 0);
}
.image-render{
  color: #eee;
  background-attachment: fixed;
  height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-render > img{
  border-radius: 5px;
  width: 95%;
  transition: box-shadow .2s;
}
.image-render > img:hover{
  box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
}
.image-render-svg svg, .image-render > img.svg-as-image{
  width: 200px;
  height: 200px;
  color: #000;
}
.image-render-svg svg:hover, .image-render-file:hover{
  box-shadow: #eaeef2 0 4px 32px;
}
</style>