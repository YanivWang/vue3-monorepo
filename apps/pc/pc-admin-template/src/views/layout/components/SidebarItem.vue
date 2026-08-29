<script setup lang="ts">
import { ElIcon, ElMenuItem, ElSubMenu } from 'element-plus'
import type { MenuRoute } from '@vue3-monorepo/shared/types'

interface Props {
  menu: MenuRoute
  isCollapsed: boolean
}

const props = defineProps<Props>()

/** 只有一个可见子菜单时，是否直接展开（省略一层目录） */
const visibleChildren = props.menu.children?.filter((c) => !c.meta?.hidden) ?? []
const isSingleChild = !props.menu.meta?.alwaysShow && visibleChildren.length === 1

/** 当只有一个子菜单时，直接渲染子菜单 */
const singleChild = isSingleChild ? visibleChildren[0] : null
</script>

<template>
  <!-- 叶子节点：直接渲染菜单项 -->
  <template v-if="!menu.children?.length || (isSingleChild && singleChild)">
    <el-menu-item :index="singleChild ? singleChild.path : menu.path">
      <el-icon v-if="singleChild ? singleChild.meta?.icon : menu.meta?.icon">
        <component :is="singleChild ? singleChild.meta?.icon : menu.meta?.icon" />
      </el-icon>
      <template #title>
        {{ singleChild ? singleChild.meta?.title : menu.meta?.title }}
      </template>
    </el-menu-item>
  </template>

  <!-- 有多个子菜单：渲染 sub-menu -->
  <el-sub-menu v-else :index="menu.path">
    <template #title>
      <el-icon v-if="menu.meta?.icon">
        <component :is="menu.meta.icon" />
      </el-icon>
      <span>{{ menu.meta?.title }}</span>
    </template>

    <template v-for="child in visibleChildren" :key="child.id">
      <SidebarItem :menu="child" :is-collapsed="isCollapsed" />
    </template>
  </el-sub-menu>
</template>
