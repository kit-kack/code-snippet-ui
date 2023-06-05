<template>
  <n-tabs  animated  :default-value="0" justify-content="space-evenly"
          pane-style="padding-top:5px" type="segment"
  >
    <n-tab-pane :name="0" tab="设置">
        <n-tabs type="segment"
                pane-style="height:calc(100vh - 95px)"
                placement="bottom" animated  :default-value="0" justify-content="space-evenly" >
          <n-tab-pane :name="0" tab="基本设置">
            <n-divider title-placement="center">
              数据导出导入
            </n-divider>
            <n-space vertical align="center">
              <div>
                当前共有{{codeSnippetManager.codeMap.size}}条数据，点击<n-button quaternary type="info" size="small" @click="handleExport">导出</n-button>
              </div>
              <div>
                当然你也可以<n-button quaternary type="info" size="small" @click="handleImport">导入</n-button>数据，注意要符合格式哦!
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
              <n-tooltip trigger="hover">
                <template #trigger>
                  <config-switch title="启用模糊符号查询" config="enabledFuzzySymbolQuery"/>
                </template>
                启用后，忽略符号来进行匹配，例如使用ab能查询到a@b记录（忽略中间的@符号）,支持C-f来切换
              </n-tooltip>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <config-switch title="搜索词为空时，是否不显示数据" config="noShowForEmptySearch"/>
                </template>
                本功能只在 列表UI模式下 生效
              </n-tooltip>
            </n-space>
            <n-divider title-placement="center">
              其他设置
            </n-divider>
            <n-space vertical align="center">
              <config-switch title="双击元素启用粘贴代码片段功能" config="doubleClickPaste"/>
              <config-switch title="粘贴后插件是否退出" config="exitAfterPaste"/>
              <config-switch @refresh="emit('refresh')"  title="无法上下浏览时是否播放哔哔声" config="enabledBeep"/>
            </n-space>
          </n-tab-pane>
          <n-tab-pane :name="1" tab="个性化设置">
            <n-divider title-placement="center">
              内置标签 控制显示
            </n-divider>
            <n-space vertical align="center">
              <config-switch @refresh="emit('refresh')"   v-for="it in inlaidTags" :title="it.title" :icon="it.icon" :config="it.config"/>
            </n-space>
            <n-divider title-placement="center">
              其他设置
            </n-divider>
            <n-space vertical align="center">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <color-picker :instance="defaultGlobalColorInstance"/>
                </template>
                亮色和暗色场景下独立保存，互不影响
              </n-tooltip>
              <color-picker :instance="defaultColorInstance"/>
              <config-switch title="默认是否启用列表UI模式" config="enabledLiteShow"/>
              <config-switch title="行内代码块是否不进行高亮解析" config="rawLineCode" @refresh="emit('refresh')"/>
            </n-space>
          </n-tab-pane>
          <n-tab-pane :name="2" tab="清理">
            <n-scrollbar style="max-height: 80vh">
              <n-divider title-placement="center">
                清除自定义标签关联颜色
              </n-divider>
              <template v-if="refreshStatus">
                <n-space>
                  <tag raw v-for="tag in tagColorManager.all()" :content="tag" @tag-refresh="dealWithRefresh"/>
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
    <n-tab-pane :name="2" tab="说明">
      <h4 align="center">Hello Coder</h4>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;本插件仅支持旧版本（无UI版本）的查询命令，其他命令现以可视化方式实现</p>
      <n-alert title="XXX #tag @type" type="default">
        <template #icon>💻</template>
        查询代码片段，<br/>XXX对应代码片段名（模糊匹配），<br/>tag对应标签部分(可指定多个)，<br/>type对应代码片段类型；<br/>三者没有固定顺序且都可选，请以空格间隔
      </n-alert>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;为了方便键盘流操作，本插件提供了基本的Vim模式来操作，请按Tab键来切换；<br/>&nbsp;&nbsp;&nbsp;&nbsp;相关Vim模式命令查看 中间选项卡【快捷方式】<br/>&nbsp;&nbsp;&nbsp;&nbsp;同时，按下Tab键会使Utools子输入框失焦或聚焦；<br/>在子输入框聚焦时，不启用Vim模式</p>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;最后非常感谢大家的使用，由于本人是个前端小白，所以插件有什么问题欢迎大家反馈</p>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import {NDivider} from 'naive-ui'
import ConfigSwitch from "../components/ConfigSwitch.vue";
import {codeSnippetManager, configManager, tagColorManager} from "../js/core.js";
import ColorPicker from "../components/ColorPicker.vue";
import Tag from "../components/Tag.vue";
import {nextTick, ref} from "vue";
import ShortcutPane from "../components/ShortcutPane.vue";

const emit = defineEmits(['refresh'])
const refreshStatus = ref(true)
const dealWithRefresh = ()=>{
  refreshStatus.value = false;
  emit('refresh')
  nextTick(()=>{
    refreshStatus.value = true;
  })
}
const sortKeyOptions = [
  {
    label: "创建时间",
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

const defaultColorInstance = {
  title: "自定义标签 默认颜色",
  color: configManager.getDefaultColor(),
  handleConfirm: v=>{
    configManager.set("defaultColor",v)
    emit('refresh')
  }
}
const defaultGlobalColorInstance  = {
  title: "全局主题 颜色",
  color: configManager.getGlobalColor(),
  handleConfirm: v=>{
    configManager.setGlobalColor(v)
    emit('refresh')
  }
}

const  inlaidTags= [
  {
    title:"最近使用时间",
    icon:"⏰",
    config:"showTimeTag"
  },
  {
    title:"累计使用次数",
    icon:"🎲",
    config:"showCountTag"
  },
  {
    title:"代码片段类型",
    icon:"🚀",
    config:"showLanguageTag"
  },
  {
    title: "标签位置切换",
    config: "shiftTagPosition"
  },
  {
    title: "换个图标看看",
    config: "showTagIcon"
  }
];
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
</style>