<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 图标名称（本地 SVG symbol id）或外部图片 URL（http/https//) */
  name: string
  /** 图标尺寸（px），默认 16 */
  size?: number
  /** 图标颜色，默认继承父元素颜色 */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  color: 'currentColor',
})

/** 判断是否为外部图片 URL */
const isExternalUrl = computed(
  () => props.name.startsWith('http') || props.name.startsWith('https') || props.name.startsWith('/'),
)

const symbolId = computed(() => `#icon-${props.name}`)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
}))
</script>

<template>
  <!-- 外部图片 URL 模式 -->
  <img
    v-if="isExternalUrl"
    :src="name"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :alt="name"
    class="svg-icon svg-icon--img"
  />

  <!-- 本地 SVG Symbol 模式（配合 vite-plugin-svg-icons 使用） -->
  <svg
    v-else
    :style="style"
    aria-hidden="true"
    class="svg-icon"
  >
    <use :href="symbolId" />
  </svg>
</template>

<style lang="scss" scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
  flex-shrink: 0;

  &--img {
    object-fit: contain;
    fill: unset;
  }
}
</style>
