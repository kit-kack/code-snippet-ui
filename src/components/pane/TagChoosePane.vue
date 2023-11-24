<template>
  <n-drawer resizable v-model:show="$reactive.view.aidTagActive"
            height="65px" style="padding-top:16px;user-select: none"
            placement="top"
            @after-enter="handleShow"
  >
    <n-scrollbar style="max-height: 60px;" x-scrollable>
      <n-space :wrap="false" style="padding-bottom: 20px;padding-left: 20px">
        <n-tag  checkable v-for="tag in tagColorManager.all()" v-model:checked="tagCheck[tag.toLowerCase()]" @update-checked="value => updateTagCheck(tag,value)" >
          {{tag}}
        </n-tag>
      </n-space>
    </n-scrollbar>
  </n-drawer>
</template>

<script setup>
import {ref} from "vue";
import {tagColorManager} from "../../js/core/tag";
import {$normal, $reactive} from "../../js/store";
import {lowercaseIncludes} from "../../js/utils/common";

const tagCheck = ref({})

function handleShow(){
  tagCheck.value = {};
  if($normal.tempTags){
    for (let tag of $normal.tempTags) {
      tagCheck.value[tag.toLowerCase()] = true;
    }
  }
}
function updateTagCheck(tag,flag){
  tag = tag.toLowerCase();
  tagCheck.value[tag] = flag;
  if(flag){
    // add
    if(!lowercaseIncludes($normal.tempTags,tag)){
      // 修改uTools输入框
      utools.setSubInputValue(`#${tag} ${$reactive.utools.search}`)
    }
  }else{
    // del
    if(lowercaseIncludes($normal.tempTags,tag)){
      // 删除
      tag = '#'+tag;
      utools.setSubInputValue($reactive.utools.search.replace(new RegExp(tag,'gi'),'').trim())
    }
  }
}
</script>

<style scoped>

</style>