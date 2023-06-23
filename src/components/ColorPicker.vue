<template>
  <div style="line-height: 30px;
        display: flex;
        justify-content: center;
        align-content: center;
        padding: 2px;"
        id="color"
        :class="{ style:isStyled}"
  >
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
    {{instance.title}}
  </div>
</template>

<script setup>
defineProps({
  instance: Object,
  isStyled: Boolean
})
</script>

<style>

.style{
  background-color: #d9d9d9;
}
#dark-app .style{
  background-color: #303133 !important;
}
#dark-app #color{
  color: #d9d9d9;
}
.n-color-picker{
  margin-right:4px;
}
</style>