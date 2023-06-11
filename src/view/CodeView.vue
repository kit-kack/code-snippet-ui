<template>

  <div @contextmenu=" handleClose()">
    <n-scrollbar style="max-height: 100vh" x-scrollable trigger="hover" ref="scrollBar">
      <template v-if="isValidLanguage">
        <highlightjs :language="snippet.type??'plaintext'" :autodetect="false" :code="snippet.code" width="100%"/>
      </template>
      <template v-else>
        <highlightjs  autodetect :code="snippet.code" width="100%"/>
      </template>
    </n-scrollbar>
    <div id="extra">
      <n-space>
        <n-popover trigger="hover" :show="hover || $var.view.showCodeTip" placement="top" :show-arrow="false" style="padding:5px">
          <template #trigger>
            <n-button
                @mouseenter="hover = true"
                @mouseleave="hover = false"
                @click="handleClick"
                quaternary :color="configManager.getGlobalColor()">🚀{{ snippet.type??'plaintext' }}</n-button>
          </template>
          <n-list hoverable clickable :show-divider="false" @mouseenter="hover = true" @mouseleave="hover = false">
            <n-list-item >
              <div align="center">{{snippet.name}}</div>
            </n-list-item>
            <n-list-item  v-if="snippet.desc != null">
              <div>{{"📢 "+snippet.desc}}</div>
            </n-list-item >
            <n-list-item  v-if="snippet.tags != null && snippet.tags.length > 0">
              <div>{{"🔖 "+snippet.tags.join()}}</div>
            </n-list-item >
            <n-list-item >
              <div>{{`⏰ ${calculateTime(snippet.time)} 🎲${snippet.count??0}`}}</div>
            </n-list-item>
            <n-list-item v-if="!isValidLanguage">
              <div style="color: indianred">🚨 语言不内置支持，故启用自动高亮</div>
            </n-list-item>
          </n-list>
        </n-popover>

        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong quaternary circle :color="configManager.getGlobalColor()"  @click="handleClose">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z" fill="currentColor"></path></svg>
              </template>
            </n-button>
          </template>
          你可以使用按下右键或q来退出页面
        </n-tooltip>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import {codeSnippetManager, configManager} from "../js/core.js";
import {computed, onMounted, ref} from "vue";
import {calculateTime, handleRecoverLiteShow, isSupportedLanguage} from "../js/some.js";
import {$var, LIST_VIEW} from "../js/store";
const scrollBar = ref(null)
const snippet = codeSnippetManager.get($var.currentName);
const hover = ref(false)
const isValidLanguage = computed(()=>isSupportedLanguage(snippet.type??'plaintext'))


const handleClick = ()=>{
  $message.info('该提示部分可以由Vim模式下s键控制')
}
const handleClose = ()=>{
  $var.view.showCodeTip = false;
  $var.utools.keepSelectedStatus = true;
  handleRecoverLiteShow();
  $var.currentMode = LIST_VIEW;


}

onMounted(()=>{
    $var.scroll.codeInvoker = scrollBar.value;
})

</script>

<style >
#extra{
  position: fixed;
  right:20px;
  top:90vh;
}
.n-list-item{
  height: 32px;
  padding: 0 5px
}
</style>