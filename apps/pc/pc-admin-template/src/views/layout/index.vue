<script setup lang="ts">
import { computed } from 'vue'
import { ElContainer } from 'element-plus'
import { useAppStore } from '@/stores/modules/app'
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutSidebar from './components/LayoutSidebar.vue'
import LayoutTabs from './components/LayoutTabs.vue'
import LayoutMain from './components/LayoutMain.vue'

const appStore = useAppStore()
const isCollapsed = computed(() => appStore.isCollapsed)
</script>

<template>
  <el-container class="layout-wrapper">
    <!-- 侧边栏（单源驱动：菜单完全来自 permissionStore.menus） -->
    <LayoutSidebar :collapsed="isCollapsed" />

    <el-container class="layout-right" :class="{ 'layout-right--collapsed': isCollapsed }">
      <!-- 顶部导航 -->
      <LayoutHeader />

      <!-- Tab 标签栏 -->
      <LayoutTabs />

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
  margin-left: $sidebar-width;
  overflow: hidden;
  transition: margin-left 0.3s ease;

  &--collapsed {
    margin-left: $sidebar-width-collapsed;
  }
}
</style>
