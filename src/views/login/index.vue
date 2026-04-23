<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import type { LoginParams } from '@/types/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref<boolean>(false)

const formData = reactive<LoginParams>({
  username: '',
  password: '',
})

const rules: FormRules<LoginParams> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度 6-30 个字符', trigger: 'blur' },
  ],
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
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 标题 -->
      <div class="login-card__header">
        <img src="/favicon.svg" alt="logo" class="login-card__logo" />
        <h1 class="login-card__title">Vue3 Enterprise</h1>
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
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-card__tip">
        演示账号：admin / 123456
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-card {
  width: 420px;
  padding: $spacing-xl * 1.5;
  background: $bg-white;
  border-radius: $border-radius-large * 2;
  box-shadow: $box-shadow-dark;

  &__header {
    text-align: center;
    margin-bottom: $spacing-xl;
  }

  &__logo {
    width: 60px;
    height: 60px;
    margin: 0 auto $spacing-md;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  &__subtitle {
    font-size: 14px;
    color: $text-secondary;
  }

  &__tip {
    text-align: center;
    font-size: 12px;
    color: $text-placeholder;
    margin-top: $spacing-md;
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
