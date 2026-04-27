<script setup lang="ts">
import { Cell, CellGroup, Image as VanImage, Button, showConfirmDialog } from 'vant'
import { PageContainer } from '@vue3-monorepo/shared/components-h5'
import { useUserStore } from '@/stores'
import { useAuth } from '@/composables/useAuth'
import TabLayout from '@/layouts/TabLayout.vue'

defineOptions({ name: 'Mine' })

const user = useUserStore()
const { logout, loading } = useAuth()

async function onLogout() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定退出登录？' })
    await logout()
  } catch {
    /* 用户取消 */
  }
}
</script>

<template>
  <TabLayout>
    <PageContainer title="我的" :left-arrow="false" fill>
      <div class="mine-profile">
        <VanImage
          round
          width="72"
          height="72"
          :src="user.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
        />
        <div class="mine-profile__info">
          <div class="mine-profile__name">{{ user.nickname || '未登录' }}</div>
          <div class="mine-profile__meta">{{ user.username || '-' }}</div>
        </div>
      </div>

      <CellGroup inset title="账户">
        <Cell title="用户名" :value="user.username || '-'" />
        <Cell title="角色" :value="user.roles.join(', ') || '-'" />
        <Cell title="权限数" :value="String(user.permissions.length)" />
      </CellGroup>

      <CellGroup inset title="更多">
        <Cell title="主题设置" is-link to="/theme" />
        <Cell title="长列表" is-link to="/list" />
      </CellGroup>

      <div class="mine-actions">
        <Button v-if="user.isLoggedIn" round block type="danger" :loading="loading" @click="onLogout">
          退出登录
        </Button>
        <Button v-else round block type="primary" @click="$router.push('/login')">去登录</Button>
      </div>
    </PageContainer>
  </TabLayout>
</template>

<style lang="scss" scoped>
.mine-profile {
  display: flex;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-primary);

  &__info {
    flex: 1;
    min-width: 0;
    margin-left: 16px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__meta {
    margin-top: 4px;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.mine-actions {
  padding: 24px 16px;
}
</style>
