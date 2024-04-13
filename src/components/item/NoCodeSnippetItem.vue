<template>
  <base-snippet-item>
    <template #content="{snippet}">
      <!-- 描述（标题下方） -->
      <n-ellipsis :tooltip="false">
        <span class="snippet-item__desc" style="margin-left: 0px;" v-html="(snippet.matchType === 1 && snippet.temp)? snippet.temp : snippet.desc" ></span>
      </n-ellipsis>
    </template>
    <template #header-desc="{pair}">
      {{pair.sideInfo}}
    </template>
  </base-snippet-item>
</template>

<script setup>

import BaseSnippetItem from "./BaseSnippetItem.vue";
</script>

<style scoped>

</style>