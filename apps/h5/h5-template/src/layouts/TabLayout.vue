<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { TabBarLayout } from '@vue3-monorepo/shared/components-h5'
import { useTabsStore } from '@/stores'

defineOptions({ name: 'TabLayout' })

const route = useRoute()
const tabsStore = useTabsStore()
const { t } = useI18n()

const tabsWithLabels = computed(() =>
  tabsStore.tabs.map(tab => ({
    ...tab,
    label: t(tab.label)
  }))
)

/** 与 vue-router 同步底部高亮（供非 Tab 页或其它逻辑读取 activeName） */
watch(
  () => route.name,
  name => {
    if (name && tabsStore.tabs.some(t => t.name === name)) {
      tabsStore.setActive(String(name))
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="tab-layout">
    <slot />
    <TabBarLayout :tabs="tabsWithLabels" />
  </div>
</template>
