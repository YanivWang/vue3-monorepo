<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Cell, CellGroup, Grid, GridItem, NoticeBar, Button } from 'vant'
import { useRouter } from 'vue-router'
import { PageContainer } from '@vue3-monorepo/shared/components-h5'
import { useUserStore } from '@/stores'
import TabLayout from '@/layouts/TabLayout.vue'

defineOptions({ name: 'Home' })

const { t } = useI18n()
const router = useRouter()
const user = useUserStore()

/** `id` 用于跳转逻辑；`labelKey` 为 i18n key */
const banners = ref([
  { id: 'home', icon: 'home-o', labelKey: 'home.bannerHome' as const },
  { id: 'apps', icon: 'apps-o', labelKey: 'home.bannerApps' as const },
  { id: 'cart', icon: 'cart-o', labelKey: 'home.bannerCart' as const },
  { id: 'gift', icon: 'gift-o', labelKey: 'home.bannerGift' as const },
  { id: 'coupon', icon: 'coupon-o', labelKey: 'home.bannerCoupon' as const },
  { id: 'service', icon: 'chat-o', labelKey: 'home.bannerService' as const },
  { id: 'settings', icon: 'setting-o', labelKey: 'home.bannerSettings' as const },
  { id: 'msg', icon: 'envelop-o', labelKey: 'home.bannerMsg' as const },
])

function onBannerClick(id: string) {
  if (id === 'apps') router.push('/list')
  else if (id === 'settings') router.push('/theme')
}
</script>

<template>
  <TabLayout>
    <PageContainer :title="t('nav.home')" :left-arrow="false" fill>
      <NoticeBar left-icon="volume-o" :scrollable="false" :text="t('home.notice')" />

      <CellGroup inset :title="t('home.currentUser')">
        <Cell :title="t('home.nickname')" :value="user.nickname || t('common.notLoggedIn')" />
        <Cell :title="t('home.role')" :value="user.roles.join(', ') || '-'" />
        <Cell v-if="user.isLoggedIn" :title="t('home.token')" :value="user.token.slice(0, 12) + '...'" />
      </CellGroup>

      <Grid clickable :column-num="4" :border="false" class="home-grid">
        <GridItem v-for="b in banners" :key="b.id" :text="t(b.labelKey)" :icon="b.icon" @click="onBannerClick(b.id)" />
      </Grid>

      <div class="home-actions">
        <Button round block type="primary" @click="router.push('/list')">{{ t('home.viewListDemo') }}</Button>
        <Button round block plain type="primary" class="mt-12" @click="router.push('/theme')">{{
          t('home.goTheme')
        }}</Button>
      </div>
    </PageContainer>
  </TabLayout>
</template>

<style lang="scss" scoped>
.home-grid {
  margin: 12px 0;
}

.home-actions {
  padding: 16px;

  .mt-12 {
    margin-top: 12px;
  }
}
</style>
