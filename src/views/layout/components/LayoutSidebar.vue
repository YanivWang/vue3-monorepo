<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
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
const appTitle = import.meta.env.VITE_APP_TITLE || 'Enterprise'
</script>

<template>
  <el-aside class="layout-sidebar" :width="props.collapsed ? '64px' : '220px'">
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
      background-color="#001529"
      text-color="#c0cad8"
      active-text-color="#ffffff"
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
  background-color: #001529;
  transition: width 0.3s ease;
}

.sidebar-logo {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  height: $header-height;
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
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }
}

.sidebar-menu {
  flex: 1;
  overflow: hidden auto;
  border-right: none;

  &:not(.el-menu--collapse) {
    width: $sidebar-width;
  }
}
</style>
