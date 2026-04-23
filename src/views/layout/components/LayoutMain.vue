<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// keep-alive 缓存名称列表
const keepAliveNames = computed<string[]>(() => {
  return [route.name as string].filter(
    (name) => name && route.meta.keepAlive,
  )
})
</script>

<template>
  <el-main class="layout-main">
    <router-view v-slot="{ Component, route: currentRoute }">
      <transition name="page" mode="out-in">
        <keep-alive :include="keepAliveNames">
          <component :is="Component" :key="currentRoute.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<style lang="scss" scoped>
.layout-main {
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: $bg-page;
  margin-top: $header-height;
}
</style>
