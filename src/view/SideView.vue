<template>
  <n-tabs type="segment"
          pane-style="height:calc(100vh - 51px)"
          placement="bottom" animated  :default-value="0" justify-content="space-evenly" >
    <n-tab-pane :name="0" tab="设置">
      <n-divider>
        数据导出导入
      </n-divider>
      <n-space vertical align="center">
        <n-space>
          <n-button  strong secondary round type="primary"  @click="handleImport">
            导入文件
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zM902 476H588v-76c0-6.7-7.8-10.5-13-6.3l-141.9 112a8 8 0 0 0 0 12.6l141.9 112c5.3 4.2 13 .4 13-6.3v-76h314c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" fill="currentColor"></path></svg>
            </template>
          </n-button>
          <n-button  strong secondary round type="info"  @click="handleExport" >
            导出数据
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zm18.6-251.7L765 393.7c-5.3-4.2-13-.4-13 6.3v76H438c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z" fill="currentColor"></path></svg>
            </template>
          </n-button>
        </n-space>
      </n-space>
      <n-divider>
        测试Beta
      </n-divider>
      <n-space vertical align="center">
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡标签辅助选择" config="aidTagSelect"/>
            </template>
            开启后，输入框输入#后，会辅助提示选择标签
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡搜索子代码片段" config="allowSearchSubSnippet"/>
            </template>
            开启后，可以通过 name$num 搜索复制粘贴 name对应的num号子代码片段
          </n-tooltip>
        </n-space>
      </n-space>
      <n-divider>
        个性化设置
      </n-divider>
      <n-space vertical align="center">
<!--        <config-switch title="自动本地备份" config="closeHelpSnippet"/>-->
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡默认启用列表UI模式" config="enabledLiteShow"/>
            </template>
            这里是指初进入插件时的默认显示策略
          </n-tooltip>
          <config-check-tag title="关闭显示入门手册" config="closeHelpSnippet" @refresh="refreshListView()"/>
        </n-space>
        <n-space>
          <custom-view/>
        </n-space>
      </n-space>
    </n-tab-pane>
    <n-tab-pane :name="1" tab="标签与占位符">
      <n-scrollbar style="max-height: 91vh">
        <n-tooltip>
          <template #trigger>
            <n-divider>
              💡清除自定义标签（若有关联颜色先清除颜色）
            </n-divider>
          </template>
          自定义标签被清除后，只会影响到编辑界面/辅助标签选择界面的标签选择
        </n-tooltip>
        <template v-if="refreshFlag">
          <n-space>
            <normal-tag type="clear" v-for="tag in tagColorManager.all()" :content="tag" @tag-refresh="dealWithTagRefresh"/>
          </n-space>
        </template>
        <func-pane/>
      </n-scrollbar>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import {tagColorManager} from "../js/core/tag";
import {codeSnippetManager} from "../js/core/snippet";
import {configManager} from "../js/core/config";
import {ref} from "vue";
import NormalTag from "../components/NormalTag.vue";
import ConfigCheckTag from "../components/ConfigCheckTag.vue";
import {NButton} from "naive-ui";
import {getRefreshFunc} from "../js/utils/common";
import FuncPane from "../components/pane/FuncPane.vue";
import {refreshListView} from "../js/store";
import CustomView from "./CustomView.vue";

const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag);
const dealWithTagRefresh = ()=>{
  refreshListView()
  doRefresh();
}


const handleExport = ()=>{
  const realPath = utools.showSaveDialog({
    title: 'code-snippet备份文件保存位置',
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '保存',
    filters: [
      {name: 'zip', extensions: ['zip']}
    ],
    properties: ['showOverwriteConfirmation']
  })
  if (realPath != null) {
    codeSnippetManager.store(realPath)
  }
}
const handleImport = ()=>{
  const realPathList = utools.showOpenDialog({
    title: '指定你的数据导入文件',
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '导入',
    filters: [
      {name: 'zip', extensions: ['zip']}
    ],
    properties: [
      'openFile'
    ]
  })
  if (realPathList != null) {
      codeSnippetManager.load(realPathList[0])
      refreshListView()
  }
}


</script>

<style scoped>
.n-select{
  width: 130px;
}
.n-divider{
  height: 12px;
}
#diy{
  position: absolute;
  right:2px;
  bottom:2px;
}
</style>