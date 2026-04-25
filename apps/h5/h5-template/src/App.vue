<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStackH5 } from '@vue3-mono/hooks-h5'
import { ErrorBoundaryH5 } from '@vue3-mono/components-h5'
import { captureException } from '@/plugins/sentry'

const { include } = useHistoryStackH5({ autoBind: false })
const keepAliveInclude = computed(() => include.value)

function onRouteError(err: unknown) {
  captureException(err)
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <ErrorBoundaryH5 :on-capture="onRouteError">
      <Transition :name="(route.meta?.transition as string) || 'slide-fade'" mode="out-in">
        <KeepAlive :include="keepAliveInclude">
          <component :is="Component" :key="route.fullPath" />
        </KeepAlive>
      </Transition>
    </ErrorBoundaryH5>
  </RouterView>
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
