<script setup lang="ts">
interface Props {
  /** 是否处于加载状态，false 时显示真实内容 */
  loading?: boolean
  /** 骨架屏行数（仅 variant=list 时生效） */
  rows?: number
  /** 展示变体：list=多行文字骨架 / card=卡片骨架 / avatar=头像+文字骨架 */
  variant?: 'list' | 'card' | 'avatar'
  /** 是否启用动画，默认 true */
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: true,
  rows: 3,
  variant: 'list',
  animated: true
})
</script>

<template>
  <slot v-if="!loading" />

  <div v-else class="skeleton" :class="{ 'skeleton--animated': animated }">
    <!-- 头像 + 文字 -->
    <template v-if="variant === 'avatar'">
      <div class="skeleton__avatar-row">
        <div class="skeleton__avatar skeleton__block" />
        <div class="skeleton__avatar-content">
          <div class="skeleton__block skeleton__block--title" />
          <div class="skeleton__block skeleton__block--subtitle" />
        </div>
      </div>
    </template>

    <!-- 卡片 -->
    <template v-else-if="variant === 'card'">
      <div class="skeleton__card">
        <div class="skeleton__block skeleton__block--image" />
        <div class="skeleton__block skeleton__block--title" />
        <div class="skeleton__block" />
        <div class="skeleton__block skeleton__block--short" />
      </div>
    </template>

    <!-- 多行文字（默认） -->
    <template v-else>
      <div v-for="i in rows" :key="i" class="skeleton__block" :class="{ 'skeleton__block--short': i === rows }" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@vue3-monorepo/shared/styles/tokens/variables' as *;

$skeleton-color: var(--el-fill-color-light, #f2f3f5);
$skeleton-shine: var(--el-fill-color-lighter, #e8eaed);

.skeleton {
  width: 100%;

  &__block {
    height: 16px;
    margin-bottom: 12px;
    background-color: $skeleton-color;
    border-radius: $radius-base;

    &--title {
      width: 40%;
      height: 20px;
      margin-bottom: 8px;
    }

    &--subtitle {
      width: 60%;
      height: 14px;
    }

    &--short {
      width: 60%;
    }

    &--image {
      height: 160px;
      margin-bottom: 16px;
      border-radius: $radius-medium;
    }
  }

  &__avatar-row {
    display: flex;
    gap: 12px;
  }

  &__avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  &__avatar-content {
    flex: 1;
    padding-top: 4px;
  }

  &__card {
    padding: 16px;
    background-color: var(--color-bg-elevated);
    border-radius: $radius-medium;
  }

  // 闪光动画
  &--animated .skeleton__block {
    background: linear-gradient(90deg, $skeleton-color 25%, $skeleton-shine 50%, $skeleton-color 75%);
    background-size: 400% 100%;
    animation: skeleton-shine 1.4s ease infinite;
  }
}

@keyframes skeleton-shine {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
