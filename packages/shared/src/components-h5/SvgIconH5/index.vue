<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 图标名称（本地 SVG symbol id）或外部图片 URL */
  name: string
  /** 图标尺寸（px），默认 20（移动端视觉） */
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  color: 'currentColor',
})

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
  <img
    v-if="isExternalUrl"
    :src="name"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :alt="name"
    class="svg-icon-h5 svg-icon-h5--img"
  />
  <svg v-else :style="style" aria-hidden="true" class="svg-icon-h5">
    <use :href="symbolId" />
  </svg>
</template>

<style lang="scss" scoped>
.svg-icon-h5 {
  display: inline-block;
  flex-shrink: 0;
  overflow: hidden;
  vertical-align: middle;
  fill: currentColor;

  &--img {
    object-fit: contain;
    fill: unset;
  }
}
</style>
