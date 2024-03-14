<template>
  <div id="side-view">
    <n-tabs type="segment"
            pane-style="height:calc(100vh - 51px)"
            placement="bottom" animated  :default-value="0" justify-content="space-evenly" >
      <n-tab-pane :name="0" tab="设置">
        <n-tooltip>
          <template #trigger>
            <n-divider>
              💡备份
            </n-divider>
          </template>
          uTools会员：插件数据自动同步，无需手动备份同步
        </n-tooltip>

        <n-space vertical align="center">
          <n-space>
            <n-button strong secondary round type="primary"  @click="handleImport">
              备份导入
              <template #icon>
                <svg-backup-import/>
              </template>
            </n-button>
            <n-button  strong secondary round type="info"  @click="handleExport" >
              生成备份
              <template #icon>
                <svg-backup-export/>
              </template>
            </n-button>
          </n-space>
        </n-space>
        <n-divider>
          Beta功能
        </n-divider>
        <n-space vertical align="center">
          <n-popover :show-arrow="false" width="93%">
            <template #trigger>
              <n-space>
                <config-check-tag title="💡搜索子代码片段" config="beta_sub_snippet_search" @mouseover="configIndex = 0"/>
                <config-check-tag title="💡特殊标签" config="beta_special_tag" @mouseover="configIndex = 1"/>
                <config-check-tag title="💡扩充搜索范围" config="beta_wide_snippet_search" @mouseover="configIndex = 2"/>
                <special-tag-config-modal v-if="$reactive.setting.specialTagConfigActive"/>
              </n-space>
            </template>
            <template v-if="configIndex === 0">
              开启后，可以通过 name$num 搜索复制粘贴 name对应的num号子代码片段
            </template>
            <template v-else-if="configIndex === 1">
              开启后，为代码片段添加VSCode标签即可写入到VSCode代码片段中，IDEA、Sublime Text等同理
              <n-button size="small" @click="$reactive.setting.specialTagConfigActive = true">配置</n-button>
            </template>
            <template v-else>
              开启后，name在原有匹配片段名的基础上，还将匹配：
              <n-checkbox :focusable="false" :checked="betaSearchAspects.desc" @update:checked="handleChangeBetaSearchAspects('desc',$event)">描述说明</n-checkbox>
              <n-checkbox :focusable="false" :checked="betaSearchAspects.content" @update:checked="handleChangeBetaSearchAspects('content',$event)">代码内容（仅支持普通代码片段）</n-checkbox>
            </template>
          </n-popover>
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
  </div>
</template>

<script setup>
import {tagColorManager} from "../js/utools/tag";
import {configManager} from "../js/utools/config";
import {ref} from "vue";
import NormalTag from "../components/base/NormalTag.vue";
import ConfigCheckTag from "../components/base/ConfigCheckTag.vue";
import {NButton} from "naive-ui";
import {getRefreshFunc} from "../js/utils/common";
import FuncPane from "../components/pane/FuncEditPane.vue";
import {$reactive, refreshListView, refreshSearchResult} from "../js/store";
import CustomView from "../components/pane/CustomPane.vue";
import {generate_backup, load_backup} from "../js/utools/backup";
import {backupFilePath} from "../js/some";
import SpecialTagConfigModal from "../components/modal/SpecialTagConfigModal.vue";
import SvgBackupImport from "../asserts/backup-import.svg";
import SvgBackupExport from "../asserts/backup-export.svg";

const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag);
const configIndex = ref(0);
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