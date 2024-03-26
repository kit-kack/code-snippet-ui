<template>
  <div id="side-view">

    <h2 style="text-align: center">插件设置</h2>
    <div class="aspect">
      <h4 id="backup">备份</h4>
      <p class="tooltip">uTools会员能够自动同步插件数据，无需手动备份同步</p>
      <n-space>
        <n-button strong secondary  type="primary"  @click="handleImport">
          备份导入
          <template #icon>
            <svg-backup-import/>
          </template>
        </n-button>
        <n-button  strong secondary  type="info"  @click="handleExport" >
          生成备份
          <template #icon>
            <svg-backup-export/>
          </template>
        </n-button>
      </n-space>
    </div>



    <div class="aspect">
      <h4 id="search">搜索</h4>
      <search-pane/>
    </div>

    <div class="aspect">
      <h4 id="custom">个性化</h4>
      <custom-view/>
    </div>

    <div class="aspect">
      <h4 id="beta">Beta功能</h4>
      <p class="tooltip">下列拓展功能，目前处于测试中，不保证最终可用性</p>
      <special-tag-config-modal v-if="$reactive.setting.specialTagConfigActive"/>
      <n-popover :show-arrow="false">
        <template #trigger>
<!--          <n-space>-->
            <!--              <config-check-tag title="💡搜索子代码片段" config="beta_sub_snippet_search" @mouseover="configIndex = 0"/>-->
            <config-check-tag title="💡特殊标签" config="beta_special_tag" @mouseover="configIndex = 1"/>
            <!--              <config-check-tag title="💡扩充搜索范围" config="beta_wide_snippet_search" @mouseover="configIndex = 2"/>-->

<!--          </n-space>-->
        </template>
        <!--          <template v-if="configIndex === 0">-->
        <!--            开启后，可以通过 <span class="global-color">name$num</span> 搜索复制粘贴 <span class="global-color">name</span>对应的<span class="global-color">num</span>号子代码片段-->
        <!--          </template>-->
        <!--          <template v-else-if="configIndex === 1">-->
        开启后，为代码片段添加<span class="kitx-italic">VSCode</span> 标签即可写入<span class="kitx-italic">VSCode</span> 代码片段中，<span class="kitx-italic">IDEA</span>、<span class="kitx-italic">Sublime Text</span> 等同理
        <n-button size="small" @click="$reactive.setting.specialTagConfigActive = true">配置</n-button>
        <!--          </template>-->
        <!--          <template v-else>-->
        <!--            开启后，<span class="global-color">name</span>在原有匹配基础上，还将匹配-->
        <!--            <n-checkbox :focusable="false" :checked="betaSearchAspects.desc" @update:checked="handleChangeBetaSearchAspects('desc',$event)">描述</n-checkbox>-->
        <!--            <n-checkbox :focusable="false" :checked="betaSearchAspects.content" @update:checked="handleChangeBetaSearchAspects('content',$event)">代码（仅支持普通代码片段）</n-checkbox>-->
        <!--          </template>-->
      </n-popover>
    </div>

    <div class="aspect">
      <h4 id="tag">标签管理</h4>
      <p class="tooltip">清除无用标签，后续只会影响到编辑界面中的标签选择</p>
      <template v-if="refreshFlag">
        <n-space style="padding: 0 10px">
          <normal-tag type="clear" v-for="tag in tagColorManager.all()" :content="tag" @tag-refresh="dealWithTagRefresh"/>
        </n-space>
      </template>
    </div>

    <div class="aspect">
      <h4 id="func">占位符管理</h4>
      <p class="tooltip">若内置占位符不满足需求，可以创建你的自定义占位符</p>
      <func-pane/>
    </div>


    <div class="aspect" v-if="configManager.get('easter_egg_log')">
      <h4 @click="handleLogClick">本地数据统计（今日/七日/总计）</h4>
      <p class="tooltip">由于插件在v2.7.2版本才开始统计，数据仅供参考</p>
      <div class="stat-container">
        <div class="stat-item" v-for="stat in statisticsManager.getStatistics()">
          <template v-if="stat.label === '使用天数'">
            <n-tooltip>
              <template #trigger>
                <n-statistic :label="stat.label">
                  <n-number-animation show-separator :from="0" :to="stat.value[0]"/>
                  /
                  <n-number-animation show-separator :from="0" :to="stat.value[2]"/>
                </n-statistic>
              </template>
              有效使用天数 / 安装天数
            </n-tooltip>
          </template>
          <template v-else>
            <n-statistic :label="stat.label">
              <n-number-animation show-separator :from="0" :to="stat.value[0]"/>
              /
              <n-number-animation show-separator :from="0" :to="stat.value[1]"/>
              /
              <n-number-animation show-separator :from="0" :to="stat.value[2]"/>
            </n-statistic>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import {tagColorManager} from "../js/utools/tag";
import {ref} from "vue";
import NormalTag from "../components/base/NormalTag.vue";
import ConfigCheckTag from "../components/base/ConfigCheckTag.vue";
import {NButton} from "naive-ui";
import {getRefreshFunc} from "../js/utils/common";
import FuncPane from "../components/pane/FuncEditPane.vue";
import {$reactive, refreshListView} from "../js/store";
import CustomView from "../components/pane/CustomPane.vue";
import {generate_backup, load_backup} from "../js/utools/backup";
import {backupFilePath} from "../js/some";
import SpecialTagConfigModal from "../components/modal/SpecialTagConfigModal.vue";
import SvgBackupImport from "../asserts/backup-import.svg";
import SvgBackupExport from "../asserts/backup-export.svg";
import {statisticsManager} from "../js/utools/statistics";
import SearchPane from "../components/pane/side/SearchPane.vue";
import {configManager} from "../js/utools/config";

const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag);
const configIndex = ref(0);


const dealWithTagRefresh = ()=>{
  refreshListView()
  doRefresh();
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
let count = 0;
function handleLogClick() {
  if(count > 3){
    return;
  }
  count++;
  if(count > 3){
    configManager.set('easter_egg_log',false);
    $message.info("本地统计组件已隐藏~")
    doRefresh();
  }
}


</script>

<style lang="scss">

#side-view{
  .n-select{
    font-size: 12px;
    width: 150px;
  }
  .n-divider{
    height: 12px;
  }
  padding: 10px;
  .aspect{
    padding: 10px;
    margin: 20px 0;
    border-radius: 5px;
    width: 95%;
    transition: all .3s;

    h4{
      margin-bottom: 10px;
      user-select: none;
    }

    p.tooltip{
      border-left: 2px solid #aaa;
      background-color: #f0f0f0;
      font-size: 12px;
      padding: 5px;
      margin: 5px 0;
    }
  }

  .stat-container{
    display: flex;
    flex-wrap: wrap;


    .stat-item{
      flex: 50%;
      box-sizing: border-box;

      .n-statistic{
        --n-value-font-size: 12px !important;
      }
    }
  }
}
#light-app #side-view{
  .aspect{
    border: 1px solid #efeff2;
    &:hover{
      box-shadow: rgba(0, 0, 0, 0.08) 0 4px 12px;
    }


  }
}
#dark-app #side-view{

  .aspect{
    box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2),0 2px 4px 0 rgba(0, 0, 0, 0.1),inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    p.tooltip{
      background-color: #454647;
    }
  }
}

</style>