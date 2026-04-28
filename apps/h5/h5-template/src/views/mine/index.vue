<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Cell, CellGroup, Image as VanImage, Button, showConfirmDialog } from 'vant'
import { PageContainer } from '@vue3-monorepo/shared/components-h5'
import { useUserStore } from '@/stores'
import { useAuth } from '@/composables/useAuth'
import TabLayout from '@/layouts/TabLayout.vue'

defineOptions({ name: 'Mine' })

const { t } = useI18n()
const user = useUserStore()
const { logout, loading } = useAuth()

async function onLogout() {
  try {
    await showConfirmDialog({ title: t('common.tip'), message: t('mine.logoutConfirm') })
    await logout()
  } catch {
    /* 用户取消 */
  }
}
</script>

<template>
  <TabLayout>
    <PageContainer :title="t('nav.mine')" :left-arrow="false" fill>
      <div class="mine-profile">
        <VanImage
          round
          width="72"
          height="72"
          :src="user.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
        />
        <div class="mine-profile__info">
          <div class="mine-profile__name">
            {{ user.isLoggedIn ? user.nickname || user.username || '-' : t('common.notLoggedIn') }}
          </div>
          <div class="mine-profile__meta">{{ user.username || '-' }}</div>
        </div>
      </div>

      <CellGroup inset :title="t('mine.account')">
        <Cell :title="t('mine.username')" :value="user.username || '-'" />
        <Cell :title="t('mine.role')" :value="user.roles.join(', ') || '-'" />
        <Cell :title="t('mine.permissionCount')" :value="String(user.permissions.length)" />
      </CellGroup>

      <CellGroup inset :title="t('mine.more')">
        <Cell :title="t('mine.themeSettings')" is-link to="/theme" />
        <Cell :title="t('mine.listLink')" is-link to="/list" />
      </CellGroup>

      <div class="mine-actions">
        <Button v-if="user.isLoggedIn" round block type="danger" :loading="loading" @click="onLogout">
          {{ t('common.logout') }}
        </Button>
        <Button v-else round block type="primary" @click="$router.push('/login')">{{ t('common.goLogin') }}</Button>
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
