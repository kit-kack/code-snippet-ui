<template>
  <template v-for="data in shortcuts">
    <n-divider dashed>
      {{data.title}}
    </n-divider>
    <n-list hoverable clickable :show-divider="false">
      <template v-for="item in data.items">
        <template v-if="item.tooltip">
          <n-popover width="trigger">
            <template #trigger>
              <n-list-item>
                <div>
                  <div style="float: left;">
                    💡{{item.feature}}
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
            </template>
            <p class="tooltip" v-html="item.tooltip"></p>
          </n-popover>
        </template>
        <template v-else>
          <n-list-item>
            <div>
              <div style="float: left;">
                {{item.feature}}
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
        </template>
      </template>

    </n-list>
  </template>
</template>

<script setup>
import {CtrlStr} from "../../js/some";

const shortcuts = [{
  title: "通用",
  items: [{
    feature: "创建代码片段",
    shortcut: CtrlStr+" + N"
  },{
    feature: "刷新",
    shortcut: CtrlStr+" + R"
  },{
    feature: "上下左右浏览",
    shortcut: ["H","J","K","L","←","↑","↓","→"],
    tooltip: `主界面：结合<b>Shift</b>键浏览 多行元素代码块;<br/>代码预览界面：结合<b>Shift</b>键来加快滚动速度`
  },{
    feature: "编辑Edit",
    shortcut: ["E","I"]
  },{
    feature: "复制Copy",
    shortcut: ["C","Y"]
  },{
    feature: "粘贴Paste",
    shortcut: ["Enter","P","双击"]
  },{
    feature: "复制高亮行-子代码片段",
    shortcut: ["0","1 ~ 9"],
    tooltip: "数字<b>0</b>键用来进行复制所有子代码片段；<br/>粘贴请结合<b>Shift</b>/<b>Alt</b>/<b>"+CtrlStr+"</b>任意一键"
  },{
    feature: "系统应用打开Open（仅适用于关联文件）",
    shortcut: "O",
    tooltip: "若为本地关联文件，结合<b>Shift</b>键会文件管理器打开"
  },{
    feature: "退出Quit",
    shortcut: "Q"
  },{
    feature: '回到开始',
    shortcut: ["G"],
    tooltip: "主界面：结合<b>Shift</b>键来控制 多行元素代码块"
  },{
    feature: '查看『快捷方式』',
    shortcut: ['Z']
  }]
},{
  title: "主界面",
  items: [{
    feature: "启用/关闭Vim模式，uTools子输入框失聚焦",
    shortcut:"Tab"
  },{
    feature: "切换完整/列表UI模式",
    shortcut: "Tab快速双击",
    tooltip: "暂时不支持<b>多行元素代码块</b>场景"
  },{
    feature: "预览View",
    shortcut: ["V","Space长按",CtrlStr+" + 点击"]
  },{
    feature: "删除Delete",
    shortcut: ["D","X"]
  },{
    feature: "(取消)置顶Top",
    shortcut: "T"
  },{
    feature: '清空重新搜索Search',
    shortcut: "S"
  },{
    feature: '回到根目录Root',
    shortcut: "R"
  },{
    feature: '查看『设置』',
    shortcut: '/'
  }]
},{
  title: "代码预览界面",
  items: [{
    feature: "纯净模式Pure",
    shortcut: CtrlStr+" + P"
  },{
    feature: "切换渲染Render",
    shortcut: "R"
  },{
    feature: "查看说明Show",
    shortcut: 'S'
  }]
},{
  title: "代码预览界面 —— Markdown渲染",
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
    feature: "跳转前后小节",
    shortcut: [CtrlStr+ " + J", CtrlStr+" + K"]
  }]
},{
  title: "编辑界面",
  items: [{
    feature: "退出/保存",
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
    feature: "快速启用 占位符处理",
    shortcut: ['Alt + X',"Alt + C"]
  },{
    feature: "快速启用 uTools关键字",
    shortcut: 'Alt + K'
  },{
    feature: "全屏编辑代码",
    shortcut: ['F11','Alt + F']
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