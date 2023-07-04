<template>
  <n-tabs  animated  :default-value="0" justify-content="space-evenly"
          pane-style="padding-top:5px" type="segment"
  >
    <n-tab-pane :name="0" tab="基本">
        <n-tabs type="segment"
                pane-style="height:calc(100vh - 95px)"
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
                  <config-switch title="💡默认是否启用列表UI模式" config="enabledLiteShow"/>
                </template>
                这里是指初进入插件时的显示策略
              </n-tooltip>
              <config-switch title="粘贴后插件是否退出" config="exitAfterPaste"/>
              <config-switch title="双击元素启用粘贴代码片段功能" config="doubleClickPaste"/>
              <config-switch title="点击元素是否自动进入Vim模式" config="enabledAutoVim"/>
              <config-switch @refresh="emit('refresh')"  title="无法上下浏览时是否播放哔哔声" config="enabledBeep"/>
              <n-tooltip placement="left">
                <template #trigger>
                  <n-button id="diy" circle @click="$var.currentMode = CUSTOM_VIEW;$var.view.settingActive = false">
                    <template #icon>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 96l16-32l32-16l-32-16l-16-32l-16 32l-32 16l32 16l16 32zM80 160l26.66-53.33L160 80l-53.34-26.67L80 0L53.34 53.33L0 80l53.34 26.67L80 160zm352 128l-26.66 53.33L352 368l53.34 26.67L432 448l26.66-53.33L512 368l-53.34-26.67L432 288zm70.62-193.77L417.77 9.38C411.53 3.12 403.34 0 395.15 0c-8.19 0-16.38 3.12-22.63 9.38L9.38 372.52c-12.5 12.5-12.5 32.76 0 45.25l84.85 84.85c6.25 6.25 14.44 9.37 22.62 9.37c8.19 0 16.38-3.12 22.63-9.37l363.14-363.15c12.5-12.48 12.5-32.75 0-45.24zM359.45 203.46l-50.91-50.91l86.6-86.6l50.91 50.91l-86.6 86.6z" fill="currentColor"></path></svg>
                    </template>
                  </n-button>
                </template>
                个性化定制
              </n-tooltip>

            </n-space>
          </n-tab-pane>
          <n-tab-pane :name="1" tab="清理">
            <n-scrollbar style="max-height: 80vh">
              <n-tooltip>
                <template #trigger>
                  <n-divider title-placement="center">
                    💡清除自定义标签（若有关联颜色先清除颜色）
                  </n-divider>
                </template>
                自定义标签被清除后，只会影响到创建/更新 代码片段的表单界面中的标签选择
              </n-tooltip>
              <template v-if="refreshStatus">
                <n-space>
                  <normal-tag raw v-for="tag in tagColorManager.all()" :content="tag" @tag-refresh="dealWithRefresh"/>
                </n-space>
              </template>
            </n-scrollbar>
          </n-tab-pane>
        </n-tabs>
    </n-tab-pane>
    <n-tab-pane :name="1" tab="快捷方式">
      <n-scrollbar style="max-height: calc(100vh - 44px)">
        <shortcut-pane/>
      </n-scrollbar>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import ConfigSwitch from "../components/ConfigSwitch.vue";
import {codeSnippetManager, configManager, tagColorManager} from "../js/core.js";
import {computed, nextTick, ref} from "vue";
import ShortcutPane from "../components/ShortcutPane.vue";
import NormalTag from "../components/NormalTag.vue";
import {$var, CUSTOM_VIEW} from "../js/store";
import ConfigCheckTag from "../components/ConfigCheckTag.vue";

const emit = defineEmits(['refresh'])
const refreshStatus = ref(true)
const tags = computed(()=>tagColorManager.all())
const dealWithRefresh = ()=>{
  refreshStatus.value = false;
  emit('refresh')
  nextTick(()=>{
    refreshStatus.value = true;
  })
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
  emit('refresh')
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
      emit('refresh')
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