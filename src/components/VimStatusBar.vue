<template>
  <div id="extra-left" v-if="show" >
    <n-tooltip trigger="hover" :show-arrow="false" :keep-alive-on-hover="false">
      <template #trigger>
        <n-button :focusable="false"  round strong  :="getBtnStyle()" @click="handleVimStatusBarClick()">
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

    <n-modal v-model:show="statisticsShow"
             preset="card"
             title="本地统计"
             style="width: 66%"
             :auto-focus="false"

    >
      <div id="statistics">
        <template v-for="stat in statisticsManager.getStatistics()">
          <template v-if="stat.label === '使用天数'">
            <n-tooltip>
              <template #trigger>
                <n-statistic :label="stat.label">
                  <n-number-animation show-separator :from="0" :to="stat.value[0]"/>
                  /
                  <n-number-animation show-separator :from="0" :to="stat.value[2]"/>
                </n-statistic>
              </template>
              有效使用天数 / 安装天数
            </n-tooltip>
          </template>
          <template v-else>
            <n-statistic :label="stat.label">
              <n-number-animation show-separator :from="0" :to="stat.value[0]"/>
              /
              <n-number-animation show-separator :from="0" :to="stat.value[1]"/>
              /
              <n-number-animation show-separator :from="0" :to="stat.value[2]"/>
            </n-statistic>
          </template>
        </template>
      </div>
      <h5 style="font-weight: normal"><span style="font-weight: bold">今日 / 最近七日 / 总计</span> &nbsp;&nbsp;|&nbsp;&nbsp; 由于插件在v2.7.2版本才开始统计，数据仅供参考</h5>
    </n-modal>

  </div>

</template>

<script setup>
import {configManager} from "../js/utools/config";
import {$index, $reactive, CODE_VIEW, CREATE_VIEW, EDIT_VIEW, LIST_VIEW} from "../js/store";
import {computed, ref} from "vue";
import SvgVim from "../asserts/vim.svg";
import {statisticsManager} from "../js/utools/statistics";

const statisticsShow = ref(false)
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

let showCount = 0 // 必须要到达 3
let lastTime = 0  // 时间
function handleVimStatusBarClick(){
  const now = Date.now();
  if(now - lastTime > 500){
    lastTime = now;
    showCount = 0;
    return;
  }
  lastTime = now;
  showCount++;
  if(showCount === 3){
    if($reactive.currentMode === LIST_VIEW){
      configManager.set('easter_egg_log',true);
      statisticsShow.value = !statisticsShow.value
    }else if($reactive.currentMode === CODE_VIEW){
      $message.success("怕无归期，怕空欢喜，怕来者不是你。");
    }else if($reactive.currentMode === EDIT_VIEW){
      $message.error("我试过销声匿迹，最终也无人问及。");
    }else if($reactive.currentMode === CREATE_VIEW){
      $message.error("孤单年少岁月长，暮色沉沉晚风凉。");
    }
    showCount = 0;
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
#statistics{
  font-size: 12px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

#statistics .n-statistic .n-statistic-value .n-statistic-value__content{
  font-size: 12px !important;
}
</style>