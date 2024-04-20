<template>
  <n-collapse accordion>
  <template v-for="(func,key) in formatManager.funcMap">
    <div class="func">
        <n-collapse-item :title="func.name">
          <p class="func-desc" v-html="replaceDesc(func.desc,key)"></p>
        </n-collapse-item>
      <template v-for="(desc,command) in func.commands">
        <n-button v-if="desc" secondary type="tertiary" size="tiny"
                  :style="{
                    width:getWidth(command,desc)
                  }"
                  @mouseenter="descShow[command] = true "
                  @mouseleave="descShow[command] = false "
                  @click="$emit('choose',command,($event.altKey || $event.ctrlKey || $event.metaKey || $event.shiftKey))" >
          {{descShow[command] ? command: desc}}
        </n-button>
        <n-button v-else secondary type="tertiary" size="tiny"
                  @click="$emit('choose',command,($event.altKey || $event.ctrlKey || $event.metaKey || $event.shiftKey))" >
          {{command}}
        </n-button>
      </template>

    </div>

  </template>
  </n-collapse>

</template>

<script setup>

import {formatManager} from "../../js/utools/func";
import {ref} from "vue";

defineEmits(['choose'])
const descShow = ref({})
function getChineseStringLength(str) {
  let totalLength = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode <= 128) {
      totalLength += 1;
    } else {
      totalLength += 2; // 中文字符在 UTF-8 编码下占据两个字节
    }
  }
  return totalLength;
}

/**
 *
 * @param {string} desc
 * @param key
 * @return {string}
 */
function replaceDesc(desc,key){
  if(!desc){
    return '暂无描述';
  }
  return desc.replaceAll('\n','<br/>')
      .replaceAll(/{{(.*?)}}/g,(match,command)=>{
        const newCommand = command.trim();
        const desc = formatManager.funcMap[key].commands[newCommand]
        if(desc){
          return `<b title="${desc}">${newCommand}</b>`
        }else{
          return `<b>${newCommand}</b>`;
        }
      })
}

/**
 *
 * @param {string} command
 * @param {string} desc
 */
function getWidth(command,desc){
  const max = Math.max(getChineseStringLength(desc),getChineseStringLength(command))
  return (max * 8 + 6) + 'px'
}
</script>


<style lang="scss" scoped>
.func{
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #777;
  &:last-child{
    border-bottom: none;
  }
  .n-button{
    margin: 5px;
    transition: all .3s;
  }
  .n-button:hover{
    color: white;
    background-color: var(--global-color);
  }
}

.n-list-item{
  min-height: 90px;
  max-height: 150px;
  padding: 0 5px;
  width: 428px;
}
p{
  font-size: 11px;
  padding-left: 10px;
}
</style>