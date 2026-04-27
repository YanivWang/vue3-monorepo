<script setup lang="ts">
import { ref, computed } from 'vue'
import { Form, Field, CellGroup, Button, Toast, Tabs, Tab, showToast } from 'vant'
import { H5Host } from '@vue3-monorepo/shared/enums'
import { useBridge } from '@vue3-monorepo/shared/bridge'
import { useSmsCodeGate } from '@vue3-monorepo/shared/hooks-h5'
import { useAuth } from '@/composables/useAuth'
import { loginApi } from '@/api/user'
import { PageContainer } from '@vue3-monorepo/shared/components-h5'

defineOptions({ name: 'Login' })

const bridge = useBridge()
const { loading, loginAuto, loginByBridge, loginBySms } = useAuth()

const loginTab = ref<'account' | 'sms'>('account')

const form = ref({ username: '', password: '' })
const smsForm = ref({ phone: '', code: '' })

const smsGate = useSmsCodeGate(60)
const smsRemaining = smsGate.remaining

/** 与 `mock/user.ts` 一致；仅开发 + 启用 vite-plugin-mock 时展示 */
const showMockHint = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

const hostLabel = computed(() => {
  switch (bridge.host) {
    case H5Host.WECHAT_MINI:
      return '微信小程序'
    case H5Host.ALIPAY_MINI:
      return '支付宝小程序'
    case H5Host.NATIVE_APP:
      return '原生 App'
    default:
      return '浏览器'
  }
})

async function onSubmitAccount() {
  try {
    await loginAuto(form.value)
  } catch (e) {
    Toast.fail((e as Error)?.message ?? '登录失败')
  }
}

async function onSubmitSms() {
  try {
    await loginBySms({ phone: smsForm.value.phone, code: smsForm.value.code })
  } catch (e) {
    Toast.fail((e as Error)?.message ?? '登录失败')
  }
}

async function onSendSms() {
  const phone = smsForm.value.phone?.trim()
  if (!/^1\d{10}$/.test(phone)) {
    Toast.fail('请输入正确手机号')
    return
  }
  const ok = await smsGate.runSend(async () => {
    await loginApi.sendSmsCode(phone)
    Toast.success('验证码已发送（mock 为 123456）')
  })
  if (ok === false && smsRemaining.value > 0) {
    showToast(`请 ${smsRemaining.value}s 后再试`)
  }
}

async function onBridgeLogin() {
  try {
    await loginByBridge()
  } catch (e) {
    Toast.fail((e as Error)?.message ?? '授权失败')
  }
}
</script>

<template>
  <PageContainer title="登录" :left-arrow="false" fill>
    <div class="login-page">
      <div class="login-header">
        <h2>欢迎回来</h2>
        <p>当前宿主：{{ hostLabel }}</p>
      </div>

      <Tabs v-model:active="loginTab" shrink animated swipeable>
        <Tab title="账号登录" name="account">
          <Form class="login-form" @submit="onSubmitAccount">
            <CellGroup inset>
              <Field
                v-model="form.username"
                name="username"
                label="用户名"
                placeholder="请输入用户名"
                clearable
                :rules="[{ required: true, message: '请填写用户名' }]"
              />
              <Field
                v-model="form.password"
                type="password"
                name="password"
                label="密码"
                placeholder="请输入密码"
                clearable
                :rules="[{ required: true, message: '请填写密码' }]"
              />
            </CellGroup>

            <div class="login-actions">
              <Button round block type="primary" native-type="submit" :loading="loading"> 登录 </Button>
              <p v-if="showMockHint" class="login-mock-tip">演示账号：admin 或 member / 123456</p>

              <Button
                v-if="bridge.host !== H5Host.BROWSER"
                round
                block
                plain
                type="primary"
                :loading="loading"
                class="login-actions__bridge"
                @click="onBridgeLogin"
              >
                使用 {{ hostLabel }} 一键登录
              </Button>
            </div>
          </Form>
        </Tab>

        <Tab title="短信登录" name="sms">
          <Form class="login-form" @submit="onSubmitSms">
            <CellGroup inset>
              <Field
                v-model="smsForm.phone"
                name="phone"
                type="tel"
                maxlength="11"
                label="手机号"
                placeholder="请输入手机号"
                clearable
                :rules="[
                  { required: true, message: '请填写手机号' },
                  { pattern: /^1\d{10}$/, message: '手机号格式错误' }
                ]"
              />
              <Field
                v-model="smsForm.code"
                name="code"
                label="验证码"
                placeholder="请输入验证码"
                clearable
                maxlength="6"
                :rules="[{ required: true, message: '请填写验证码' }]"
              >
                <template #button>
                  <Button size="small" type="primary" plain :disabled="smsRemaining > 0" @click.prevent="onSendSms">
                    {{ smsRemaining > 0 ? `${smsRemaining}s` : '获取验证码' }}
                  </Button>
                </template>
              </Field>
            </CellGroup>

            <div class="login-actions">
              <Button round block type="primary" native-type="submit" :loading="loading"> 登录 </Button>
              <p v-if="showMockHint" class="login-mock-tip">本地 mock 验证码：123456</p>
            </div>
          </Form>
        </Tab>
      </Tabs>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.login-page {
  padding: 48px 16px;
  color: var(--text-regular);
}

.login-header {
  margin-bottom: 24px;
  text-align: center;

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.login-form {
  margin-top: 8px;
}

.login-mock-tip {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
  text-align: center;
}

.login-actions {
  padding: 32px 16px 0;

  &__bridge {
    margin-top: 12px;
  }
}
</style>
