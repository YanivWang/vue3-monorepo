<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ConfigProvider } from 'vant'
import { useHistoryStackH5 } from '@vue3-mono/shared/hooks-h5'
import { ErrorBoundaryH5 } from '@vue3-mono/shared/components-h5'
import { useAppStore } from '@/stores'
import { captureException } from '@/plugins/sentry'

const { include } = useHistoryStackH5({ autoBind: false })
const keepAliveInclude = computed(() => include.value)

const app = useAppStore()
const { isDark } = storeToRefs(app)
const vantTheme = computed(() => (isDark.value ? 'dark' : 'light'))

function onRouteError(err: unknown) {
  captureException(err)
}
</script>

<template>
  <ConfigProvider :theme="vantTheme">
    <RouterView v-slot="{ Component, route }">
      <ErrorBoundaryH5 :on-capture="onRouteError">
        <Transition :name="(route.meta?.transition as string) || 'slide-fade'" mode="out-in">
          <KeepAlive :include="keepAliveInclude">
            <component :is="Component" :key="route.fullPath" />
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
