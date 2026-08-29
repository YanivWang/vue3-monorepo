<script setup lang="ts">
import { Skeleton as VanSkeleton } from 'vant'

interface Props {
  /** 是否处于加载态 */
  loading: boolean
  /** 骨架行数 */
  rows?: number
  /** 是否显示头像 */
  avatar?: boolean
  /** 是否显示标题行 */
  title?: boolean
  /** 是否开启动画 */
  animate?: boolean
}

withDefaults(defineProps<Props>(), {
  rows: 3,
  avatar: false,
  title: true,
  animate: true,
})

defineSlots<{
  default(): void
}>()
</script>

<template>
  <VanSkeleton v-if="loading" :row="rows" :avatar="avatar" :title="title" :animate="animate" />
  <slot v-else />
</template>
