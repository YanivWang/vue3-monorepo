<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  router.replace('/home')
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <p class="error-msg">您没有访问该页面的权限</p>
      <div class="error-actions">
        <el-button size="large" @click="goBack">返回上一页</el-button>
        <el-button type="primary" size="large" @click="goHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: $bg-page;
}

.error-content {
  text-align: center;
}

.error-code {
  margin-bottom: $spacing-md;
  font-size: 72px;
  font-weight: 700;
  color: $text-primary;
}

.error-msg {
  margin-bottom: $spacing-xl;
  font-size: 16px;
  color: $text-secondary;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
  justify-content: center;
}
</style>
