<script setup lang="ts">
import { Button } from 'vant'
import { useRouter } from 'vue-router'

defineOptions({ name: 'NotFound' })

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h2>404</h2>
    <p>页面走丢了</p>
    <Button type="primary" @click="router.replace('/home')">返回首页</Button>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  padding: 48px 24px;
  color: var(--text-regular);
  text-align: center;

  h2 {
    margin: 0 0 12px;
    font-size: 48px;
    color: var(--color-primary);
  }

  p {
    margin: 0 0 24px;
  }
}
</style>
