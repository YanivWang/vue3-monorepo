<script setup lang="ts">
import { Tabbar, TabbarItem } from 'vant'

export interface TabBarRouteItem {
  /** 路由 name */
  name: string
  path: string
  label: string
  icon?: string
}

defineOptions({ name: 'H5TabBarLayout' })

defineProps<{
  tabs: TabBarRouteItem[]
}>()
</script>

<template>
  <Tabbar route safe-area-inset-bottom fixed placeholder>
    <TabbarItem v-for="t in tabs" :key="t.name" replace :to="t.path" :icon="t.icon">
      {{ t.label }}
    </TabbarItem>
  </Tabbar>
</template>
