<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Empty, Button } from 'vant'
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'ErrorNetwork' })

const router = useRouter()
const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

function syncOnline() {
  online.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', syncOnline)
  window.addEventListener('offline', syncOnline)
})

onUnmounted(() => {
  window.removeEventListener('online', syncOnline)
  window.removeEventListener('offline', syncOnline)
})

function retry() {
  if (navigator.onLine) {
    router.replace('/home')
  } else {
    location.reload()
  }
}
</script>

<template>
  <div class="err-page">
    <Empty image="network" :description="online ? '网络仍不稳定' : '当前无网络连接'">
      <p class="err-page__hint">请检查网络设置后重试</p>
      <Button round type="primary" class="err-page__btn" @click="retry">{{ online ? '回首页' : '重新加载' }}</Button>
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
  color: var(--color-text-secondary);
}

.err-page__btn {
  min-width: 140px;
}
</style>
