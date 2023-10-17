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
              <config-check-tag title="💡启用进阶模糊查询" config="enabledFuzzySymbolQuery"/>
            </template>
            启用后，使用最长公共子序列方式来进行匹配,例如 hd 能够匹配到 hello@WORLD ,支持C-F来切换
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡搜索词为空时，是否不显示数据" config="noShowForEmptySearch"/>
            </template>
            本功能只在 列表UI模式下 生效
          </n-tooltip>
        </n-space>
        <n-tooltip trigger="hover">
          <template #trigger>
            <config-check-tag title="💡标签辅助选择" config="aidTagSelect"/>
          </template>
          开启后，输入框输入#后，会辅助提示选择标签
        </n-tooltip>
      </n-space>
      <n-divider title-placement="center">
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
            <n-divider title-placement="center">
              💡清除自定义标签（若有关联颜色先清除颜色）
            </n-divider>
          </template>
          自定义标签被清除后，只会影响到编辑界面/辅助标签选择界面的标签选择
        </n-tooltip>
        <template v-if="refreshFlag">
          <n-space>
            <normal-tag raw v-for="tag in tagColorManager.all()" :content="tag" @tag-refresh="dealWithTagRefresh"/>
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
const sortKeyOptions = [
  {
    label: "创建时间排序",
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
    label: "名字自然排序",
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