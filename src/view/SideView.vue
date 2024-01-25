<template>
  <n-tabs type="segment"
          pane-style="height:calc(100vh - 51px)"
          placement="bottom" animated  :default-value="0" justify-content="space-evenly" >
    <n-tab-pane :name="0" tab="设置">
      <n-divider>
        备份
      </n-divider>
      <n-space vertical align="center">
        <n-space>
          <n-button strong secondary round type="primary"  @click="handleImport">
            备份导入
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zM902 476H588v-76c0-6.7-7.8-10.5-13-6.3l-141.9 112a8 8 0 0 0 0 12.6l141.9 112c5.3 4.2 13 .4 13-6.3v-76h314c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" fill="currentColor"></path></svg>
            </template>
          </n-button>
          <n-button  strong secondary round type="info"  @click="handleExport" >
            生成备份
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zm18.6-251.7L765 393.7c-5.3-4.2-13-.4-13 6.3v76H438c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z" fill="currentColor"></path></svg>
            </template>
          </n-button>
        </n-space>
      </n-space>
      <n-divider>
        Beta功能
      </n-divider>
      <n-space vertical align="center">
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡搜索子代码片段" config="beta_sub_snippet_search"/>
            </template>
            开启后，可以通过 name$num 搜索复制粘贴 name对应的num号子代码片段
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡特殊标签" config="beta_special_tag"/>
            </template>
            开启后，为代码片段添加VSCode标签即可写入到VSCode代码片段中，IDEA、Sublime Text等同理
            <n-button size="small" @click="$reactive.setting.specialTagConfigActive = true">配置</n-button>
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <config-check-tag title="💡扩充搜索范围" config="beta_wide_snippet_search"/>
            </template>
            开启后，name在原有匹配片段名的基础上，还将匹配：
            <n-checkbox :focusable="false" :checked="betaSearchAspects.desc" @update:checked="handleChangeBetaSearchAspects('desc',$event)">描述说明</n-checkbox>
            <n-checkbox :focusable="false" :checked="betaSearchAspects.content" @update:checked="handleChangeBetaSearchAspects('content',$event)">代码内容（仅支持普通代码片段）</n-checkbox>
          </n-tooltip>
          <special-tag-config-modal v-if="$reactive.setting.specialTagConfigActive"/>
        </n-space>
      </n-space>
      <n-divider>
        个性化设置
      </n-divider>
      <n-space vertical align="center">
        <n-space>
          <config-check-tag title="关闭显示入门手册" config="readme_close" @refresh="refreshSearchResult()"/>
        </n-space>
        <n-space>
          搜索排序策略
          <n-select size="tiny"
                    :options="sortKeyOptions"
                    :default-value="configManager.getSortKey()"
                    @update:value="handleSortStrategy"/>
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
              💡清除自定义标签
            </n-divider>
          </template>
          清除无用的标签，后续只会影响到编辑界面中的标签选择
        </n-tooltip>
        <template v-if="refreshFlag">
          <n-space style="padding: 0 10px">
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
import {configManager} from "../js/core/config";
import {ref} from "vue";
import NormalTag from "../components/base/NormalTag.vue";
import ConfigCheckTag from "../components/base/ConfigCheckTag.vue";
import {NButton} from "naive-ui";
import {getRefreshFunc} from "../js/utils/common";
import FuncPane from "../components/pane/FuncEditPane.vue";
import {$reactive, refreshListView, refreshSearchResult} from "../js/store";
import CustomView from "../components/pane/CustomPane.vue";
import {generate_backup, load_backup} from "../js/core/backup";
import {backupFilePath} from "../js/some";
import SpecialTagConfigModal from "../components/modal/SpecialTagConfigModal.vue";

const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag);
const betaSearchAspects = ref({
  desc: !configManager.get('beta_wide_desc_close'),
  content: !configManager.get('beta_wide_content_close'),
})
function handleChangeBetaSearchAspects(type,value){
  betaSearchAspects.value[type] = value;
  configManager.set(`beta_wide_${type}_close`,!value)
}
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
function handleSortStrategy(v){
  configManager.set('strategy_sort',v);
  // refreshListView()
  refreshSearchResult();
}
function handleExport(){
  generate_backup(backupFilePath)
}
function handleImport(){
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
      load_backup(realPathList[0])
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
</style>