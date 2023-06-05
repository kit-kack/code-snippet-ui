<template>

  <div @contextmenu="emit('doClose')">
    <n-scrollbar style="max-height: 100vh" x-scrollable trigger="hover" ref="scrollBar">
      <template v-if="isValidLanguage">
        <div @contextmenu="emit('doClose')">
          <highlightjs :language="snippet.type??'plaintext'" :autodetect="false" :code="snippet.code" width="100%"/>
        </div>
      </template>
      <template v-else>
        <div @contextmenu="emit('doClose')">
          <highlightjs  autodetect :code="snippet.code" width="100%"/>
        </div>
      </template>
    </n-scrollbar>
    <div id="extra">
      <n-space>
        <n-popover trigger="hover" :show="hover || showCodeTip" placement="top" :show-arrow="false" style="padding:5px">
          <template #trigger>
            <n-button
                @mouseenter="hover = true"
                @mouseleave="hover = false"
                @click="handleClick"
                quaternary :color="configManager.getGlobalColor()">🚀{{ snippet.type??'plaintext' }}</n-button>
          </template>
          <n-list hoverable clickable :show-divider="false"
            @mouseenter="hover = true"
                  @mouseleave="hover = false"
          >
            <n-list-item >
              <div align="center">{{snippet.name}}</div>
            </n-list-item>
            <n-list-item  v-if="snippet.desc != null">
              <div>{{"📢 "+snippet.desc}}</div>
            </n-list-item >
            <n-list-item  v-if="snippet.tags != null && snippet.tags.length > 0">
              <div>{{"🚩 "+snippet.tags.join()}}</div>
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
            <n-button strong quaternary circle :color="configManager.getGlobalColor()"  @click="emit('doClose')">
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
import {calculateTime, scrollCodeInvoker, showCodeTip} from "../js/utils/variable.js";
import {isSupportedLanguage} from "../js/utils/some.js";

const props = defineProps(['name'])
const emit = defineEmits(['doClose'])
const scrollBar = ref(null)
const snippet = codeSnippetManager.get(props.name);
const hover = ref(false)
const isValidLanguage = computed(()=>isSupportedLanguage(snippet.type??'plaintext'))


const handleClick = ()=>{
  $message.info('该提示部分可以由Vim模式下s键控制')
}

onMounted(()=>{
    scrollCodeInvoker.value = (direction)=>{
      switch (direction){
        case "left":
          scrollBar.value.scrollBy({left: -30})
          break;
        case "down":
          scrollBar.value.scrollBy({top: 30})
          break;
        case "up":
          scrollBar.value.scrollBy({top: -30})
          break;
        case "right":
          scrollBar.value.scrollBy({left: 30})
          break;
      }
    }
})

</script>

<style scoped>
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