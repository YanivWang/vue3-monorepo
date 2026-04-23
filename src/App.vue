<script setup lang="ts">
import { computed } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import enUs from 'element-plus/es/locale/lang/en'
import { useAppStore } from '@/stores/modules/app'
import { i18n } from '@/locales'

const appStore = useAppStore()

/** Element Plus locale 与 appStore.language 真实联动 */
const elLocale = computed(() => (appStore.language === 'zh-CN' ? zhCn : enUs))

/** 初始化主题（从本地存储恢复） */
appStore.setTheme(appStore.themeMode)

/** appStore.language 变更时同步 vue-i18n locale */
const { locale } = i18n.global
locale.value = appStore.language as typeof locale.value
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
