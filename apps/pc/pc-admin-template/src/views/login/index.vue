<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMessage
} from 'element-plus'
import { User, Lock, Sunny, Moon, Monitor } from '@element-plus/icons-vue'
import { ThemeMode } from '@vue3-monorepo/shared/enums'
import { brandPalettes, type BrandId } from '@vue3-monorepo/shared/styles/tokens'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'
import type { LoginParams } from '@vue3-monorepo/shared/types'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref<boolean>(false)

const formData = reactive<LoginParams>({
  username: '',
  password: ''
})

const rules: FormRules<LoginParams> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度 6-30 个字符', trigger: 'blur' }
  ]
}

async function handleLogin(): Promise<void> {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.loginAction(formData)
    ElMessage.success('登录成功')

    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}

function handleThemeCommand(cmd: string): void {
  if (cmd === ThemeMode.LIGHT || cmd === ThemeMode.DARK || cmd === ThemeMode.SYSTEM) {
    appStore.setTheme(cmd)
  }
}

function handleBrandCommand(cmd: string): void {
  if (brandPalettes.some(p => p.id === cmd)) {
    appStore.setBrand(cmd as BrandId)
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__top-actions">
      <el-dropdown trigger="click" @command="handleBrandCommand">
        <span class="login-page__theme-trigger" title="品牌色">
          <span
            class="login-page__brand-dot"
            :style="{ background: brandPalettes.find(p => p.id === appStore.brand)?.primary }"
          />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="p in brandPalettes" :key="p.id" :command="p.id">
              <span class="login-page__brand-dot login-page__brand-dot--menu" :style="{ background: p.primary }" />
              {{ p.id }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown trigger="click" @command="handleThemeCommand">
        <span class="login-page__theme-trigger" title="主题">
          <el-icon :size="22">
            <Sunny v-if="appStore.themeMode === ThemeMode.LIGHT" />
            <Moon v-else-if="appStore.themeMode === ThemeMode.DARK" />
            <Monitor v-else />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :command="ThemeMode.LIGHT">
              <el-icon class="login-page__theme-icon"><Sunny /></el-icon>
              浅色
            </el-dropdown-item>
            <el-dropdown-item :command="ThemeMode.DARK">
              <el-icon class="login-page__theme-icon"><Moon /></el-icon>
              深色
            </el-dropdown-item>
            <el-dropdown-item :command="ThemeMode.SYSTEM">
              <el-icon class="login-page__theme-icon"><Monitor /></el-icon>
              跟随系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="login-card">
      <!-- 标题 -->
      <div class="login-card__header">
        <img src="/favicon.svg" alt="logo" class="login-card__logo" />
        <h1 class="login-card__title">vue3-monorepo</h1>
        <p class="login-card__subtitle">企业级管理系统</p>
      </div>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="large"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-card__tip">演示账号：admin / 123456</p>
      <p class="login-card__links">
        <router-link to="/register">注册</router-link>
        <span class="login-card__sep">·</span>
        <router-link to="/forgot-password">忘记密码</router-link>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%);

  &__top-actions {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    z-index: 1;
    display: flex;
    gap: $spacing-sm;
    align-items: center;
  }

  &__brand-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);

    &--menu {
      margin-right: $spacing-sm;
      vertical-align: middle;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
    }
  }

  &__theme-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-sm;
    color: rgba(255, 255, 255, 0.92);
    cursor: pointer;
    background: rgba(0, 0, 0, 0.15);
    border-radius: $radius-medium;
    transition: $transition-fast;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  }

  &__theme-icon {
    margin-right: $spacing-sm;
    vertical-align: middle;
  }
}

.login-card {
  width: 420px;
  padding: $spacing-xl * 1.5;
  background: var(--color-bg-surface);
  border-radius: $radius-large * 2;
  box-shadow: var(--shadow-medium);

  &__header {
    margin-bottom: $spacing-xl;
    text-align: center;
  }

  &__logo {
    width: 60px;
    height: 60px;
    margin: 0 auto $spacing-md;
  }

  &__title {
    margin-bottom: $spacing-xs;
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__tip {
    margin-top: $spacing-md;
    font-size: 12px;
    color: var(--color-text-placeholder);
    text-align: center;
  }

  &__links {
    margin-top: $spacing-sm;
    font-size: 13px;
    text-align: center;

    a {
      color: var(--color-primary);
    }
  }

  &__sep {
    margin: 0 8px;
    color: var(--color-text-placeholder);
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-lg;
  }
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  letter-spacing: 2px;
}
</style>
