<template>
  <div v-if="refreshFlag">
    <n-divider title-placement="center">
      自定义变量映射
    </n-divider>
    <n-list hoverable clickable :show-divider="false" @mouseleave="activeKey = null">
      <n-list-item v-for="(value,key) in formatManager.all()"
        @mouseenter="activeKey = key"
      >
        <n-ellipsis :tooltip="false" style="max-width: 280px">
          {{key}} —— {{value}}
        </n-ellipsis>
        <template #suffix>
          <n-space v-if="activeKey === key && isValid(key)" :wrap="false" style="margin-right: -16px;margin-top: 5px">
            <n-button circle size="tiny" type="info" quaternary @click="enterEditView(key,value)">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M20.998 6.25A3.25 3.25 0 0 0 17.748 3H6.25A3.25 3.25 0 0 0 3 6.25v11.499a3.25 3.25 0 0 0 3.25 3.25h4.914l.356-1.424l.02-.076H6.25a1.75 1.75 0 0 1-1.75-1.75v-9.25h14.998v2.733c.48-.19.994-.264 1.5-.22V6.25zM6.25 4.5h11.499c.966 0 1.75.783 1.75 1.75V7h-15v-.75c0-.967.784-1.75 1.75-1.75zm12.848 8.169l-5.901 5.901a2.685 2.685 0 0 0-.707 1.248l-.457 1.83c-.2.797.522 1.518 1.318 1.319l1.83-.458a2.685 2.685 0 0 0 1.248-.706L22.33 15.9a2.286 2.286 0 0 0-3.233-3.232z" fill="currentColor"></path></g></svg>
              </template>
            </n-button>
            <n-button circle size="tiny" quaternary type="error" @click="doDel(key)">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z" fill="currentColor"></path></g></svg>
              </template>
            </n-button>
          </n-space>
        </template>
      </n-list-item>
    </n-list>
    <n-button size="small" style="margin:5px;"
      @click="enterAddView"
    >添加</n-button>
    <n-modal v-model:show="showModal"
             preset="card"
             :title="pair.flag?'修改变量映射': '新增变量映射'"
             style="width: 60%"

    >
      <n-input v-model:value="pair.raw" clearable placeholder="变量"/>
      <p style="font-size: 12px;margin: 5px">替换为</p>
      <n-input v-model:value="pair.target" clearable placeholder="替换值"/>
      <template #footer>
        <div style="width: 100%;position: relative">
          <n-space style="position: absolute; right: 3px">
            <n-button quaternary @click="showModal = false">取消</n-button>
            <n-button quaternary type="success" @click="doFinal()">确定</n-button>
          </n-space>
        </div>
        <br/>
      </template>
    </n-modal>
  </div>
</template>
<script setup>
  import {ref} from "vue";
  import {formatManager} from "../js/core/format";
  import {getRefreshFunc} from "../js/utils/common";

  const activeKey = ref(null)
  const showModal = ref(false)
  const pair = ref({})
  const refreshFlag = ref(true)
  const doRefresh = getRefreshFunc(refreshFlag)
  const list = [
      'random',
      'rand10m',
      'rand100m',
      'date',
      'time',
      'uuid'
  ]
  function enterAddView(){
    pair.value = {
      flag: false
    };
    activeKey.value = null;
    showModal.value = true;
  }
  function doDel(key){
    formatManager.del(key)
    doRefresh()
  }
  function enterEditView(key,value){
    pair.value = {
      raw: key,
      target: value,
      flag: true,
      origin: key
    }
    showModal.value = true;
  }
  function doFinal(){
    if(pair.value.flag){  // edit
        if(pair.value.origin === pair.value.raw){
          // final
          formatManager.set(pair.value.origin,pair.value.target)
          showModal.value = false;
          doRefresh()
          return;
        }
    }
    // add
    // 1. 检查不为空 重复
    if(pair.value.raw ){
      if(formatManager.contain(pair.value.raw)){
        $message.warning("该变量已经重复定义")
        return;
      }
      // 2. final
      if(pair.value.flag){
        formatManager.del(pair.value.origin)
      }
      formatManager.set(pair.value.raw,pair.value.target)
      showModal.value = false;
      doRefresh()
    }else{
      $message.error("变量名不能设置为空字符串")
    }
  }
  function isValid(key){
    return !list.includes(key)
  }

</script>
<style scoped>
.n-list-item{
  height: 40px;
  padding: 0 5px
}
</style>