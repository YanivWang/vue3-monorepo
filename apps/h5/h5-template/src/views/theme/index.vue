<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CellGroup, Cell, RadioGroup, Radio, Tag } from 'vant'
import { PageContainer } from '@vue3-monorepo/shared/components-h5'
import { ThemeMode as ThemeModeEnum } from '@vue3-monorepo/shared/enums'
import { brandPalettes, type BrandId, type ThemeModeId } from '@vue3-monorepo/shared/styles/tokens'
import { useAppStore } from '@/stores'
import { getLocale, BASE_LOCALES, type BaseLocale } from '@/composables/useI18n'
import TabLayout from '@/layouts/TabLayout.vue'

defineOptions({ name: 'Theme' })

const { t } = useI18n()
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
    void app.setLanguage(v)
  }
})
</script>

<template>
  <TabLayout>
    <PageContainer :title="t('nav.theme')" :left-arrow="false" fill>
      <CellGroup inset :title="t('theme.brand')">
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

      <CellGroup inset :title="t('theme.sectionMode')">
        <RadioGroup v-model="mode">
          <Cell clickable :title="t('theme.light')" @click="mode = ThemeModeEnum.LIGHT">
            <template #right-icon>
              <Radio :name="ThemeModeEnum.LIGHT" />
            </template>
          </Cell>
          <Cell clickable :title="t('theme.dark')" @click="mode = ThemeModeEnum.DARK">
            <template #right-icon>
              <Radio :name="ThemeModeEnum.DARK" />
            </template>
          </Cell>
          <Cell clickable :title="t('theme.system')" @click="mode = ThemeModeEnum.SYSTEM">
            <template #right-icon>
              <Radio :name="ThemeModeEnum.SYSTEM" />
            </template>
          </Cell>
        </RadioGroup>
      </CellGroup>

      <CellGroup inset :title="t('theme.sectionLanguage')">
        <RadioGroup v-model="language">
          <Cell
            v-for="l in BASE_LOCALES"
            :key="l"
            clickable
            :title="l === 'zh-CN' ? t('theme.langZh') : t('theme.langEn')"
            @click="language = l"
          >
            <template #right-icon>
              <Radio :name="l" />
            </template>
          </Cell>
        </RadioGroup>
      </CellGroup>

      <CellGroup inset :title="t('theme.sectionCurrent')">
        <Cell :title="t('theme.statusHost')"
          ><Tag plain type="primary">{{ app.host }}</Tag></Cell
        >
        <Cell :title="t('theme.statusBrand')"
          ><Tag plain type="primary">{{ app.brand }}</Tag></Cell
        >
        <Cell :title="t('theme.statusMode')"
          ><Tag plain type="primary">{{ app.themeMode }}</Tag></Cell
        >
        <Cell :title="t('theme.statusLanguage')"
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
