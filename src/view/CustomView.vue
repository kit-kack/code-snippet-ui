<template>
  <n-scrollbar style="max-height: 99vh">
    <div id="custom">
      <n-divider title-placement="center" style="width: 100vw">
        个性化定制
      </n-divider>
      <n-space align="center">&nbsp;启用内置标签：
        <config-check-tag @refresh="refresh()"   v-for="it in inlaidTags" :icon="it.icon" :title="it.title" :config="it.config" />
      </n-space>
      <div style="height: 5px"></div>
      <n-space>&nbsp;元素代码块：
        <config-check-tag @refresh="refresh()"   v-for="it in otherSettings" :title="it.title"  :config="it.config" />
      </n-space>
      <div style="height: 5px"></div>
      <n-space align="center">
        <n-tooltip>
          <template #trigger>
            <span>&nbsp;💡配色方案：</span>
          </template>
          亮色和暗色场景独立保存，互不影响
        </n-tooltip>
        <n-popselect
            v-model:value="colorSchemaRef"
            :options="colorSchemaOptions"
            :render-label="renderLabel"
            scrollable
            @update-value="handleColorSchema"
            size="small">
          <n-button size="small">{{ colorSchemaOptions[colorSchemaRef<0?(6-colorSchemaRef):colorSchemaRef].label }}</n-button>
        </n-popselect>
        <template v-if="colorSchemaRef === -1">
          <color-picker v-for="instance in getColorInstances()" :instance="instance" :key="instance.title"/>
        </template>
      </n-space>
      <template v-if="colorSchemaRef === -2">
        <n-space align="center">
          <n-input
              v-model:value="cssCode"
              placeholder="请输入关于CSS的JSON数据"
              type="textarea"
              size="small"
              style="width: 66vw;margin: 5px"
              :default-value="getCSSCode()"
              :autosize="{minRows:8,maxRows: 8}"/>
          <n-button @click="handleCSSCode">确定</n-button>
        </n-space>
      </template>
      <br/>
      <debug-list-item v-if="refreshRef" mode="normal"/>
      <debug-list-item v-if="refreshRef" mode="selected"/>
      <debug-list-item v-if="refreshRef" mode="vim"/>
      <div id="extra">
        <n-button strong secondary type="info" circle :color="configManager.getGlobalColor()"  @click="$var.currentMode = LIST_VIEW">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z" fill="currentColor"></path></svg>
          </template>
        </n-button>
      </div>

    </div>
  </n-scrollbar>
</template>

<script setup>
import {h, nextTick, ref} from "vue";
import DebugListItem from "../components/item/DebugListItem.vue";
import ColorPicker from "../components/ColorPicker.vue";
import {configManager} from "../js/core";
import ConfigCheckTag from "../components/ConfigCheckTag.vue";
import {adjustTheme, colorSchemaStyleOptions, darkColorSchemaStyleOptions, globalThemeRefresh} from "../js/theme";
import {useMessage} from "naive-ui";
import {$var, LIST_VIEW} from "../js/store";

const refreshRef = ref(true)
const cssCode = ref()
const getCSSCode = ()=>{
  return `{
    //   全局颜色，对应CSS 的 background-color属性
    "global-color": "${configManager.getGlobalColor()}",
    //   被选中 元素颜色，对应 background属性（可渐变）
    "selected-color": "${configManager.getColor('SelectedColor')}",
    //   标签颜色，对应background-color属性，需要提供alpha透明度参数
    "tag-color": "${configManager.getColor('TagColor')}"
}`
}
const refresh = ()=>{
  refreshRef.value = false;
  nextTick(()=>{
    refreshRef.value = true;
  })
}
const message = useMessage();
const colorSchemaRef = ref(configManager.get('colorSchema')??0)
const snippet = {
  name: "test",
  desc: "测试数据",
  code: "console.log('当前代码代码片段仅用于测试，共有七行')\nconsole.log('这是第二行数据')\nconsole.log('这是第三行数据')\nconsole.log('这是第四行数据')\nconsole.log('这是第五行数据')\nconsole.log('这是第六行数据')\nconsole.log('这是第七行数据')",
  type: 'javascript',
  tags: ['test'],
  count: 100,
  time: 0
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
    title: "内置标签位置改变",
    config: "shiftTagPosition"
  },
  {
    title: "使用符号图标",
    config: "showTagIcon"
  }
];
const otherSettings = [
  {
    title: "启用多行显示",
    config: "fullItemCodeShow"
  },
  {
    title: "不高亮解析",
    config: "rawLineCode"
  }
]
const getColorInstances = ()=>{
  return [{
    title: "全局主题 颜色",
    color: configManager.getGlobalColor(),
    handleConfirm: v=>{
      configManager.setGlobalColor(v)
      globalThemeRefresh();
    }
  },{
    title: "被选中元素 背景颜色",
    color: configManager.getColor('SelectedColor'),
    handleConfirm: v=>{
      configManager.setColor('SelectedColor',v)
      refresh()
    }
  },{
    title: "自定义标签 默认颜色",
    color: configManager.getColor('TagColor'),
    handleConfirm: v=>{
      configManager.setColor('TagColor',v)
      refresh()
    }
  }]
}

const colorSchemaOptions = [
  {
    label: '绿色',
    value: 0
  },
  {
    label: '青色',
    value: 1
  },
  {
    label: '蓝色',
    value: 2
  },
  {
    label: '紫色',
    value: 3
  },  {
    label: '粉色',
    value: 4
  },
  {
    label: '金色',
    value: 5
  },{
    label: '红色',
    value: 6
  },
  {
    label: '自定义(取色方式)',
    value: -1
  },
  {
    label: '自定义(CSS方式)',
    value: -2
  }
]
const renderLabel = (option) => {
    return h(
          'div',
          {
            style: {
              width: '100%',
              color: utools.isDarkColors()?
                  (darkColorSchemaStyleOptions[option.value]?.globalColor??'white')
                  :(colorSchemaStyleOptions[option.value]?.globalColor??'black')
            }
          },
          [option.label]
      );
}
const handleColorSchema = (v)=>{
  configManager.set('colorSchema',v);
  if(v < 0){
    return;
  }
  adjustTheme(v)
  globalThemeRefresh()
  refresh()
}
const handleCSSCode = ()=>{
/**
* @type {String}
*/
  let code = cssCode.value
  // 移除注释部分
  let json = code.split('\n').filter(v => !v.trim().startsWith("//")).join('\n');
  try{
    // 通过JSON解析为Object
    let obj = JSON.parse(json)
    if(obj['global-color']){
      configManager.setGlobalColor(obj['global-color'])
    }
    if(obj['tag-color']){
      configManager.setColor('TagColor',obj['tag-color'])
    }
    if(obj['selected-color']){
      configManager.setColor('SelectedColor',obj['selected-color'])
    }
    globalThemeRefresh()
    refresh()
  }catch (e){
    message.error("格式错误："+e.message)
  }
}

</script>

<style scoped>
.n-select{
  font-size: 12px;
}
#custom{
  overflow: auto;
}
#dark-app #custom{
  color: whitesmoke;
}
.n-divider{
  margin-top: 0;
  height: 10px;
}
 .n-divider:not(.n-divider--vertical) {
   margin-top: 5px;
 }
 #extra{
   position: fixed;
   right:20px;
   bottom: 12px;
 }
</style>