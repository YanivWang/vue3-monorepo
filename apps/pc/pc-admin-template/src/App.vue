<script setup lang="ts">
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import enUs from 'element-plus/es/locale/lang/en'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

/** Element Plus locale 与 appStore.language 真实联动 */
const elLocale = computed(() => (appStore.language === 'zh-CN' ? zhCn : enUs))

/** 从本地存储恢复主题 / 品牌 / 语言并同步 DOM */
appStore.init()
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
