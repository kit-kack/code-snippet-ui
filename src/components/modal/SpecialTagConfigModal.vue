<template>
  <base-modal wide  title="启用并配置 官方代码片段存放目录路径"
              @cancel="$reactive.setting.specialTagConfigActive = false"
              @confirm="handleSave"
  >
    <n-scrollbar style="max-height: 60vh;padding-right: 10px">
      <template v-for="(config,tag,index) in configs" :key="tag">
        <br v-if="config.enabled && index !== 0"/>
        <n-checkbox :focusable="false" v-model:checked="config.enabled">
          {{tag}}
        </n-checkbox>
        <n-input v-if="config.enabled" :placeholder="getPlaceHolder(tag)" v-model:value="config.path">
          <template #suffix>
            <n-button text @click="openDirectory(tag)">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>                  </template>
            </n-button>
          </template>
        </n-input>
      </template>
    </n-scrollbar>
  </base-modal>
</template>

<script setup>

import BaseModal from "./BaseModal.vue";
import {$reactive} from "../../js/store";
import {ref, toRaw} from "vue";
import {configManager} from "../../js/utools/config";
import {DEFAULT_CONF, SUBLIME_TEXT, VSCode, VSCode_PATH} from "../../js/editor/editor";
const configs = ref(configManager.getSubItem('editor') ?? structuredClone(DEFAULT_CONF))

function getPlaceHolder(tag){
  switch (tag){
    case VSCode:
      return "一般位于 "+VSCode_PATH;
    case SUBLIME_TEXT:
      return `一般位于 ${window.preload.getFinalPath('{Sublime Text安装目录}','./Data/Packages/User')}`;
    default:
      return `一般位于 ${window.preload.getFinalPath('{appData}','./JetBrains/{具体版本产品}/templates')}`;
  }
}

function openDirectory(tag){
  let item;
  switch (tag){
    case VSCode:
      item = {
        title: "VSCode官方代码片段存放目录",
        defaultPath: VSCode_PATH
      }
      break
    case SUBLIME_TEXT:
      item = {
        title: `请选择 ${window.preload.getFinalPath('{Sublime Text安装目录}','./Data/Packages/User')} 目录`,
        defaultPath: utools.getPath('desktop')
      }
      break
    default:
      item = {
        title: `JetBrains系目录： {具体版本${tag}}/templates`,
        defaultPath: window.preload.getFinalPath(utools.getPath('appData'),'./JetBrains')
      }
  }
  const realPathList = utools.showOpenDialog({
    title: item.title ,
    defaultPath: item.defaultPath,
    buttonLabel: '确定',
    properties: [
      'openDirectory'
    ]
  })
  if (realPathList != null) {
    configs.value[tag].path = realPathList[0]
  }
}

function handleSave(){
  for (const tag in configs.value) {
    if(configs.value[tag].enabled){
      if(!configs.value[tag].path){
        $message.warning(`[${tag}]路径未填写!!!`)
        return;
      }
    }
  }
  // 保存
  configManager.setSubItem('editor',toRaw(configs.value))
  $reactive.setting.specialTagConfigActive = false
}
</script>

<style scoped>

</style>