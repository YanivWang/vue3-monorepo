<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/modules/tabs'
import { TabAction } from '@/enums'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed(() => tabsStore.activeTab)

function handleTabClick(pane: { paneName?: string | number }): void {
  const path = pane.paneName as string
  if (path !== route.fullPath) {
    router.push(path)
  }
}

function handleTabRemove(path: string): void {
  const nextPath = tabsStore.removeTab(path)
  if (path === route.fullPath) {
    router.push(nextPath)
  }
}

function handleContextMenu(action: TabAction, path: string): void {
  switch (action) {
    case TabAction.CLOSE:
      handleTabRemove(path)
      break
    case TabAction.CLOSE_OTHERS:
      tabsStore.removeOtherTabs(path)
      if (route.fullPath !== path) router.push(path)
      break
    case TabAction.CLOSE_ALL: {
      const nextPath = tabsStore.removeAllTabs()
      router.push(nextPath)
      break
    }
    case TabAction.REFRESH:
      // 通过 key 切换触发重渲染（借助 keep-alive 外层）
      router.replace({ path: '/redirect' + path })
      break
  }
}
</script>

<template>
  <div class="layout-tabs">
    <el-tabs
      :model-value="activeTab"
      type="card"
      class="tabs-bar"
      @tab-click="handleTabClick"
      @tab-remove="(name: string | number) => handleTabRemove(name as string)"
    >
      <el-tab-pane v-for="tab in tabs" :key="tab.path" :label="tab.title" :name="tab.path" :closable="!tab.affix">
        <template #label>
          <el-dropdown trigger="contextmenu" @command="(action: TabAction) => handleContextMenu(action, tab.path)">
            <span class="tab-label">
              <el-icon v-if="tab.icon" class="tab-label__icon">
                <component :is="tab.icon" />
              </el-icon>
              {{ tab.title }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="TabAction.REFRESH" :icon="'RefreshRight'">
                  {{ $t('tabs.refresh') }}
                </el-dropdown-item>
                <el-dropdown-item v-if="!tab.affix" :command="TabAction.CLOSE" :icon="'Close'" divided>
                  {{ $t('tabs.close') }}
                </el-dropdown-item>
                <el-dropdown-item :command="TabAction.CLOSE_OTHERS" :icon="'SemiSelect'">
                  {{ $t('tabs.closeOthers') }}
                </el-dropdown-item>
                <el-dropdown-item :command="TabAction.CLOSE_ALL" :icon="'CircleClose'">
                  {{ $t('tabs.closeAll') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.layout-tabs {
  height: 40px;
  padding: 0 $spacing-md;
  background-color: $bg-white;
  border-bottom: 1px solid $border-color-light;

  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: none;
  }

  :deep(.el-tabs__nav) {
    border: none;
  }

  :deep(.el-tabs__item) {
    height: 36px;
    margin-right: 4px;
    line-height: 36px;
    border: 1px solid $border-color-light !important;
    border-radius: $border-radius-base;
    transition: $transition-fast;

    &.is-active {
      color: $primary-color;
      background-color: rgba(64, 158, 255, 0.1);
      border-color: $primary-color !important;
    }

    &:hover {
      color: $primary-color;
    }
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
}

.tab-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 13px;

  &__icon {
    font-size: 14px;
  }
}
</style>
