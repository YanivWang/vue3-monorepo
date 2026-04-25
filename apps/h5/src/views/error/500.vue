<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Empty, Button } from 'vant'

defineOptions({ name: 'Error500' })

const router = useRouter()
</script>

<template>
  <div class="err-page">
    <Empty image="error" description="服务暂时不可用">
      <p class="err-page__hint">请稍后再试，或返回首页</p>
      <Button round type="primary" class="err-page__btn" @click="router.replace('/home')">返回首页</Button>
    </Empty>
  </div>
</template>

<style lang="scss" scoped>
.err-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 24px;
}

.err-page__hint {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.err-page__btn {
  min-width: 140px;
}
</style>
