<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { ElButton, ElIcon, ElProgress, ElTag } from 'element-plus'
import { Document, UploadFilled } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/format'
import { useMessage } from '@/composables/useMessage'

const { success, error: showError, warning } = useMessage()

interface UploadFile {
  uid: string
  name: string
  size: number
  type: string
  raw: File
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled'
  progress: number
  url?: string
  error?: string
  controller?: AbortController
}

const fileList = ref<UploadFile[]>([])
const inputRef = ref<HTMLInputElement>()
const isDragging = ref(false)

// ── 文件选择 ──────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return `不支持的文件类型：${file.type}`
  if (file.size > MAX_SIZE) return `文件超过 10MB：${formatFileSize(file.size)}`
  return null
}

function addFiles(files: FileList | File[]) {
  for (const raw of Array.from(files)) {
    const err = validateFile(raw)
    if (err) {
      warning(err)
      continue
    }

    fileList.value.push({
      uid: `${Date.now()}-${Math.random()}`,
      name: raw.name,
      size: raw.size,
      type: raw.type,
      raw,
      status: 'pending',
      progress: 0
    })
  }
}

function onInputChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
  if (inputRef.value) inputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

// ── 上传逻辑 ──────────────────────────────────────────────────
async function uploadFile(item: UploadFile) {
  item.status = 'uploading'
  item.progress = 0
  item.controller = new AbortController()

  const formData = new FormData()
  formData.append('file', item.raw)

  try {
    // 模拟上传（实际替换为真实接口）
    await new Promise<void>((resolve, reject) => {
      let progress = 0
      const timer = setInterval(() => {
        if (item.status === 'cancelled') {
          clearInterval(timer)
          reject(new DOMException('Upload cancelled', 'AbortError'))
          return
        }
        progress += Math.random() * 15
        item.progress = Math.min(Math.round(progress), 99)
        if (progress >= 100) {
          clearInterval(timer)
          resolve()
        }
      }, 150)
      item.controller?.signal.addEventListener('abort', () => {
        clearInterval(timer)
        reject(new DOMException('Upload cancelled', 'AbortError'))
      })
    })

    // 实际上传示例（取消注释使用）：
    // const res = await axios.post('/api/upload', formData, {
    //   signal: item.controller.signal,
    //   onUploadProgress: e => { item.progress = Math.round((e.loaded / (e.total ?? 1)) * 100) }
    // })
    // item.url = res.data.url

    item.progress = 100
    item.status = 'success'
    item.url = URL.createObjectURL(item.raw)
    success(`${item.name} 上传成功`)
  } catch (err) {
    if (axios.isCancel(err) || (err instanceof DOMException && err.name === 'AbortError')) {
      item.status = 'cancelled'
    } else {
      item.status = 'error'
      item.error = '上传失败，请重试'
      showError(`${item.name} 上传失败`)
    }
  } finally {
    item.controller = undefined
  }
}

function uploadAll() {
  const pending = fileList.value.filter(f => f.status === 'pending' || f.status === 'error')
  pending.forEach(uploadFile)
}

function cancelUpload(item: UploadFile) {
  item.controller?.abort()
  item.status = 'cancelled'
}

function removeFile(item: UploadFile) {
  if (item.status === 'uploading') cancelUpload(item)
  fileList.value = fileList.value.filter(f => f.uid !== item.uid)
}

function retryUpload(item: UploadFile) {
  item.status = 'pending'
  item.progress = 0
  item.error = undefined
  uploadFile(item)
}

const isImageType = (type: string) => type.startsWith('image/')

const statusMap = {
  pending: { label: '待上传', type: 'info' as const },
  uploading: { label: '上传中', type: 'warning' as const },
  success: { label: '成功', type: 'success' as const },
  error: { label: '失败', type: 'danger' as const },
  cancelled: { label: '已取消', type: 'info' as const }
}
</script>

<template>
  <PageContainer title="文件上传" subtitle="支持拖拽、进度条、取消、重试">
    <!-- 拖拽区域 -->
    <div
      class="upload-dragger"
      :class="{ 'upload-dragger--active': isDragging }"
      @click="inputRef?.click()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <el-icon class="upload-dragger__icon"><UploadFilled /></el-icon>
      <p class="upload-dragger__text">拖拽文件到此处，或 <em>点击上传</em></p>
      <p class="upload-dragger__hint">支持 JPG、PNG、GIF、WebP、PDF，单文件最大 10MB</p>
      <input ref="inputRef" type="file" multiple class="upload-input" @change="onInputChange" />
    </div>

    <!-- 文件列表 -->
    <div v-if="fileList.length" class="upload-list">
      <div class="upload-list__header">
        <span class="upload-list__count">共 {{ fileList.length }} 个文件</span>
        <el-button
          type="primary"
          size="small"
          :disabled="!fileList.some(f => f.status === 'pending' || f.status === 'error')"
          @click="uploadAll"
        >
          全部上传
        </el-button>
      </div>

      <div v-for="item in fileList" :key="item.uid" class="upload-item">
        <!-- 缩略图 -->
        <div class="upload-item__thumb">
          <img v-if="isImageType(item.type) && item.url" :src="item.url" :alt="item.name" />
          <el-icon v-else class="upload-item__icon"><Document /></el-icon>
        </div>

        <!-- 文件信息 -->
        <div class="upload-item__info">
          <div class="upload-item__name">
            <span class="upload-item__filename" :title="item.name">{{ item.name }}</span>
            <el-tag :type="statusMap[item.status].type" size="small">
              {{ statusMap[item.status].label }}
            </el-tag>
          </div>
          <div class="upload-item__size">{{ formatFileSize(item.size) }}</div>

          <!-- 进度条 -->
          <el-progress
            v-if="item.status === 'uploading'"
            :percentage="item.progress"
            :stroke-width="4"
            class="upload-item__progress"
          />
          <p v-if="item.error" class="upload-item__error">{{ item.error }}</p>
        </div>

        <!-- 操作 -->
        <div class="upload-item__actions">
          <el-button v-if="item.status === 'pending'" link type="primary" size="small" @click="uploadFile(item)"
            >上传</el-button
          >
          <el-button v-if="item.status === 'uploading'" link type="warning" size="small" @click="cancelUpload(item)"
            >取消</el-button
          >
          <el-button
            v-if="item.status === 'error' || item.status === 'cancelled'"
            link
            type="primary"
            size="small"
            @click="retryUpload(item)"
            >重试</el-button
          >
          <el-button link type="danger" size="small" @click="removeFile(item)">移除</el-button>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.upload-dragger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  cursor: pointer;
  background-color: var(--color-bg-page);
  border: 2px dashed var(--color-border-default);
  border-radius: $radius-large;
  transition: $transition-base;

  &:hover,
  &--active {
    background-color: var(--color-primary-subtle);
    border-color: var(--color-primary);
  }

  &__icon {
    margin-bottom: 12px;
    font-size: 48px;
    color: var(--color-primary);
  }

  &__text {
    font-size: 14px;
    color: var(--color-text-regular);

    em {
      font-style: normal;
      color: var(--color-primary);
    }
  }

  &__hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.upload-input {
  display: none;
}

.upload-list {
  margin-top: $spacing-lg;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  &__count {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.upload-item {
  display: flex;
  gap: $spacing-md;
  align-items: flex-start;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: $radius-medium;

  &__thumb {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    overflow: hidden;
    background-color: var(--color-bg-page);
    border-radius: $radius-base;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 24px;
    color: var(--color-text-secondary);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
  }

  &__filename {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  &__size {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__progress {
    margin-top: 6px;
  }

  &__error {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-danger);
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
  }
}
</style>
