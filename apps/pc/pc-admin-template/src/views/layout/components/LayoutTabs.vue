<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon } from 'element-plus'
import { useTabsStore } from '@/stores/modules/tabs'
import { TabAction } from '@vue3-mono/shared'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const scrollRef = ref<HTMLElement>()

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed(() => tabsStore.activeTab)

function handleTabClick(path: string): void {
  if (path !== route.fullPath) {
    router.push(path)
  }
}

function handleTabClose(e: MouseEvent, path: string): void {
  e.stopPropagation()
  const nextPath = tabsStore.removeTab(path)
  if (path === route.fullPath) {
    router.push(nextPath)
  }
}

function handleContextMenu(action: TabAction, path: string): void {
  switch (action) {
    case TabAction.CLOSE:
      handleTabClose(new MouseEvent('click'), path)
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
      router.replace({ path: '/redirect' + path })
      break
  }
}

/** 激活 tab 变化时，自动滚动使其可见 */
watch(activeTab, async () => {
  await nextTick()
  const el = scrollRef.value?.querySelector('.tab-item--active') as HTMLElement
  el?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' })
})
</script>

<template>
  <div class="layout-tabs">
    <!-- 可横向滚动的标签列表 -->
    <div ref="scrollRef" class="tabs-scroll">
      <el-dropdown
        v-for="tab in tabs"
        :key="tab.path"
        trigger="contextmenu"
        @command="(action: TabAction) => handleContextMenu(action, tab.path)"
      >
        <div
          class="tab-item"
          :class="{ 'tab-item--active': tab.path === activeTab, 'tab-item--affix': tab.affix }"
          @click="handleTabClick(tab.path)"
        >
          <el-icon v-if="tab.icon" class="tab-item__icon">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-item__title">{{ tab.title }}</span>
          <el-icon v-if="!tab.affix" class="tab-item__close" @click.stop="handleTabClose($event, tab.path)">
            <Close />
          </el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :command="TabAction.REFRESH">
              <el-icon><RefreshRight /></el-icon> {{ $t('tabs.refresh') }}
            </el-dropdown-item>
            <el-dropdown-item v-if="!tab.affix" :command="TabAction.CLOSE" divided>
              <el-icon><Close /></el-icon> {{ $t('tabs.close') }}
            </el-dropdown-item>
            <el-dropdown-item :command="TabAction.CLOSE_OTHERS">
              <el-icon><SemiSelect /></el-icon> {{ $t('tabs.closeOthers') }}
            </el-dropdown-item>
            <el-dropdown-item :command="TabAction.CLOSE_ALL">
              <el-icon><CircleClose /></el-icon> {{ $t('tabs.closeAll') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color' as color;

.layout-tabs {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 $spacing-md;
  background-color: $bg-white;
  border-bottom: 1px solid $border-color-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.tabs-scroll {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  height: 100%;
  overflow: auto hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-item {
  display: inline-flex;
  flex-shrink: 0;
  gap: 5px;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  font-size: 13px;
  color: $text-regular;
  cursor: pointer;
  user-select: none;
  background-color: #f0f2f5;
  border-radius: 4px;
  transition: all 0.18s ease;

  &:hover {
    color: $primary-color;
    background-color: rgba(64, 158, 255, 0.08);

    .tab-item__close {
      opacity: 1;
    }
  }

  &--active {
    color: #fff;
    background-color: $primary-color;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);

    &:hover {
      color: #fff;
      background-color: color.adjust($primary-color, $lightness: -6%);
    }

    .tab-item__close {
      color: rgba(255, 255, 255, 0.8);
      opacity: 1;

      &:hover {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  &__icon {
    font-size: 13px;
    opacity: 0.85;
  }

  &__title {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
    white-space: nowrap;
  }

  &__close {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    font-size: 11px;
    border-radius: 3px;
    opacity: 0;
    transition: all 0.15s ease;

    &:hover {
      color: $danger-color;
      background-color: rgba($danger-color, 0.12);
    }
  }
}
</style>
