<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElOption, ElSelect, ElSwitch, ElTag } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useMessage } from '@/composables/useMessage'
import type { TableColumn } from '@vue3-monorepo/shared/components-pc'

interface User {
  id: number
  username: string
  nickname: string
  email: string
  role: string
  status: 0 | 1
  createdAt: string
}

const { success, confirmDelete } = useMessage()

// ── 模拟数据 ──────────────────────────────────────────────────
let idSeq = 10
const mockUsers: User[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  nickname: `用户${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : 'editor',
  status: (i % 4 === 0 ? 0 : 1) as 0 | 1,
  createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString('zh-CN')
}))

async function fetchUsers(params: Record<string, unknown>) {
  await new Promise(r => setTimeout(r, 300))
  let list = [...mockUsers]
  if (params.username) list = list.filter(u => u.username.includes(String(params.username)))
  if (params.status !== undefined && params.status !== '') {
    list = list.filter(u => u.status === Number(params.status))
  }
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize) as unknown as Record<string, unknown>[],
    total: list.length,
    page,
    pageSize
  }
}

// ── 列配置 ────────────────────────────────────────────────────
const columns: TableColumn[] = [
  { type: 'index', label: '#', width: 60 },
  { prop: 'username', label: '用户名', minWidth: 110 },
  { prop: 'nickname', label: '昵称', minWidth: 110 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'role', label: '角色', width: 90, align: 'center', slot: 'role' },
  { prop: 'status', label: '状态', width: 90, align: 'center', slot: 'status' },
  { prop: 'createdAt', label: '创建时间', width: 130, align: 'center' },
  { label: '操作', slot: 'action', width: 160, fixed: 'right', align: 'center' }
]

// ── 搜索表单 ──────────────────────────────────────────────────
const searchForm = reactive({ username: '', status: '' })
const tableRef = ref()

// ── 新增/编辑对话框 ───────────────────────────────────────────
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: 0,
  username: '',
  nickname: '',
  email: '',
  role: 'editor',
  status: 1 as 0 | 1
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度 3~20 个字符', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '请输入有效邮箱', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

function openAdd() {
  isEdit.value = false
  dialogTitle.value = '新增用户'
  Object.assign(form, { id: 0, username: '', nickname: '', email: '', role: 'editor', status: 1 })
  dialogVisible.value = true
}

function openEdit(row: User) {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const submitting = ref(false)

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 500))
    if (isEdit.value) {
      const idx = mockUsers.findIndex(u => u.id === form.id)
      if (idx !== -1) Object.assign(mockUsers[idx], { ...form })
      success('编辑成功')
    } else {
      mockUsers.unshift({ ...form, id: ++idSeq, createdAt: new Date().toLocaleDateString('zh-CN') })
      success('新增成功')
    }
    dialogVisible.value = false
    tableRef.value?.fetchData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: User) {
  try {
    await confirmDelete(`确认删除用户「${row.nickname}」？`)
    await new Promise(r => setTimeout(r, 300))
    const idx = mockUsers.findIndex(u => u.id === row.id)
    if (idx !== -1) mockUsers.splice(idx, 1)
    success('删除成功')
    tableRef.value?.fetchData()
  } catch {
    /* 取消 */
  }
}

async function handleToggleStatus(row: User) {
  await new Promise(r => setTimeout(r, 200))
  row.status = row.status === 1 ? 0 : 1
  success(row.status === 1 ? '已启用' : '已禁用')
  tableRef.value?.fetchData()
}
</script>

<template>
  <PageContainer title="用户管理" subtitle="CRUD 完整示例">
    <template #extra>
      <el-button v-permission="'user:create'" type="primary" :icon="Plus" @click="openAdd"> 新增用户 </el-button>
    </template>

    <ProTable ref="tableRef" :fetch-fn="fetchUsers" :columns="columns" show-search show-action>
      <!-- 搜索区 -->
      <template #search="{ handleSearch, handleReset }">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="输入用户名" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch(searchForm)">搜索</el-button>
            <el-button
              @click="
                () => {
                  Object.assign(searchForm, { username: '', status: '' })
                  handleReset()
                }
              "
              >重置</el-button
            >
          </el-form-item>
        </el-form>
      </template>

      <!-- 角色列 -->
      <template #role="{ row }">
        <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
          {{ row.role === 'admin' ? '管理员' : '编辑' }}
        </el-tag>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-switch :model-value="row.status === 1" @change="handleToggleStatus(row)" />
      </template>

      <!-- 操作列（slot 由 ProTable 传入 { row, index }） -->
      <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
      <template #action="{ row }: any">
        <el-button v-permission="'user:edit'" link type="primary" @click="openEdit(row as User)">编辑</el-button>
        <el-button v-permission="'user:delete'" link type="danger" @click="handleDelete(row as User)">删除</el-button>
      </template>
    </ProTable>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="3~20 个字符" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="显示名称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="example@domain.com" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
