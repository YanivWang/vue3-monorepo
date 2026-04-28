<script setup lang="ts">
import { ref } from 'vue'
import { CellGroup, Cell, showToast } from 'vant'
import { PageContainer } from '@vue3-monorepo/shared/components-h5'
import { reportClientError } from '@/plugins/clientErrorReport'
import { captureException } from '@/plugins/sentry'

defineOptions({ name: 'DevErrorCollect' })

const brokenImgUrl = `${typeof location !== 'undefined' ? location.origin : ''}/__error_collect_test__/missing-asset.png`
const showBrokenImg = ref(false)

function triggerVueError() {
  throw new Error('[错误采集测试] Vue errorHandler')
}

function triggerJsError() {
  window.setTimeout(() => {
    throw new Error('[错误采集测试] 非 Vue 包裹的同步异常（timer）')
  }, 0)
  showToast('约 0ms 后将抛出 JS 异常，请查看控制台 / 上报')
}

function triggerUnhandledRejection() {
  void Promise.reject(new Error('[错误采集测试] unhandledrejection'))
  showToast('已触发未捕获的 Promise 拒绝')
}

function triggerResourceError() {
  showBrokenImg.value = true
  showToast('已插入失败图片，等待资源 error 事件')
}

function manualReportVue() {
  reportClientError({
    kind: 'vue',
    message: '[错误采集测试] 手动 reportClientError · vue',
    stack: new Error().stack,
    vueInfo: 'manual'
  })
  showToast('已调用 reportClientError(vue)')
}

function manualReportJs() {
  reportClientError({
    kind: 'js',
    message: '[错误采集测试] 手动 reportClientError · js',
    stack: new Error().stack,
    source: 'error-collect-test.vue'
  })
  showToast('已调用 reportClientError(js)')
}

function manualReportRejection() {
  reportClientError({
    kind: 'unhandledrejection',
    message: '[错误采集测试] 手动 reportClientError · unhandledrejection',
    stack: new Error().stack
  })
  showToast('已调用 reportClientError(unhandledrejection)')
}

function manualReportResource() {
  reportClientError({
    kind: 'resource',
    message: '[错误采集测试] 手动 reportClientError · resource',
    source: brokenImgUrl,
    tagName: 'IMG'
  })
  showToast('已调用 reportClientError(resource)')
}

function triggerSentry() {
  captureException(new Error('[错误采集测试] Sentry captureException'))
  showToast('已调用 captureException（未配置 DSN 时无效果）')
}
</script>

<template>
  <PageContainer title="错误采集测试">
    <div class="hint">
      配置 <code>VITE_ERROR_REPORT_URL</code> 后会上报；开发环境可配合
      <code>VITE_ERROR_REPORT_DEBUG=true</code> 在控制台查看 <code>[ClientError]</code> 载荷。Web Vitals 需单独配置
      <code>VITE_WEB_VITALS_REPORT_URL</code>。
    </div>

    <CellGroup inset title="运行时异常（走全局监听）">
      <Cell title="Vue errorHandler" is-link @click="triggerVueError" />
      <Cell title="window error（JS）· setTimeout" is-link @click="triggerJsError" />
      <Cell title="unhandledrejection" is-link @click="triggerUnhandledRejection" />
      <Cell title="资源加载失败（IMG 404）" is-link @click="triggerResourceError" />
    </CellGroup>

    <CellGroup inset title="直接上报（不抛异常）">
      <Cell title="reportClientError · vue" is-link @click="manualReportVue" />
      <Cell title="reportClientError · js" is-link @click="manualReportJs" />
      <Cell title="reportClientError · unhandledrejection" is-link @click="manualReportRejection" />
      <Cell title="reportClientError · resource" is-link @click="manualReportResource" />
    </CellGroup>

    <CellGroup inset title="其它">
      <Cell title="Sentry captureException" is-link @click="triggerSentry" />
    </CellGroup>

    <img v-show="showBrokenImg" :src="brokenImgUrl" alt="" class="broken-img" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.hint {
  padding: 10px 12px;
  margin: 12px 16px 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--van-background-2);
  border-radius: 8px;

  code {
    font-size: 11px;
    word-break: break-all;
  }
}

.broken-img {
  position: absolute;
  width: 1px;
  height: 1px;
  pointer-events: none;
  opacity: 0;
}
</style>
