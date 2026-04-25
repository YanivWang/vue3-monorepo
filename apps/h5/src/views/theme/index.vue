<script setup lang="ts">
import { computed } from 'vue'
import { CellGroup, Cell, RadioGroup, Radio, Tag } from 'vant'
import { PageContainer } from '@vue3-mono/components-h5'
import { brandPalettes, ThemeMode as ThemeModeEnum, type BrandId, type ThemeModeId } from '@vue3-mono/shared'
import { useAppStore } from '@/stores'
import { setLocale, getLocale, BASE_LOCALES, type BaseLocale } from '@/composables/useI18n'
import TabLayout from '@/layouts/TabLayout.vue'

defineOptions({ name: 'Theme' })

const app = useAppStore()

const brand = computed({
  get: () => app.brand,
  set: (v: BrandId) => app.setBrand(v)
})

const mode = computed({
  get: () => app.themeMode,
  set: (v: ThemeModeId) => app.setTheme(v)
})

const language = computed({
  get: () => getLocale() as BaseLocale,
  set: (v: BaseLocale) => {
    setLocale(v)
    app.setLanguage(v)
  }
})
</script>

<template>
  <TabLayout>
    <PageContainer title="主题" :left-arrow="false" fill>
      <CellGroup inset title="品牌色">
        <RadioGroup v-model="brand" class="brand-group">
          <Cell v-for="p in brandPalettes" :key="p.id" clickable :title="p.id" @click="brand = p.id">
            <template #icon>
              <span class="brand-dot" :style="{ background: p.primary }" />
            </template>
            <template #right-icon>
              <Radio :name="p.id" />
            </template>
          </Cell>
        </RadioGroup>
      </CellGroup>

      <CellGroup inset title="模式">
        <RadioGroup v-model="mode">
          <Cell clickable title="浅色" @click="mode = ThemeModeEnum.LIGHT">
            <template #right-icon>
              <Radio :name="ThemeModeEnum.LIGHT" />
            </template>
          </Cell>
          <Cell clickable title="深色" @click="mode = ThemeModeEnum.DARK">
            <template #right-icon>
              <Radio :name="ThemeModeEnum.DARK" />
            </template>
          </Cell>
          <Cell clickable title="跟随系统" @click="mode = ThemeModeEnum.SYSTEM">
            <template #right-icon>
              <Radio :name="ThemeModeEnum.SYSTEM" />
            </template>
          </Cell>
        </RadioGroup>
      </CellGroup>

      <CellGroup inset title="语言">
        <RadioGroup v-model="language">
          <Cell
            v-for="l in BASE_LOCALES"
            :key="l"
            clickable
            :title="l === 'zh-CN' ? '简体中文' : 'English'"
            @click="language = l"
          >
            <template #right-icon>
              <Radio :name="l" />
            </template>
          </Cell>
        </RadioGroup>
      </CellGroup>

      <CellGroup inset title="当前状态">
        <Cell title="宿主"
          ><Tag plain type="primary">{{ app.host }}</Tag></Cell
        >
        <Cell title="品牌"
          ><Tag plain type="primary">{{ app.brand }}</Tag></Cell
        >
        <Cell title="模式"
          ><Tag plain type="primary">{{ app.themeMode }}</Tag></Cell
        >
        <Cell title="语言"
          ><Tag plain type="primary">{{ app.language }}</Tag></Cell
        >
      </CellGroup>
    </PageContainer>
  </TabLayout>
</template>

<style lang="scss" scoped>
.brand-dot {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  vertical-align: middle;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
}
</style>
