<script setup lang="ts">
import { onMounted } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()
const locale = zhCn

onMounted(() => {
  // 初始化主题（从本地存储恢复）
  appStore.setTheme(appStore.themeMode)
})
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>
