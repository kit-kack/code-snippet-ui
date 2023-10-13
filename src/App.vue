<template>
  <n-config-provider :theme="theme" :hljs="hljs" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <middle-view/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import hljs from "./js/dep/highlight-dep";
import {initTheme, theme, themeOverrides} from "./js/theme";
import {onMounted} from "vue";
import MiddleView from "./view/MiddleView.vue";


onMounted(()=>{
  document.body.id = utools.isDarkColors()? 'dark-app' : 'light-app'
  initTheme()
})

</script>


<style scoped>

</style>
