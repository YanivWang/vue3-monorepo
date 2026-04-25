<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form, Field, CellGroup, Button, Toast } from 'vant'
import { PageContainer } from '@vue3-mono/components-h5'
import { listApi } from '@/api/list'

defineOptions({ name: 'ListForm' })

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'ListEdit')
const id = computed(() => (isEdit.value ? Number(route.params.id) : NaN))

const form = ref({
  title: '',
  summary: '',
  cover: ''
})

const loading = ref(false)
const pageLoading = ref(false)

async function loadDetail() {
  if (!isEdit.value || Number.isNaN(id.value)) return
  pageLoading.value = true
  try {
    const row = await listApi.fetchById(id.value)
    form.value = {
      title: row.title,
      summary: row.summary,
      cover: row.cover
    }
  } catch {
    Toast.fail('加载失败')
    router.back()
  } finally {
    pageLoading.value = false
  }
}

onMounted(() => {
  void loadDetail()
})

async function onSubmit() {
  loading.value = true
  try {
    if (isEdit.value && !Number.isNaN(id.value)) {
      await listApi.update(id.value, {
        title: form.value.title.trim(),
        summary: form.value.summary.trim(),
        cover: form.value.cover.trim() || undefined
      })
      Toast.success('已保存')
      router.replace({ name: 'ListDetail', params: { id: String(id.value) } })
    } else {
      const row = await listApi.create({
        title: form.value.title.trim(),
        summary: form.value.summary.trim(),
        cover: form.value.cover.trim() || undefined
      })
      Toast.success('已创建')
      router.replace({ name: 'ListDetail', params: { id: String(row.id) } })
    }
  } catch {
    /* toast by http */
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer :title="isEdit ? '编辑条目' : '新建条目'" fill>
    <div v-if="pageLoading" class="form-loading" />
    <Form v-else @submit="onSubmit">
      <CellGroup inset>
        <Field
          v-model="form.title"
          name="title"
          label="标题"
          placeholder="必填"
          maxlength="80"
          show-word-limit
          :rules="[{ required: true, message: '请填写标题' }]"
        />
        <Field
          v-model="form.summary"
          name="summary"
          label="摘要"
          type="textarea"
          rows="3"
          maxlength="200"
          show-word-limit
          placeholder="选填"
        />
        <Field v-model="form.cover" name="cover" label="封面 URL" placeholder="选填，留空则自动生成" />
      </CellGroup>
      <div class="form-actions">
        <Button round block type="primary" native-type="submit" :loading="loading">
          {{ isEdit ? '保存' : '创建' }}
        </Button>
      </div>
    </Form>
  </PageContainer>
</template>

<style lang="scss" scoped>
.form-loading {
  min-height: 120px;
}

.form-actions {
  padding: 24px 16px;
}
</style>
