<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()
const route = useRoute()

const activeMenu = computed(() => route.path)
</script>

<template>
  <el-aside
    class="layout-sidebar"
    :width="props.collapsed ? '64px' : '220px'"
  >
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <img src="/favicon.svg" alt="logo" class="sidebar-logo__img" />
      <transition name="fade">
        <span v-if="!props.collapsed" class="sidebar-logo__title">
          Enterprise
        </span>
      </transition>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="props.collapsed"
      :collapse-transition="false"
      router
      class="sidebar-menu"
      background-color="#001529"
      text-color="#c0cad8"
      active-text-color="#ffffff"
    >
      <el-menu-item index="/home">
        <el-icon><HomeFilled /></el-icon>
        <template #title>首页</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
.layout-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: #001529;
  overflow: hidden;
  transition: width 0.3s ease;
  z-index: $z-index-fixed;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: 0 $spacing-md;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  white-space: nowrap;

  &__img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: none;

  &:not(.el-menu--collapse) {
    width: $sidebar-width;
  }
}
</style>
