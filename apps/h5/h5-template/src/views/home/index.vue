<script setup lang="ts">
import { ref } from 'vue'
import { Cell, CellGroup, Grid, GridItem, NoticeBar, Button } from 'vant'
import { useRouter } from 'vue-router'
import { PageContainer } from '@vue3-mono/shared/components-h5'
import { useUserStore } from '@/stores'
import TabLayout from '@/layouts/TabLayout.vue'

defineOptions({ name: 'Home' })

const router = useRouter()
const user = useUserStore()

const banners = ref([
  { icon: 'home-o', label: '首页' },
  { icon: 'apps-o', label: '应用' },
  { icon: 'cart-o', label: '购物车' },
  { icon: 'gift-o', label: '礼品' },
  { icon: 'coupon-o', label: '优惠券' },
  { icon: 'chat-o', label: '客服' },
  { icon: 'setting-o', label: '设置' },
  { icon: 'envelop-o', label: '消息' }
])

function onClick(label: string) {
  if (label === '应用') router.push('/list')
  else if (label === '设置') router.push('/theme')
}
</script>

<template>
  <TabLayout>
    <PageContainer title="首页" :left-arrow="false" fill>
      <NoticeBar
        left-icon="volume-o"
        :scrollable="false"
        text="欢迎使用 Vue3 Monorepo H5 模板 —— 支持浏览器 / 小程序 / APP 多宿主"
      />

      <CellGroup inset title="当前用户">
        <Cell title="昵称" :value="user.nickname || '未登录'" />
        <Cell title="角色" :value="user.roles.join(', ') || '-'" />
        <Cell v-if="user.isLoggedIn" title="Token" :value="user.token.slice(0, 12) + '...'" />
      </CellGroup>

      <Grid clickable :column-num="4" :border="false" class="home-grid">
        <GridItem v-for="b in banners" :key="b.label" :text="b.label" :icon="b.icon" @click="onClick(b.label)" />
      </Grid>

      <div class="home-actions">
        <Button round block type="primary" @click="router.push('/list')"> 查看长列表 Demo </Button>
        <Button round block plain type="primary" class="mt-12" @click="router.push('/theme')"> 主题切换 </Button>
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
