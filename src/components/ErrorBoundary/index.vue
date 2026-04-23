<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

interface Props {
  /** 降级 UI 中展示的标题，默认"页面出现错误" */
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '页面出现错误'
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
  // 返回 false 阻止错误继续向上传播（防止父级 ErrorBoundary 重复捕获）
  return false
})
</script>

<template>
  <slot v-if="!hasError" />

  <div v-else class="error-boundary">
    <el-result icon="error" :title="title" :sub-title="errorMessage">
      <template #extra>
        <el-button type="primary" @click="retry">重试</el-button>
      </template>
    </el-result>
  </div>
</template>

<style lang="scss" scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 300px;
  background-color: var(--bg-card);
  border-radius: $border-radius-large;
}
</style>
