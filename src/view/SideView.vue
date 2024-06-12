<template>
  <div id="side-view">

    <h2 style="text-align: center">插件设置</h2>
    <div class="aspect">
      <h4 id="backup">备份</h4>
      <p class="tooltip">uTools会员能够自动同步插件数据，无需手动备份同步</p>
      <n-space>
        <n-button strong secondary  type="primary"  @click="handleImport">
          导入备份
          <template #icon>
            <svg-backup-import/>
          </template>
        </n-button>
        <n-button  strong secondary  type="info"  @click="handleExport" >
          导出备份
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
      <func-edit-pane/>
    </div>

  </div>
</template>

<script setup>
import {tagColorManager} from "../js/utools/tag";
import {ref} from "vue";
import NormalTag from "../components/base/NormalTag.vue";
import {NButton} from "naive-ui";
import {getRefreshFunc} from "../js/utils/common";
import FuncEditPane from "../components/pane/side/FuncEditPane.vue";
import {refreshListView} from "../js/store";
import CustomView from "../components/pane/side/CustomPane.vue";
import {generate_backup, load_backup} from "../js/utools/backup";
import {backupFilePath} from "../js/some";
import SvgBackupImport from "../asserts/backup-import.svg";
import SvgBackupExport from "../asserts/backup-export.svg";
import SearchPane from "../components/pane/side/SearchPane.vue";

const refreshFlag = ref(true)
const doRefresh = getRefreshFunc(refreshFlag);


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
  padding: 10px 10px 0 10px;
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
    justify-content: space-between;


    .stat-item{
      flex: 1;
      box-sizing: border-box;

      .n-statistic{
        --n-value-font-size: 12px !important;
      }
    }
  }
}
#light-app #side-view{
  .aspect{
    //border: 1px solid #efeff2;
    box-shadow: rgba(50, 50, 105, 0.15) 0 2px 5px 0, rgba(0, 0, 0, 0.05) 0 1px 1px 0;


    &:not(.stat):hover{
      box-shadow: rgba(9, 30, 66, 0.25) 0 4px 8px -2px, rgba(9, 30, 66, 0.08) 0 0 0 1px;
    }


  }
}
#light-app-v5 #side-view{
  .aspect{
    background-color: white;



    &:not(.stat):hover{
      box-shadow: rgba(50, 50, 105, 0.15) 0 2px 5px 0, rgba(0, 0, 0, 0.05) 0 1px 1px 0;
      //box-shadow: rgba(9, 30, 66, 0.25) 0 4px 8px -2px, rgba(9, 30, 66, 0.08) 0 0 0 1px;
    }
    .n-list{
      background-color: white;
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