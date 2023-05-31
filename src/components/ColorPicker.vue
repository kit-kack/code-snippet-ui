<template>
  <div style="line-height: 30px;
        display: flex;
        justify-content: center;
        align-content: center;
        padding: 2px;"
       :class="{ style:isStyled,dark:isDark}"
  >
    {{instance.title}}
    <n-color-picker
        :actions="['confirm']"
        size="small"
        :default-value="instance.color"
        @update:value="v=> instance.handleUpdate?.(v)"
        @confirm="v=> instance.handleConfirm?.(v)"
        :swatches="[
                '#707070FF',
                '#18A058FF',
                '#1f5aa3FF',
                '#513A9DFF',
                '#a31f37FF',
                '#F4B23CEB',
                '#bf1866FF']" >
      <template #label> </template>
    </n-color-picker>
  </div>
</template>

<script setup>
const isDark = utools.isDarkColors();
defineProps({
  instance: Object,
  isStyled: Boolean
})
</script>

<style scoped>
.style{
  background-color: #d9d9d9;
}
.style.dark{
  background-color: #303133 !important;
}
.n-color-picker{
  margin-left:4px;
}
</style>