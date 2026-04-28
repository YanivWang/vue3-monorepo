<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElAvatar,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElHeader,
  ElIcon,
  ElMessageBox
} from 'element-plus'
import { Fold, Expand, User, SwitchButton, Sunny, Moon, Monitor } from '@element-plus/icons-vue'
import { ThemeMode } from '@vue3-monorepo/shared/enums'
import { brandPalettes, type BrandId } from '@vue3-monorepo/shared/styles/tokens'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const isCollapsed = computed(() => appStore.isCollapsed)
const nickname = computed(() => userStore.nickname || userStore.username)
const avatar = computed(() => userStore.avatar)

function toggleSidebar(): void {
  appStore.toggleSidebar()
}

function handleThemeCommand(cmd: string): void {
  if (cmd === ThemeMode.LIGHT || cmd === ThemeMode.DARK || cmd === ThemeMode.SYSTEM) {
    appStore.setTheme(cmd)
  }
}

function handleBrandCommand(cmd: string): void {
  if (brandPalettes.some(p => p.id === cmd)) {
    appStore.setBrand(cmd as BrandId)
  }
}

async function handleLogout(): Promise<void> {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await userStore.logoutAction()
  router.push('/login')
}
</script>

<template>
  <el-header class="layout-header">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="layout-header__left">
      <el-icon class="sidebar-toggle" @click="toggleSidebar">
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>

      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：品牌色 + 主题 + 用户 -->
    <div class="layout-header__right">
      <el-dropdown trigger="click" @command="handleBrandCommand">
        <span class="theme-switch" title="品牌色">
          <span class="brand-dot" :style="{ background: brandPalettes.find(p => p.id === appStore.brand)?.primary }" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="p in brandPalettes" :key="p.id" :command="p.id">
              <span class="brand-dot brand-dot--menu" :style="{ background: p.primary }" />
              {{ p.id }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown trigger="click" @command="handleThemeCommand">
        <span class="theme-switch" title="主题">
          <el-icon :size="20">
            <Sunny v-if="appStore.themeMode === ThemeMode.LIGHT" />
            <Moon v-else-if="appStore.themeMode === ThemeMode.DARK" />
            <Monitor v-else />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :command="ThemeMode.LIGHT">
              <el-icon class="theme-switch__item-icon"><Sunny /></el-icon>
              浅色
            </el-dropdown-item>
            <el-dropdown-item :command="ThemeMode.DARK">
              <el-icon class="theme-switch__item-icon"><Moon /></el-icon>
              深色
            </el-dropdown-item>
            <el-dropdown-item :command="ThemeMode.SYSTEM">
              <el-icon class="theme-switch__item-icon"><Monitor /></el-icon>
              跟随系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown trigger="click" @command="handleLogout">
        <div class="user-info">
          <el-avatar :size="32" :src="avatar" :icon="User" />
          <span class="user-info__name">{{ nickname }}</span>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="SwitchButton" command="logout"> 退出登录 </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
.layout-header {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 $spacing-lg;
  background-color: $bg-white;
  border-bottom: 1px solid $border-color-light;
  box-shadow: $box-shadow-base;

  &__left {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }

  &__right {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }
}

.sidebar-toggle,
.theme-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $text-regular;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $primary-color;
  }
}

.theme-switch {
  height: 32px;
  padding: 0 $spacing-xs;
  border-radius: $border-radius-medium;

  &:hover {
    background-color: $bg-page;
  }

  &__item-icon {
    margin-right: $spacing-sm;
    vertical-align: middle;
  }
}

.brand-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);

  &--menu {
    margin-right: $spacing-sm;
    vertical-align: middle;
  }
}

.breadcrumb {
  font-size: 14px;
}

.user-info {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  cursor: pointer;
  border-radius: $border-radius-medium;
  transition: $transition-fast;

  &:hover {
    background-color: $bg-page;
  }

  &__name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: $text-regular;
    white-space: nowrap;
  }
}
</style>
