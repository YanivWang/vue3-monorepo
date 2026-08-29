<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { ElResult, ElButton } from 'element-plus'

interface Props {
  /** 降级 UI 中展示的标题，默认"页面出现错误" */
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '页面出现错误',
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
  return false
})
</script>

<template>
  <slot v-if="!hasError" />

  <div v-else class="error-boundary">
    <ElResult icon="error" :title="title" :sub-title="errorMessage">
      <template #extra>
        <ElButton type="primary" @click="retry">重试</ElButton>
      </template>
    </ElResult>
  </div>
</template>

<style lang="scss" scoped>
@use '@vue3-monorepo/shared/styles/tokens/variables' as *;

.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 300px;
  background-color: var(--color-bg-elevated);
  border-radius: $radius-large;
}
</style>
