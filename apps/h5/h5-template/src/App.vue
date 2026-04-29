<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ConfigProvider } from 'vant'
import { useBridge } from '@vue3-monorepo/shared/bridge'
import { useHistoryStackH5 } from '@vue3-monorepo/shared/hooks-h5'
import { ErrorBoundaryH5 } from '@vue3-monorepo/shared/components-h5'
import { useAppStore } from '@/stores'

const route = useRoute()
const { locale, t } = useI18n()
const bridge = useBridge()

/** 切换语言后立即刷新标题（路由守卫仅在跳转时执行） */
function syncDocumentTitle(): void {
  const titleKey = route.meta?.titleKey as string | undefined
  const title = titleKey ? t(titleKey) : ((route.meta?.title as string) ?? '')
  if (title && typeof document !== 'undefined') document.title = title
  if (title) bridge.navigation.setTitle(title).catch(() => {})
}

watch(() => [locale.value, route.fullPath] as const, syncDocumentTitle, { immediate: true })

const { include } = useHistoryStackH5({ autoBind: false })
const keepAliveInclude = computed(() => include.value)

const app = useAppStore()
const { isDark } = storeToRefs(app)
const vantTheme = computed(() => (isDark.value ? 'dark' : 'light'))
</script>

<template>
  <ConfigProvider :theme="vantTheme">
    <RouterView v-slot="{ Component, route: routeView }">
      <ErrorBoundaryH5>
        <Transition :name="(routeView.meta?.transition as string) || 'slide-fade'" mode="out-in">
          <KeepAlive :include="keepAliveInclude">
            <component :is="Component" :key="routeView.fullPath" />
          </KeepAlive>
        </Transition>
      </ErrorBoundaryH5>
    </RouterView>
  </ConfigProvider>
</template>

<style lang="scss">
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
