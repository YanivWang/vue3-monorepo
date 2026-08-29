<script setup lang="ts">
import { computed } from 'vue'
import { ElMain } from 'element-plus'
import { useTabsStore } from '@/stores/modules/tabs'

const tabsStore = useTabsStore()

/** 从 tabs 中收集需要缓存的路由名称 */
const keepAliveNames = computed<string[]>(() => tabsStore.tabs.filter((t) => t.keepAlive && t.name).map((t) => t.name))
</script>

<template>
  <el-main class="layout-main">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <keep-alive :include="keepAliveNames">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<style lang="scss" scoped>
.layout-main {
  flex: 1;
  padding: $spacing-lg;
  overflow: hidden auto;
  background-color: var(--color-bg-page);
}
</style>
