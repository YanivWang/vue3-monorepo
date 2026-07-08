<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { Empty, Button } from 'vant'

interface Props {
  /** 降级标题 */
  title?: string
  /** 子树渲染错误时回调（可自行接入上报） */
  onCapture?: (err: unknown) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '页面出现异常',
  onCapture: undefined
})

const hasError = ref(false)
const errorMessage = ref('')

function retry() {
  hasError.value = false
  errorMessage.value = ''
}

onErrorCaptured((err: unknown) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  props.onCapture?.(err)
  return false
})
</script>

<template>
  <slot v-if="!hasError" />

  <div v-else class="h5-error-boundary">
    <Empty image="error" :description="title">
      <p class="h5-error-boundary__msg">{{ errorMessage }}</p>
      <Button round type="primary" class="h5-error-boundary__btn" @click="retry"> 重试 </Button>
    </Empty>
  </div>
</template>

<style lang="scss" scoped>
.h5-error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 24px 16px;
}

.h5-error-boundary__msg {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  word-break: break-all;
}

.h5-error-boundary__btn {
  min-width: 120px;
}
</style>
