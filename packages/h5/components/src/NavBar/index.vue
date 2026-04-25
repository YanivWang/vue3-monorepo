<script setup lang="ts">
import { NavBar as VanNavBar } from 'vant'

interface Props {
  /** 标题 */
  title?: string
  /** 是否显示左侧返回箭头 */
  leftArrow?: boolean
  /** 左侧文字 */
  leftText?: string
  /** 右侧文字 */
  rightText?: string
  /** 吸顶 */
  fixed?: boolean
  /** 吸顶后保留占位 */
  placeholder?: boolean
  /** 自动避开安全区（fixed 模式下强烈建议开启） */
  safeAreaInsetTop?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  leftArrow: true,
  leftText: undefined,
  rightText: undefined,
  fixed: false,
  placeholder: false,
  safeAreaInsetTop: true
})

const emit = defineEmits<{
  (e: 'click-left'): void
  (e: 'click-right'): void
}>()

defineSlots<{
  title(): void
  left(): void
  right(): void
}>()

function onClickLeft() {
  emit('click-left')
  if (typeof history !== 'undefined') history.back()
}
</script>

<template>
  <VanNavBar
    :title="title"
    :left-arrow="leftArrow"
    :left-text="leftText"
    :right-text="rightText"
    :fixed="fixed"
    :placeholder="placeholder"
    :safe-area-inset-top="safeAreaInsetTop"
    @click-left="onClickLeft"
    @click-right="emit('click-right')"
  >
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.left" #left><slot name="left" /></template>
    <template v-if="$slots.right" #right><slot name="right" /></template>
  </VanNavBar>
</template>
