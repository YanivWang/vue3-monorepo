<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CellGroup, Cell, Image as VanImage, Button, Toast, Dialog, Skeleton } from 'vant'
import { PageContainer } from '@vue3-mono/components-h5'
import { listApi, type ListItem } from '@/api/list'

defineOptions({ name: 'ListDetail' })

const route = useRoute()
const router = useRouter()

const id = computed(() => Number(route.params.id))
const item = ref<ListItem | null>(null)
const loading = ref(true)

async function load() {
  if (Number.isNaN(id.value)) {
    Toast.fail('无效 ID')
    router.back()
    return
  }
  loading.value = true
  try {
    item.value = await listApi.fetchById(id.value)
  } catch {
    Toast.fail('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

onMounted(load)

function goEdit() {
  router.push({ name: 'ListEdit', params: { id: String(id.value) } })
}

async function onDelete() {
  try {
    await Dialog.confirm({ title: '确认删除', message: '删除后不可恢复' })
    await listApi.remove(id.value)
    Toast.success('已删除')
    router.replace({ name: 'List' })
  } catch {
    /* 取消或接口失败 */
  }
}
</script>

<template>
  <PageContainer title="条目详情" fill>
    <div v-if="loading" class="detail-skel">
      <Skeleton title :row="3" />
    </div>
    <template v-else-if="item">
      <VanImage fit="cover" width="100%" height="180" :src="item.cover" class="detail-cover" />
      <CellGroup inset :title="item.title">
        <Cell title="ID" :value="String(item.id)" />
        <Cell title="摘要" :value="item.summary" />
        <Cell title="创建时间" :value="new Date(item.createdAt).toLocaleString()" />
      </CellGroup>
      <div class="detail-actions">
        <Button block round type="primary" @click="goEdit">编辑</Button>
        <Button block round type="danger" plain class="detail-actions__del" @click="onDelete">删除</Button>
      </div>
    </template>
  </PageContainer>
</template>

<style lang="scss" scoped>
.detail-cover {
  display: block;
}

.detail-skel {
  padding: 16px;
}

.detail-actions {
  padding: 24px 16px;

  &__del {
    margin-top: 12px;
  }
}
</style>
