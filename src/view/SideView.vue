<template>
  <n-tabs type="segment"
          pane-style="height:calc(100vh - 51px)"
          placement="bottom" animated  :default-value="0" justify-content="space-evenly" >
    <n-tab-pane :name="0" tab="设置">
      <n-divider title-placement="center">
        数据导出导入
      </n-divider>
      <n-space vertical align="center">
        <div>
          当前共有{{codeSnippetManager.codeMap.size}}条数据，可以被 <n-button  quaternary type="info" size="small" @click="handleExport" :color="configManager.getGlobalColor()">导出</n-button>
        </div>
        <div>
          当然你也可以<n-button  quaternary type="info" size="small" @click="handleImport" :color="configManager.getGlobalColor()">导入</n-button>数据，注意要符合格式哦!
        </div>
      </n-space>
      <n-divider title-placement="center">
        搜索相关设置
      </n-divider>
      <n-space vertical align="center">
        <n-space>
          搜索排序策略
          <n-select size="tiny"
                    :options="sortKeyOptions"
                    :default-value="configManager.getSortKey()"
                    @update:value="handleSortStrategy"/>
        </n-space>
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡启用模糊符号查询" config="enabledFuzzySymbolQuery"/>
            </template>
            启用后，忽略符号来进行匹配，例如使用ab能查询到a@b记录（忽略中间的@符号）,支持C-f来切换
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡搜索词为空时，是否不显示数据" config="noShowForEmptySearch"/>
            </template>
            本功能只在 列表UI模式下 生效
          </n-tooltip>
        </n-space>
      </n-space>
      <n-divider title-placement="center">
        其他设置
      </n-divider>
      <n-space vertical align="center">
        <n-tooltip trigger="hover">
          <template #trigger>
            <config-switch title="💡是否开启自动备份" config="autoBackup"/>
          </template>
          每三天自动备份一次，备份文件位置：%home%\code-snippet-backup.md
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <config-switch title="💡默认是否启用列表UI模式" config="enabledLiteShow"/>
          </template>
          这里是指初进入插件时的显示策略
        </n-tooltip>
        <config-switch title="粘贴后插件是否退出" config="exitAfterPaste"/>
        <config-switch title="双击元素启用粘贴代码片段功能" config="doubleClickPaste"/>
        <config-switch title="点击元素是否自动进入Vim模式" config="enabledAutoVim"/>
        <config-switch title="无法上下浏览时是否播放哔哔声" config="enabledBeep"/>
        <n-tooltip placement="left" trigger="hover">
          <template #trigger>
            <n-button id="diy"  circle  @click="$var.view.settingActive = false;$var.view.customActive = true">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><rect fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" x="280.48" y="122.9" width="63.03" height="378.2" rx="31.52" transform="rotate(-45 312.002 311.994)"></rect><path d="M178.38 178.38a31.64 31.64 0 0 0 0 44.75L223.25 268L268 223.25l-44.87-44.87a31.64 31.64 0 0 0-44.75 0z" fill="currentColor"></path><path stroke="currentColor" stroke-miterlimit="10" stroke-width="32" stroke-linecap="round" d="M48 192h48" fill="currentColor"></path><path stroke="currentColor" stroke-miterlimit="10" stroke-width="32" stroke-linecap="round" d="M90.18 90.18l33.94 33.94" fill="currentColor"></path><path stroke="currentColor" stroke-miterlimit="10" stroke-width="32" stroke-linecap="round" d="M192 48v48" fill="currentColor"></path><path stroke="currentColor" stroke-miterlimit="10" stroke-width="32" stroke-linecap="round" d="M293.82 90.18l-33.94 33.94" fill="currentColor"></path><path stroke="currentColor" stroke-miterlimit="10" stroke-width="32" stroke-linecap="round" d="M124.12 259.88l-33.94 33.94" fill="currentColor"></path></svg>                </template>
            </n-button>
          </template>
          个性化定制
        </n-tooltip>

      </n-space>
    </n-tab-pane>
    <n-tab-pane :name="1" tab="标签与变量">
      <n-scrollbar style="max-height: 91vh">
        <n-tooltip>
          <template #trigger>
            <n-divider title-placement="center">
              💡清除自定义标签（若有关联颜色先清除颜色）
            </n-divider>
          </template>
          自定义标签被清除后，只会影响到创建/更新 代码片段的表单界面中的标签选择
        </n-tooltip>
        <template v-if="refreshFlag">
          <n-space>
            <normal-tag raw v-for="tag in tagColorManager.all()" :content="tag" @tag-refresh="dealWithTagRefresh"/>
          </n-space>
        </template>
        <variable-pane/>
      </n-scrollbar>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import ConfigSwitch from "../components/ConfigSwitch.vue";
import {codeSnippetManager, configManager, tagColorManager} from "../js/core.js";
import {ref} from "vue";
import NormalTag from "../components/NormalTag.vue";
import {$var} from "../js/store";
import ConfigCheckTag from "../components/ConfigCheckTag.vue";
import {NButton} from "naive-ui";
import {getRefreshFunc} from "../js/utils/common";
import {refreshListView} from "../js/some";
import VariablePane from "../components/VariablePane.vue";

const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag);
const dealWithTagRefresh = ()=>{
  refreshListView()
  doRefresh();
}
const sortKeyOptions = [
  {
    label: "创建次序",
    value: 0
  },
  {
    label: "最近使用时间",
    value: 1
  },
  {
    label: "累计使用次数",
    value: 2
  },
  {
    label: "自然排序",
    value: 3
  }
]
const handleSortStrategy = (v)=>{
  configManager.set('sortKey',v);
  console.log(v)
  refreshListView()
}

const handleExport = ()=>{
  const realPath = utools.showSaveDialog({
    title: 'code-snippet文件保存位置',
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '保存',
    filters: [
      {name: 'md', extensions: ['md', 'markdown']}
    ],
    properties: ['showOverwriteConfirmation']
  })
  if (realPath != null) {
    codeSnippetManager.store(realPath)
    utools.showNotification('数据已成功导出至'+realPath)
  }
}
const handleImport = ()=>{
  const realPathList = utools.showOpenDialog({
    title: '指定你的数据导入文件',
    defaultPath: utools.getPath('desktop'),
    buttonLabel: '导入',
    filters: [
      {
        name: 'md', extensions: ['md', 'markdown']
      }
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