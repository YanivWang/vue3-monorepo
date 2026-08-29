<script setup lang="ts">
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { NavBar } from 'vant'

const router = useRouter()
const route = useRoute()

interface Props {
  /** 页面标题（留空则不渲染导航栏） */
  title?: string
  /** 是否显示左侧返回箭头，默认 true */
  leftArrow?: boolean
  /** 返回按钮文案 */
  leftText?: string
  /** 是否固定导航栏在顶部 */
  fixed?: boolean
  /** 是否吸顶后保留占位空间（配合 fixed） */
  placeholder?: boolean
  /** 是否撑满 viewport（自动为 body 提供最小高度） */
  fill?: boolean
  /** 是否自动应用安全区上下 padding */
  safeAreaTop?: boolean
  safeAreaBottom?: boolean
  /**
   * 无历史可退时（如 Tab `replace` 进当前页、直链首屏）NavBar 左侧的兜底目标，默认回首页
   * @default { name: 'Home' }
   */
  backFallback?: RouteLocationRaw
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  leftArrow: true,
  leftText: undefined,
  fixed: false,
  placeholder: false,
  fill: true,
  safeAreaTop: false,
  safeAreaBottom: true,
  backFallback: () => ({ name: 'Home' }),
})

const emit = defineEmits<{
  (e: 'click-left'): void
  (e: 'click-right'): void
}>()

defineSlots<{
  default(): void
  header(): void
  right(): void
  left(): void
  footer(): void
}>()

function onClickLeft() {
  emit('click-left')
  if (typeof window === 'undefined') return
  const st = window.history.state as { back?: unknown; replaced?: boolean } | null
  const isTabRoot = Boolean((route.meta as { tab?: boolean }).tab)
  // Tab 的 router.replace 会保留「进入底栏上一页前」的 state.back（如 Login），若仅判断 back
  // 会误用 router.back() 退到错误栈或退不动；对 tab 根页且本页是 replace 进来时一律走兜底
  if (isTabRoot && st?.replaced) {
    void router.push(props.backFallback)
  } else if (st?.back != null) {
    void router.back()
  } else {
    void router.push(props.backFallback)
  }
}
</script>

<template>
  <div
    class="h5-page-container"
    :class="{
      'h5-page-container--fill': props.fill,
      'h5-page-container--safe-top': props.safeAreaTop,
      'h5-page-container--safe-bottom': props.safeAreaBottom,
    }"
  >
    <slot name="header">
      <NavBar
        v-if="props.title"
        :title="props.title"
        :left-arrow="props.leftArrow"
        :left-text="props.leftText"
        :fixed="props.fixed"
        :placeholder="props.placeholder"
        @click-left="onClickLeft"
        @click-right="emit('click-right')"
      >
        <template v-if="$slots.left" #left><slot name="left" /></template>
        <template v-if="$slots.right" #right><slot name="right" /></template>
      </NavBar>
    </slot>

    <main class="h5-page-container__body">
      <slot />
    </main>

    <footer v-if="$slots.footer" class="h5-page-container__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.h5-page-container {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page);

  &--fill {
    min-height: 100vh;
  }

  &--safe-top {
    padding-top: env(safe-area-inset-top);
  }

  &--safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  &__body {
    flex: 1;
    min-height: 0;
  }

  &__footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
  }
}
</style>
