<script setup lang="ts">
import { computed } from 'vue'
import { ElAside, ElMenu } from 'element-plus'
import { useRoute } from 'vue-router'
import { layoutTokens } from '@vue3-monorepo/shared/styles/tokens'
import { usePermissionStore } from '@/stores/modules/permission'
import SidebarItem from './SidebarItem.vue'

interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()
const route = useRoute()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => route.path)
const menus = computed(() => permissionStore.menus.filter(m => !m.meta?.hidden))
const appTitle = import.meta.env.VITE_APP_TITLE || 'vue3-monorepo'
const sidebarWidth = computed(() => (props.collapsed ? layoutTokens.sidebarWidthCollapsed : layoutTokens.sidebarWidth))
</script>

<template>
  <el-aside class="layout-sidebar" :width="sidebarWidth">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <img src="/favicon.svg" alt="logo" class="sidebar-logo__img" />
      <transition name="fade">
        <span v-if="!props.collapsed" class="sidebar-logo__title">{{ appTitle }}</span>
      </transition>
    </div>

    <!-- 由 permissionStore.menus 动态渲染，不再手写菜单项 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="props.collapsed"
      :collapse-transition="false"
      router
      class="sidebar-menu"
      background-color="var(--layout-sidebar-bg)"
      text-color="var(--layout-sidebar-text)"
      active-text-color="var(--layout-sidebar-text-active)"
    >
      <template v-for="menu in menus" :key="menu.id">
        <SidebarItem :menu="menu" :is-collapsed="props.collapsed" />
      </template>
    </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
.layout-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-index-fixed;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--layout-sidebar-bg);
  transition: width 0.3s ease;
}

.sidebar-logo {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  height: $layout-header-height;
  padding: 0 $spacing-md;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &__img {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: var(--layout-sidebar-text-active);
  }
}

.sidebar-menu {
  flex: 1;
  overflow: hidden auto;
  border-right: none;

  &:not(.el-menu--collapse) {
    width: $layout-sidebar-width;
  }
}
</style>
