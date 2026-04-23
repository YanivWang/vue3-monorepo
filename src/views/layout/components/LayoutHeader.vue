<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Fold, Expand, User, SwitchButton } from '@element-plus/icons-vue'
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

    <!-- 右侧：用户操作区 -->
    <div class="layout-header__right">
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

.sidebar-toggle {
  font-size: 20px;
  color: $text-regular;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $primary-color;
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
