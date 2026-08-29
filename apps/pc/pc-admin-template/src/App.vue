<script setup lang="ts">
import { watch, shallowRef } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

appStore.init()

function elementLocaleFor(lang: string) {
  return lang === 'zh-CN' ? zhCn : en
}

const elLocale = shallowRef(elementLocaleFor(appStore.language))

watch(
  () => appStore.language,
  (lang) => {
    elLocale.value = elementLocaleFor(lang)
  },
)
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
