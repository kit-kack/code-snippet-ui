<template>
  <n-collapse  style="padding-top: 10px" :default-expanded-names="['0','1','2']">
    <n-collapse-item v-for="(data,index) in datas" :title="data.title" :name="index+''" :key="index">
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
    </n-collapse-item>

  </n-collapse>
</template>

<script setup>


const datas = [
  {
    title:"主界面",
    items: [{
        feature: "创建代码片段",
        shortcut:"C-N"
      },{
        feature: "刷新",
        shortcut: "C-R"
      },{
        feature: "启用/关闭Vim模式，utool输入框失聚焦",
        shortcut:"Tab"
      },{
        feature: "切换完整/列表UI模式",
        shortcut: "Tab快速双击"
      },{
        feature: "开启/关闭模糊符号查询",
        shortcut: "C-F"
      }]
  },
  {
    title: '元素',
    items:[{
        feature: "粘贴使用",
        shortcut: ["双击(手动开启功能)","搜索框Enter"]
      },{
        feature: "预览代码片段",
        shortcut: "C-点击"
      },{
        feature: "处理",
        shortcut: "右击"
      }]
  },
  {
    title: "元素-Vim模式",
    items: [{
        feature: "上下浏览",
        shortcut: ["J","K","↑","↓"],
        tooltip: '浏览多行元素代码块时请结合Shift键'
      },{
        feature: "左右浏览",
        shortcut: ["H","L","←","→"],
        tooltip: '浏览多行元素代码块时请结合Shift键'
      },{
        feature: "预览代码片段View",
        shortcut: ["V","Space(长按)"]
      },{
        feature: "编辑Edit",
        shortcut: "E"
      },{
        feature: "复制Copy",
        shortcut: ["C","Y"],
      },{
        feature: "粘贴Paste",
        shortcut: ["Enter","P"]
      },{
        feature: "删除Delete",
        shortcut: ["D","X"]
      },{
        feature: "(取消)置顶Top",
        shortcut: "T"
      },{
        feature: "退出Quit",
        shortcut: "Q",
        tooltip: "该功能也适用于退出元素功能菜单"
      },{
        feature: '重置（回到开始）Reset',
        shortcut: ["R","0"],
        tooltip: "该功能同样适用于代码浏览，浏览多行元素代码块时请结合Shift键"
    }
    ]
  }

]







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