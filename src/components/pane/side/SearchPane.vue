<template>
  <n-space vertical>
    <n-space>
      排序策略
      <n-select size="tiny"
                :options="sortKeyOptions"
                :default-value="configManager.getSortKey()"
                @update:value="handleSortStrategy"/>
    </n-space>
    <n-space>
      <span><span class="kitx-italic">name</span> 额外匹配</span>
      <n-checkbox :focusable="false" :checked="betaSearchAspects.desc" @update:checked="handleChangeBetaSearchAspects('desc',$event)">描述</n-checkbox>
      <n-checkbox :focusable="false" :checked="betaSearchAspects.content" @update:checked="handleChangeBetaSearchAspects('content',$event)">普通片段代码</n-checkbox>
    </n-space>
    <n-tooltip width="trigger">
      <template #trigger>
        <config-switch title="💡搜索子代码片段" config="beta_sub_snippet_search"/>
      </template>
      开启后，可以通过 <span class="kitx-italic">name$num</span> 搜索复制粘贴 <span class="kitx-italic">name</span> 对应的<span class="kitx-italic">num</span> 号子代码片段
    </n-tooltip>
  </n-space>
</template>

<script setup>

import {configManager} from "../../../js/utools/config";
import {refreshSearchResult} from "../../../js/store";
import ConfigSwitch from "../../base/ConfigSwitch.vue";
import {ref} from "vue";

const betaSearchAspects = ref({
  desc: !configManager.get('beta_wide_desc_close'),
  content: !configManager.get('beta_wide_content_close'),
})
function handleChangeBetaSearchAspects(type,value){
  betaSearchAspects.value[type] = value;
  configManager.set(`beta_wide_${type}_close`,!value)
}
const sortKeyOptions = [
  {
    label: "创建时间排序",
    value: 0
  },
  {
    label: "最近使用时间",
    value: 1
  },
  {
    label: "累计使用次数",
    value: 2
  },
  {
    label: "名字自然排序",
    value: 3
  }
]
function handleSortStrategy(v){
  configManager.set('strategy_sort',v);
  // refreshListView()
  refreshSearchResult();
}
</script>

<style scoped>

</style>