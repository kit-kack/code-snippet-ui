<template>
  <div id="shortcut-pane">
    <template v-for="data in shortcuts">
      <template v-if="data.tab">
        <n-divider dashed>
          {{data.title}}
        </n-divider>
        <n-tabs type="bar" @click="handleClick" animated size="small" justify-content="space-around" :value="data.items[$reactive.common.shortcutTabIndexForCodeView].title">
          <n-tab-pane v-for="(d,i) in data.items" :key="d.title" :name="d.title">
            <n-list hoverable :show-divider="false">
              <template v-for="(item,index) in d.items">
                <template v-if="item.tooltip">
                  <n-popover width="trigger" @update:show="v => popoverShow[index] = v">
                    <template #trigger>
                      <n-list-item>
                        <div>
                          <div style="float: left;">
                            {{item.feature}}
                            <n-icon :class="{
                      'global-color': popoverShow[index]
                    }">
                              <SvgTip/>
                            </n-icon>
                          </div>
                          <div style="float: right;">
                            <template v-if="Array.isArray(item.shortcut)">
                              <span class="shortcut" v-for="s in item.shortcut" v-html="s"></span>
                            </template>
                            <template v-else>
                              <span class="shortcut" v-html="item.shortcut"></span>
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
                          <span class="shortcut" v-for="s in item.shortcut" v-html="s"></span>
                        </template>
                        <template v-else>
                          <span class="shortcut" v-html="item.shortcut"></span>
                        </template>
                      </div>
                    </div>
                  </n-list-item>
                </template>
              </template>
            </n-list>
          </n-tab-pane>
        </n-tabs>
      </template>
      <template v-else>
        <n-divider dashed>
          {{data.title}}
        </n-divider>
        <n-list hoverable :show-divider="false">
          <template v-for="(item,index) in data.items">
            <template v-if="item.tooltip">
              <n-popover width="trigger" @update:show="v => popoverShow[index] = v">
                <template #trigger>
                  <n-list-item>
                    <div>
                      <div style="float: left;">
                        {{item.feature}}
                        <n-icon :class="{
                      'global-color': popoverShow[index]
                    }">
                          <SvgTip/>
                        </n-icon>
                      </div>
                      <div style="float: right;">
                        <template v-if="Array.isArray(item.shortcut)">
                          <span class="shortcut" v-for="s in item.shortcut" v-html="s"></span>
                        </template>
                        <template v-else>
                          <span class="shortcut" v-html="item.shortcut"></span>
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
                      <span class="shortcut" v-for="s in item.shortcut" v-html="s"></span>
                    </template>
                    <template v-else>
                      <span class="shortcut" v-html="item.shortcut"></span>
                    </template>
                  </div>
                </div>
              </n-list-item>
            </template>
          </template>
        </n-list>
      </template>
    </template>
  </div>
</template>

<script setup>
import {AltStr, CtrlStr} from "../../js/some";
import SvgTip from "../../asserts/tip.svg"
import {reactive} from "vue";
import {$reactive} from "../../js/store";
const popoverShow = reactive({})
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
    shortcut: ["Enter","P","双击"],
    tooltip: "Xshell等场景需要模拟键盘输入才可正常粘贴代码片段，<br/>请结合<b>Shift</b>键使用"
  },{
    feature: "复制高亮行-子代码片段",
    shortcut: ["0","1 ~ 9"],
    tooltip: "数字<b>0</b>键用来进行复制所有子代码片段；<br/>粘贴：<b>"+AltStr+"</b>/<b>"+CtrlStr+"</b>任意一键； <br/>模拟键盘输入：<b>Shift</b>键"
  },{
    feature: "系统应用打开Open（仅适用于关联文件）",
    shortcut: "O",
    tooltip: "若为本地关联文件，结合<b>Shift</b>键会文件管理器打开"
  },{
    feature: "退出Quit",
    shortcut: "Q"
  },{
    feature: '移动到顶部',
    shortcut: ["GG"],
    tooltip: "主界面：结合<b>Shift + G</b>键来控制 多行元素代码块"
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
  }, {
    feature: '回到根目录Root',
    shortcut: "R"
  },{
    feature: '侧边预览',
    shortcut: "."
  },{
    feature: '查看『设置』',
    shortcut: '/'
  },{
    feature: '切换至『回收站』',
    shortcut: 'F9'
  }]
},{
  tab: true,
  title: "代码预览界面",
  items:[{
      title: "基本",
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
      title: "Markdown渲染",
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
      title: "Image渲染",
      items: [{
        feature: "缩放",
        shortcut: ["Shift + J", "Shift + K"]
      },{
        feature: "旋转",
        shortcut: ["Shift + H", "Shift + L"]
      },{
        feature: "恢复",
        shortcut: "G"
      }]
  }]
},{
  title: "编辑界面",
  items: [{
    feature: "查看『快捷方式』",
    shortcut: AltStr+' + Z'
  },{
    feature: "快速启用 占位符处理",
    shortcut: [AltStr+' + X',AltStr+" + C"]
  },{
    feature: "快速启用 uTools关键字",
    shortcut: AltStr+' + K'
  },{
    feature: "全屏编辑代码",
    shortcut: ['F11',AltStr+' + F']
  }]
}]

/**
 *
 * @param {MouseEvent} e
 */
function handleClick(e){
  const target = e.target;
  if(!target || target.className!=='n-tabs-tab__label'){
    return;
  }
  const text = target.innerText;
  if(!text){
    return;
  }
  const codeViewShortcut = shortcuts.find(item => {
    return item.title === '代码预览界面' && item.tab;
  })
  if(codeViewShortcut){
    $reactive.common.shortcutTabIndexForCodeView = codeViewShortcut.items.findIndex(item => item.title === text);
  }
}





</script>

<style lang="scss" scoped>
.n-list-item{
  height: 40px;
  padding: 0 5px
}
#light-app-v5 #shortcut-pane .n-list{
  --n-merged-color: #f4f4f4 !important;
  &.n-list--hoverable .n-list-item{
    --n-merged-color-hover: #e0e0e0 !important;
  }
}
</style>