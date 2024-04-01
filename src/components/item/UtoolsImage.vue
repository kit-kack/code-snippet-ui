<template>
  <img :src="props.url" alt="图片加载异常，utools数据库中不存在该键" ref="img">
</template>

<script setup>
import {onBeforeUpdate, onMounted, ref} from "vue";

const img = ref(null)
const props = defineProps({
  id: String,
  url: {
    type: String,
    default: '#'
  }
})
function initImage(){
  if(props.id){
    let attachment = utools.db.getAttachment(props.id);
    const attachementType = utools.db.getAttachmentType(props.id);
    if(attachment && attachementType){
      let blob = new Blob([attachment.buffer],{
        type: attachementType
      })
      img.value.src = URL.createObjectURL(blob);
      // 防止内存泄漏
      attachment = null
      blob = null
    }
  }
}
onMounted(()=>{
  initImage()
})
onBeforeUpdate(()=>{
  initImage()
})
</script>

<style scoped>

</style>