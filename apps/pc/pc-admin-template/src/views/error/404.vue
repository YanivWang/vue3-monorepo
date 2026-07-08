<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(): void {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-msg">抱歉，您访问的页面不存在</p>
      <el-button type="primary" size="large" @click="goHome"> 返回首页 </el-button>
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
  background-color: var(--color-bg-page);
}

.error-content {
  text-align: center;
}

.error-code {
  margin-bottom: $spacing-lg;
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  color: var(--color-primary);
  opacity: 0.6;
}

.error-msg {
  margin-bottom: $spacing-xl;
  font-size: 18px;
  color: var(--color-text-secondary);
}
</style>
