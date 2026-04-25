<script setup lang="ts">
import { computed } from 'vue'

type Position = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  /** 占位方向 */
  position?: Position
  /** 占位颜色（默认透明，仅撑高度） */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  color: 'transparent'
})

const style = computed<Record<string, string>>(() => {
  const common: Record<string, string> = { background: props.color }
  switch (props.position) {
    case 'top':
      common.height = 'env(safe-area-inset-top)'
      break
    case 'bottom':
      common.height = 'env(safe-area-inset-bottom)'
      break
    case 'left':
      common.width = 'env(safe-area-inset-left)'
      common.height = '100%'
      break
    case 'right':
      common.width = 'env(safe-area-inset-right)'
      common.height = '100%'
      break
  }
  return common
})
</script>

<template>
  <div class="h5-safe-area" :style="style" aria-hidden="true" />
</template>

<style lang="scss" scoped>
.h5-safe-area {
  display: block;
  flex-shrink: 0;
  width: 100%;
}
</style>
