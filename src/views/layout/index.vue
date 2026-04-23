<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutSidebar from './components/LayoutSidebar.vue'
import LayoutMain from './components/LayoutMain.vue'

const appStore = useAppStore()
const isCollapsed = computed(() => appStore.isCollapsed)
</script>

<template>
  <el-container class="layout-wrapper">
    <!-- 侧边栏 -->
    <LayoutSidebar :collapsed="isCollapsed" />

    <el-container
      class="layout-right"
      :class="{ 'layout-right--collapsed': isCollapsed }"
    >
      <!-- 顶部导航 -->
      <LayoutHeader />

      <!-- 主内容区 -->
      <LayoutMain />
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.layout-right {
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  margin-left: $sidebar-width;
  transition: margin-left 0.3s ease;

  &--collapsed {
    margin-left: $sidebar-width-collapsed;
  }
}
</style>
