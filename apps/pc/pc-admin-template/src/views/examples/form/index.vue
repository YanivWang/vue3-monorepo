<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElDatePicker,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElLink,
  ElOption,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRow,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTag
} from 'element-plus'
import { useMessage } from '@/composables/useMessage'

const { success } = useMessage()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// ── 表单数据 ──────────────────────────────────────────────────
const form = reactive({
  // 基础信息
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',

  // 个人信息
  nickname: '',
  gender: '',
  birthday: '',
  website: '',

  // 设置
  roles: [] as string[],
  hobbies: [] as string[],
  level: 50,
  enableNotify: true,
  notifyType: 'email',
  remark: '',

  // 协议
  agreed: false
})

// ── 自定义校验函数 ────────────────────────────────────────────
const validatePhone = (_: unknown, value: string, callback: (err?: Error) => void) => {
  if (!value) return callback()
  if (!/^1[3-9]\d{9}$/.test(value)) return callback(new Error('请输入有效的手机号码'))
  callback()
}

const validateConfirmPassword = (_: unknown, value: string, callback: (err?: Error) => void) => {
  if (value !== form.password) return callback(new Error('两次输入的密码不一致'))
  callback()
}

const validateAgreed = (_: unknown, value: boolean, callback: (err?: Error) => void) => {
  if (!value) return callback(new Error('请阅读并同意用户协议'))
  callback()
}

// ── 校验规则 ──────────────────────────────────────────────────
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度 3~20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字、下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少 8 位', trigger: 'blur' },
    { pattern: /(?=.*[A-Za-z])(?=.*\d)/, message: '密码需包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  roles: [{ required: true, type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }],
  website: [{ type: 'url', message: '请输入有效的网址（以 http:// 或 https:// 开头）', trigger: 'blur' }],
  agreed: [{ validator: validateAgreed, trigger: 'change' }]
})

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 800))
    success('表单提交成功！')
    handleReset()
  } finally {
    submitting.value = false
  }
}

function handleReset() {
  formRef.value?.resetFields()
}

// 密码强度计算
function getPasswordStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 2) return { level: 1, label: '弱', color: '#f56c6c' }
  if (score <= 3) return { level: 2, label: '中', color: '#e6a23c' }
  return { level: 3, label: '强', color: '#67c23a' }
}
</script>

<template>
  <PageContainer title="表单验证" subtitle="完整的表单校验最佳实践示例">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="example-form" scroll-to-error>
      <!-- 账户信息 -->
      <el-divider content-position="left">账户信息</el-divider>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="3~20个字符，字母/数字/下划线"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="显示名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="example@domain.com" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="1xxxxxxxxxx（选填）">
              <template #prepend>+86</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="至少8位，含字母和数字" show-password />
            <div v-if="form.password" class="password-strength">
              <span>密码强度：</span>
              <el-tag :style="{ color: getPasswordStrength(form.password).color }" size="small" type="info">
                {{ getPasswordStrength(form.password).label }}
              </el-tag>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" show-password />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 个人信息 -->
      <el-divider content-position="left">个人信息</el-divider>

      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
              <el-radio value="">保密</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="个人网站" prop="website">
            <el-input v-model="form.website" placeholder="https://example.com（选填）" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 权限设置 -->
      <el-divider content-position="left">权限与偏好</el-divider>

      <el-form-item label="角色" prop="roles">
        <el-checkbox-group v-model="form.roles">
          <el-checkbox value="admin">管理员</el-checkbox>
          <el-checkbox value="editor">编辑</el-checkbox>
          <el-checkbox value="viewer">访客</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="兴趣爱好">
        <el-select v-model="form.hobbies" multiple placeholder="可多选" style="width: 100%">
          <el-option label="阅读" value="reading" />
          <el-option label="音乐" value="music" />
          <el-option label="编程" value="coding" />
          <el-option label="运动" value="sports" />
          <el-option label="旅行" value="travel" />
        </el-select>
      </el-form-item>

      <el-form-item label="等级（1-100）">
        <el-slider v-model="form.level" :min="1" :max="100" show-input style="width: 100%" />
      </el-form-item>

      <el-form-item label="接收通知">
        <el-switch v-model="form.enableNotify" />
        <el-radio-group v-if="form.enableNotify" v-model="form.notifyType" class="ml-sm">
          <el-radio-button value="email">邮件</el-radio-button>
          <el-radio-button value="sms">短信</el-radio-button>
          <el-radio-button value="both">两者</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="选填备注信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 协议 -->
      <el-form-item prop="agreed">
        <el-checkbox v-model="form.agreed">
          我已阅读并同意
          <el-link type="primary" href="#" @click.prevent>《用户服务协议》</el-link>
          和
          <el-link type="primary" href="#" @click.prevent>《隐私政策》</el-link>
        </el-checkbox>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </PageContainer>
</template>

<style lang="scss" scoped>
.example-form {
  max-width: 900px;
}

.password-strength {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
