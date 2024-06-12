<template>
  <div id="extra-left" v-if="show" >
    <n-tooltip trigger="hover" :show-arrow="false" :keep-alive-on-hover="false">
      <template #trigger>
        <n-button :focusable="false"  round strong  :="getBtnStyle()">
          <template #icon>
            <n-icon>
              <svg-vim/>
            </n-icon>
          </template>
          {{$index}}{{$reactive.utools.subItemSelectedIndex > -1? `#${$reactive.utools.subItemSelectedIndex}`:''}}
        </n-button>
      </template>
      {{($reactive.currentMode <= CODE_VIEW)? 'Vim模式启用中':'Vim模式不可用'}}
    </n-tooltip>

  </div>

</template>

<script setup>
import {configManager} from "../js/utools/config";
import {$index, $reactive, CODE_VIEW, CREATE_VIEW, EDIT_VIEW} from "../js/store";
import {computed} from "vue";
import SvgVim from "../asserts/vim.svg";

const show = computed(()=>{
  // !$reactive.utools.focused && $reactive.view.fullScreenShow
  if($reactive.currentMode === CODE_VIEW){
    if($reactive.code.isPure){
      return false;
    }
  }else if($reactive.currentMode > CODE_VIEW){
    if($reactive.form.fullScreen){
      return false;
    }
  }
  return !$reactive.utools.focused && $reactive.main.isFullScreenShow
})
const getBtnStyle = ()=>{
  if($reactive.currentMode<= CODE_VIEW){
    return {
      color: utools.isDarkColors()? '#3a3a3a':'#e3e3e3',
      textColor: configManager.getGlobalColor()
    }
  }else{
    return {
      color: '#ff4757',
      textColor: 'white'
    }
  }
}
</script>

<style>
#extra-left{
  position: fixed;
  left:20px;
  bottom: 12px;
  font-size: 12px;
  z-index: 2000;
}
</style>