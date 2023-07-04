<template>
  <div id="extra-left" v-if="!$var.utools.focused && $var.view.fullScreenShow" >
    <n-tooltip trigger="hover" >
      <template #trigger>
        <n-button  round strong  :="getBtnStyle()" @click="handleVimStatusBarClick()">
          <template #icon>
            <svg :fill="$var.currentMode <= CODE_VIEW? configManager.getGlobalColor():'white'"
                 version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512"
                 enable-background="new 0 0 512 512" xml:space="preserve"><path d="M476.9,114c-5-23.4-17.5-38.8-40.6-46.3s-64.9-4.5-94.1,16.8c-29.9,21.8-47.6,59.7-53.8,83.8c14.7-6.3,24-7.7,39-6.9
	s24.5,12,24.9,25.3c0.3,9.8-0.2,18.7-3.6,27.7c-10.8,28.7-27.7,56.5-47.6,80.8c-2.9,3.6-6.4,6.9-10,9.9c-10.2,8.3-18.8,6.1-25.4-5.2
	c-5.4-9.3-9-18.9-12.2-29.1c-12.4-39.7-16.8-80.9-23.8-121.6c-3.3-19.5-7-39.8-18-56.9c-11.6-17.8-28.6-24.6-50-22
	c-14.7,1.8-36.9,17.5-47.8,26.4c0,0-56,46.9-81.8,71.4l21.2,27c0,0,17.9-12.5,27.5-18.3c5.7-3.4,12.4-4.1,17.2,0.2
	c4.5,3.9,9.6,9,12.3,14.1c5.7,10.7,11.2,21.9,14.7,33.4c13.2,44.3,25.5,88.7,37.8,133.3c6.3,22.8,13.9,44.2,28,63.6
	c19.3,26.6,39.6,32.7,70.9,21.5c25.4-9.1,46.6-26.2,66-43.9c33.1-30.2,59.1-65.4,85.5-101.2c20.4-27.7,37.3-55.7,51.4-87
	C478.5,179.8,484,147.3,476.9,114z"></path></svg>
          </template>
          {{$var.utools.selectedIndex}}{{$var.utools.subItemSelectedIndex > -1? `#${$var.utools.subItemSelectedIndex}`:''}}
        </n-button>
      </template>
      {{($var.currentMode <= CODE_VIEW)? 'Utool输入框失去焦点，才能成功启用Vim模式':'Vim模式不适用当前场景'}}
    </n-tooltip>
  </div>

</template>

<script setup>
import {codeSnippetManager, configManager} from "../js/core.js";
import {$var, CODE_VIEW, LIST_VIEW} from "../js/store";
import {toRaw} from "vue";
const getBtnStyle = ()=>{
  if($var.currentMode<= CODE_VIEW){
    return {
      color: utools.isDarkColors()? '#444444':'#e3e3e3',
      textColor: configManager.getGlobalColor()
    }
  }else{
    return {
      color: '#ff4757',
      textColor: 'white'
    }
  }
}

let showCount = 0 // 必须要到达 7
let clearCount = 0
let lastTime = 0  // 时间
const handleVimStatusBarClick = ()=>{
  if($var.currentMode === LIST_VIEW){
    if(showCount === 7){
      $message.success("花点时间去看看外面的风景吧")
      showCount = 0;
    }else{
      showCount++;
    }
  }else if($var.currentMode === CODE_VIEW){
    let now = Date.now();
    if(now - lastTime < 500){
      if(clearCount === 5){
        $message.info("清除 所有高亮行")
        $var.currentSnippet.sections = [];
        codeSnippetManager.update(toRaw(($var.currentSnippet)))
        clearCount = 0;
      }else{
        clearCount++;
      }
    }else{
      clearCount = 1;
    }
    lastTime = now;
  }
}

</script>

<style scoped>
#extra-left{
  position: fixed;
  left:20px;
  bottom: 12px;
  font-size: 12px;
  z-index: 20;
}
</style>