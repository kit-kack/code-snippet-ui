<template>
  <div class="special-type">
    <n-icon class="icon" style="margin-right: 3px;margin-top: -2px;">
      <component :is="RENDER_ICON[entity.renderType]"></component>
    </n-icon>
<!--    <span class="item-code item-flag">本地目录</span>-->
    <span class="item-code">{{entity.code || ' xxx'}}</span>
  </div>
</template>

<script setup>
import SvgDirectory from "../../asserts/directory.svg";
import SvgImage from "../../asserts/image.svg";
import SvgLink from "../../asserts/link.svg";
import SvgPath from "../../asserts/path.svg";
const props = defineProps(['entity'])

const RENDER_ICON = {
  "dir":SvgDirectory,
  "image": SvgImage,
  "link": SvgLink,
  "file": SvgPath
}
</script>

<style lang="scss" scoped>
.special-type{
  display: flex;
  align-items: center;
}
.item-flag{
  background: red;
  border-radius: 10px;
}
.snippet-item.selected .special-type{
  .item-code{
    padding-left: 2px;
    text-decoration: underline var(--item-code-text-color);
  }
}
</style>