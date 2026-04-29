<script setup lang="ts">
import { watch, shallowRef } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

appStore.init()

const elLocale = shallowRef(
  (
    await (appStore.language === 'zh-CN'
      ? import('element-plus/es/locale/lang/zh-cn')
      : import('element-plus/es/locale/lang/en'))
  ).default
)

watch(
  () => appStore.language,
  async lang => {
    elLocale.value = (
      await (lang === 'zh-CN' ? import('element-plus/es/locale/lang/zh-cn') : import('element-plus/es/locale/lang/en'))
    ).default
  }
)
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
