<script setup lang="ts">
import { Popup, Button } from 'vant'

interface Props {
  /** 顶部标题 */
  title?: string
  /** 主按钮文案 */
  confirmText?: string
  /** 次按钮文案 */
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  title: '筛选',
  confirmText: '确定',
  cancelText: '重置'
})

const visible = defineModel<boolean>('show', { default: false })

const emit = defineEmits<{
  (e: 'confirm'): void
  /** 点击重置：默认仅关闭；业务可在监听里清空表单并 `@click` 阻止默认——此处约定为「重置筛选条件」由父组件在 @reset 处理 */
  (e: 'reset'): void
}>()

function onConfirm() {
  emit('confirm')
}

function onReset() {
  emit('reset')
  visible.value = false
}
</script>

<template>
  <Popup v-model:show="visible" position="bottom" round teleport="body" :style="{ maxHeight: '85%' }">
    <div class="h5-filter-drawer">
      <div class="h5-filter-drawer__title">{{ title }}</div>
      <div class="h5-filter-drawer__body">
        <slot />
      </div>
      <div class="h5-filter-drawer__actions">
        <Button class="h5-filter-drawer__btn" block round @click="onReset">{{ cancelText }}</Button>
        <Button class="h5-filter-drawer__btn" block round type="primary" @click="onConfirm">
          {{ confirmText }}
        </Button>
      </div>
    </div>
  </Popup>
</template>

<style lang="scss" scoped>
.h5-filter-drawer {
  padding: 16px 16px calc(12px + env(safe-area-inset-bottom));
}

.h5-filter-drawer__title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
}

.h5-filter-drawer__body {
  max-height: 52vh;
  margin-bottom: 16px;
  overflow: auto;
}

.h5-filter-drawer__actions {
  display: flex;
  gap: 12px;
}

.h5-filter-drawer__btn {
  flex: 1;
}
</style>
