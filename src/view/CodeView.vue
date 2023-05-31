<template>

  <div @contextmenu="emit('doClose')">
    <n-scrollbar style="max-height: 99vh" x-scrollable trigger="hover" ref="scrollBar">
      <n-alert :title="snippet.name" type="default">
        <template #icon>📖</template>
        描述：{{snippet.desc}} <br/>
        标签：{{snippet.tags?.join('、')}} <br/>
        编程语言：{{snippet.type??'plaintext'}}<br/>
        最近使用时间：{{calculateTime(snippet.time)}}<br/>
        累计使用次数：{{snippet.count??0}}
      </n-alert>

      <template v-if="isSupportedLanguage(snippet.type??'plaintext')">
        <div id="main" @contextmenu="emit('doClose')">
          <highlightjs :language="snippet.type??'plaintext'" :autodetect="false" :code="snippet.code" width="100%"/>
        </div>
      </template>
      <template v-else>
        <div id="main" @contextmenu="emit('doClose')">
          <highlightjs  autodetect :code="snippet.code" width="100%"/>
        </div>
      </template>
    </n-scrollbar>
    <div id="extra">
      <n-tooltip trigger="hover" placement="left">
        <template #trigger>
          <n-button strong secondary circle type="warning" @click="emit('doClose')">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z" fill="currentColor"></path></svg>
            </template>
          </n-button>
        </template>
        你可以使用按下右键或q来退出页面
      </n-tooltip>
    </div>
  </div>
</template>

<script setup>
import {codeSnippetManager} from "../js/core.js";
import {onMounted, ref} from "vue";
import {calculateTime, scrollCodeInvoker} from "../js/utils/variable.js";
import {isSupportedLanguage} from "../js/utils/some.js";
const props = defineProps(['name'])
const emit = defineEmits(['doClose'])
const scrollBar = ref(null)
const snippet = codeSnippetManager.get(props.name);

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

</style>