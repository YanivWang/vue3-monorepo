<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import type { Component } from 'vue'
import { useNow, useDateFormat } from '@vueuse/core'
import { ElCard, ElCol, ElIcon, ElRow, ElTag } from 'element-plus'
import { DataLine, User, Tickets, Setting } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const nickname = computed(() => userStore.nickname || userStore.username || '管理员')

// 实时时钟（@vueuse/core 响应式）
const now = useNow()
const formattedTime = useDateFormat(now, 'YYYY-MM-DD HH:mm:ss')

interface StatCard {
  title: string
  value: number
  unit: string
  icon: Component
  tone: 'primary' | 'success' | 'warning' | 'info'
  trend: number
}

const statCards = ref<StatCard[]>([
  { title: '今日访问', value: 1024, unit: '次', icon: markRaw(DataLine), tone: 'primary', trend: 12.5 },
  { title: '用户总数', value: 8848, unit: '人', icon: markRaw(User), tone: 'success', trend: 3.2 },
  { title: '待处理工单', value: 36, unit: '条', icon: markRaw(Tickets), tone: 'warning', trend: -5.1 },
  { title: '系统配置', value: 128, unit: '项', icon: markRaw(Setting), tone: 'info', trend: 0 },
])

const techList = [
  'Vue 3.4',
  'Vite 5',
  'TypeScript 5',
  'Pinia',
  'Vue Router 4',
  'Element Plus',
  'Axios',
  '@VueUse',
  'Sass',
  'dayjs',
  'lodash-es',
  'js-cookie',
]
</script>

<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-card__inner">
        <div>
          <h2 class="welcome-title">欢迎回来，{{ nickname }} 👋</h2>
          <p class="welcome-time">{{ formattedTime }}</p>
        </div>
        <img src="/favicon.svg" alt="welcome" class="welcome-card__img" />
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.title" :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-card__inner">
            <div class="stat-card__info">
              <p class="stat-card__title">{{ card.title }}</p>
              <div class="stat-card__value">
                <span class="stat-card__num">{{ card.value.toLocaleString() }}</span>
                <span class="stat-card__unit">{{ card.unit }}</span>
              </div>
              <div
                class="stat-card__trend"
                :class="card.trend > 0 ? 'trend-up' : card.trend < 0 ? 'trend-down' : 'trend-flat'"
              >
                <span v-if="card.trend !== 0">
                  {{ card.trend > 0 ? '↑' : '↓' }}
                  {{ Math.abs(card.trend) }}%
                </span>
                <span v-else>持平</span>
                <span class="trend-label">较昨日</span>
              </div>
            </div>
            <el-icon class="stat-card__icon" :class="`stat-card__icon--${card.tone}`">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <p v-permission="'admin'" class="perm-hint">
      当前账号拥有 <code>admin</code> 权限，若移除该权限则本行由 v-permission 隐藏。
    </p>

    <!-- 技术栈信息 -->
    <el-card class="tech-card" shadow="never">
      <template #header>
        <span class="tech-card__title">项目技术栈</span>
      </template>
      <div class="tech-list">
        <el-tag v-for="tech in techList" :key="tech" effect="light" class="tech-tag">
          {{ tech }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.welcome-card {
  background: linear-gradient(135deg, var(--color-primary-a15) 0%, var(--color-primary-a7) 100%);
  border: 1px solid var(--color-primary-border);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__img {
    width: 72px;
    height: 72px;
    opacity: 0.5;
  }
}

.welcome-title {
  margin-bottom: $spacing-sm;
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.welcome-time {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.perm-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  code {
    padding: 2px 6px;
    background: var(--color-bg-page);
    border-radius: 4px;
  }
}

.stat-card {
  margin-bottom: 0;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin-bottom: $spacing-sm;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__value {
    display: flex;
    gap: $spacing-xs;
    align-items: baseline;
    margin-bottom: $spacing-xs;
  }

  &__num {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: var(--color-text-primary);
  }

  &__unit {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__trend {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;

    &.trend-up {
      color: var(--color-success);
    }
    &.trend-down {
      color: var(--color-danger);
    }
    &.trend-flat {
      color: var(--color-text-placeholder);
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    font-size: 24px;
    border-radius: 12px;

    &--primary {
      color: var(--color-primary);
      background-color: var(--color-primary-a15);
    }

    &--success {
      color: var(--color-success);
      background-color: color-mix(in sRGB, var(--color-success) 15%, transparent);
    }

    &--warning {
      color: var(--color-warning);
      background-color: color-mix(in sRGB, var(--color-warning) 15%, transparent);
    }

    &--info {
      color: var(--color-info);
      background-color: color-mix(in sRGB, var(--color-info) 15%, transparent);
    }
  }
}

.trend-label {
  color: var(--color-text-placeholder);
}

.tech-card {
  &__title {
    font-size: 15px;
    font-weight: 600;
  }
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.tech-tag {
  font-size: 13px;
  cursor: default;
}
</style>
