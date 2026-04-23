<script setup lang="ts">
interface Props {
  /** 页面/卡片标题 */
  title?: string
  /** 副标题说明文字 */
  subtitle?: string
  /** 是否显示阴影，默认 never */
  shadow?: 'always' | 'hover' | 'never'
}

withDefaults(defineProps<Props>(), {
  shadow: 'never',
})

defineSlots<{
  /** 默认内容插槽 */
  default(): void
  /** 标题右侧额外操作区 */
  extra(): void
}>()
</script>

<template>
  <el-card :shadow="shadow" class="page-container">
    <!-- 有标题或 extra 插槽时才渲染 header -->
    <template v-if="title || $slots.extra" #header>
      <div class="page-container__header">
        <div class="page-container__title-wrap">
          <span class="page-container__title">{{ title }}</span>
          <span v-if="subtitle" class="page-container__subtitle">{{ subtitle }}</span>
        </div>
        <div v-if="$slots.extra" class="page-container__extra">
          <slot name="extra" />
        </div>
      </div>
    </template>

    <!-- 主内容 -->
    <slot />
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title-wrap {
    display: flex;
    align-items: baseline;
    gap: $spacing-sm;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__subtitle {
    font-size: 13px;
    color: $text-secondary;
  }

  &__extra {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}
</style>
