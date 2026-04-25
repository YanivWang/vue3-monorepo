<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Empty, Button } from 'vant'

defineOptions({ name: 'ErrorEmpty' })

const route = useRoute()
const router = useRouter()

const tip = computed(() => (route.query.tip as string) || '暂无内容')
</script>

<template>
  <div class="err-page">
    <Empty image="search" :description="tip">
      <Button round type="primary" plain class="err-page__btn" @click="router.replace('/home')">返回首页</Button>
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

.err-page__btn {
  min-width: 140px;
  margin-top: 8px;
}
</style>
