<template>
  <template v-for="data in shortcuts">
    <n-divider dashed>
      {{data.title}}
    </n-divider>
    <n-list hoverable clickable :show-divider="false">
      <n-list-item v-for="item in data.items" >
        <div>
          <div style="float: left;">
            <template v-if="item.tooltip">
              <n-tooltip>
                <template #trigger>
                  💡{{item.feature}}
                </template>
                {{item.tooltip}}
              </n-tooltip>
            </template>
            <template v-else>
              {{item.feature}}
            </template>
          </div>

          <div style="float: right;">
            <template v-if="Array.isArray(item.shortcut)">
              <span class="shortcut" v-for="s in item.shortcut">{{s}}</span>
            </template>
            <template v-else>
              <span class="shortcut">{{item.shortcut}}</span>
            </template>
          </div>
        </div>
      </n-list-item>
    </n-list>
  </template>
</template>

<script setup>
import {CtrlStr} from "../../js/some";
import {computed} from "vue";
import {$reactive, CODE_VIEW, LIST_VIEW} from "../../js/store";

const shortcuts = computed(()=>{
  switch ($reactive.currentMode){
    case LIST_VIEW:
      return LIST_VIEW_SHORTCUTS
    case CODE_VIEW:
      return CODE_VIEW_SHORTCUTS
    default:
      return EDIT_CREATE_VIEW_SHORTCUTS
  }
})
const LIST_VIEW_SHORTCUTS = [{
  title: "主界面",
  items: [{
    feature: "创建代码片段",
    shortcut: CtrlStr+" + N"
  },{
    feature: "刷新",
    shortcut: CtrlStr+" + R"
  },{
    feature: "启用/关闭Vim模式，uTools子输入框失聚焦",
    shortcut:"Tab"
  },{
    feature: "切换完整/列表UI模式",
    shortcut: "Tab快速双击",
    tooltip: "暂时不支持[多行元素代码块]场景"
  },{
    feature: "上下浏览",
    shortcut: ["J","K","↑","↓"],
    tooltip: '浏览多行元素代码块时请结合Shift键'
  },{
    feature: "左右浏览（菜单/代码)",
    shortcut: ["H","L","←","→"],
    tooltip: '浏览多行元素代码块时请结合Shift键'
  },{
    feature: "预览View",
    shortcut: ["V","Space(长按)",CtrlStr+" + 点击"]
  },{
    feature: "编辑Edit",
    shortcut: "E"
  },{
    feature: "删除Delete",
    shortcut: ["D","X"]
  },{
    feature: "(取消)置顶Top",
    shortcut: "T"
  },{
    feature: "复制Copy",
    shortcut: ["C","Y"]
  },{
    feature: "粘贴Paste",
    shortcut: ["Enter","P","双击"]
  },{
    feature: "复制高亮行-子代码片段",
    shortcut: ["0","1 ~ 9"],
    tooltip: "数字0用来进行复制所有子代码片段；粘贴请结合Shift/Alt/Ctrl(Command)键"
  },{
    feature: "系统应用打开Open（仅适用于关联文件）",
    shortcut: "O",
    tooltip: "若为本地关联文件，结合Shift键会文件管理器打开"
  },{
    feature: "退出Quit",
    shortcut: "Q"
  },{
    feature: '回到开始',
    shortcut: ["G"],
    tooltip: "浏览多行元素代码块时请结合Shift键"
  },{
    feature: '清空重新搜索Search',
    shortcut: "S"
  },{
    feature: '回到根目录Root',
    shortcut: "R"
  },{
    feature: '查看『快捷方式』',
    shortcut: ['Z']
  },{
    feature: '查看『设置』',
    shortcut: '/'
  }]
}];
const CODE_VIEW_SHORTCUTS = [{
  title: '代码预览界面',
  items: [{
    feature: "创建代码片段",
    shortcut: CtrlStr+" + N"
  },{
    feature: "纯净模式Pure",
    shortcut: CtrlStr+" + P"
  },{
    feature: "上下左右浏览",
    shortcut: ["H","J","K","L","←","↑","↓","→"],
    tooltip: "结合Shift键使用，滚动更快哦"
  },{
    feature: "编辑Edit",
    shortcut: "E"
  },{
    feature: "复制Copy",
    shortcut: ["C","Y"]
  },{
    feature: "粘贴Paste",
    shortcut: ["Enter","P"]
  },{
    feature: "复制高亮行-子代码片段",
    shortcut: ["0","1 ~ 9"],
    tooltip: "数字0用来进行复制所有子代码片段；粘贴请结合Shift/Alt/"+CtrlStr+"键"
  },{
    feature: "系统应用打开Open（仅适用于关联文件）",
    shortcut: "O",
    tooltip: "若为本地关联文件，结合Shift键会文件管理器打开"
  },{
    feature: "退出Quit",
    shortcut: "Q"
  },{
    feature: '回到开始',
    shortcut: ["G"]
  },{
    feature: "切换渲染Render",
    shortcut: "R"
  },{
    feature: "查看说明Show",
    shortcut: 'S'
  },{
    feature: '查看『快捷方式』',
    shortcut: ['Z']
  }
  ]
},{
  title: 'Markdown渲染场景',
  items: [{
    feature: "目录TOC",
    shortcut: "T"
  },{
    feature: '选中其他代码块',
    shortcut: "Tab"
  },{
    feature: "复制代码块内容",
    shortcut: "Space"
  },{
    feature: "跳转前后相邻小节",
    shortcut: [CtrlStr+ " + J", CtrlStr+" + K"]
  },{
    feature: "跳转前后同级小节",
    shortcut: ["Alt + J", "Alt + K"]
  }]


}
]
const EDIT_CREATE_VIEW_SHORTCUTS = [{
    title: '编辑界面',
    items: [{
      feature: "退出Quit",
      shortcut: [CtrlStr+" + Q",CtrlStr+" + S"],
    },{
      feature: "本地文件",
      shortcut: 'Alt + Q'
    },{
      feature: "网络文件",
      shortcut: 'Alt + W'
    },{
      feature: "本地目录",
      shortcut: 'Alt + A'
    },{
      feature: "普通目录",
      shortcut: 'Alt + S'
    },{
      feature: "自定义目录",
      shortcut: 'Alt + D'
    },{
      feature: "查看『快捷方式』",
      shortcut: 'Alt + Z'
    },{
      feature: "快速启用 子代码片段",
      shortcut: ['Alt + X',"Alt + C"]
    }]
  }]







</script>

<style scoped>
.n-list-item{
  height: 40px;
  padding: 0 5px
}
.shortcut{
  font-size: 12px;
  padding: 3px 5px 3px 5px;
  margin-left: 5px;
  border-radius: 5px;
  /* 磨砂感背景 */
  backdrop-filter: saturate(180%) blur(5px)!important;
  -webkit-backdrop-filter: saturate(180%) blur(5px)!important;
  /* 磨砂的背景颜色 */
  background: rgba(191, 208, 229, 0.2) !important;
}
</style>