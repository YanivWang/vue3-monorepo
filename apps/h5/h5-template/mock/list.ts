import type { FakeRoute } from 'vite-plugin-fake-server'
import { mockOnlyBrowser, ok, fail } from './_utils'

interface ListQuery {
  pageNum?: string | number
  pageSize?: string | number
  keyword?: string
  minId?: string | number
  maxId?: string | number
}

export interface DemoItem {
  id: number
  title: string
  summary: string
  cover: string
  createdAt: string
}

const SEED_COUNT = 156

function makeItem(id: number): DemoItem {
  return {
    id,
    title: `H5 列表条目 #${id}`,
    summary: `这是第 ${id} 条占位说明；支持 CRUD 与筛选`,
    cover: `https://picsum.photos/seed/h5-${id}/200/120`,
    createdAt: new Date(Date.now() - id * 3600_000).toISOString(),
  }
}

/** 进程内可变数据源（仅 dev mock） */
const store: DemoItem[] = Array.from({ length: SEED_COUNT }, (_, i) => makeItem(i + 1))
let nextId = SEED_COUNT + 1

function filterItems(q: ListQuery): DemoItem[] {
  let list = [...store]
  const kw = typeof q.keyword === 'string' ? q.keyword.trim() : ''
  if (kw) {
    list = list.filter((i) => String(i.id).includes(kw) || i.title.includes(kw) || i.summary.includes(kw))
  }
  const minId = q.minId != null && q.minId !== '' ? Number(q.minId) : NaN
  if (!Number.isNaN(minId)) list = list.filter((i) => i.id >= minId)
  const maxId = q.maxId != null && q.maxId !== '' ? Number(q.maxId) : NaN
  if (!Number.isNaN(maxId)) list = list.filter((i) => i.id <= maxId)
  return list
}

function paginate(list: DemoItem[], pageNum: number, pageSize: number) {
  const start = (pageNum - 1) * pageSize
  const slice = list.slice(start, start + pageSize)
  return { list: slice, total: list.length }
}

interface CreateBody {
  title: string
  summary: string
  cover?: string
}

interface UpdateBody {
  title?: string
  summary?: string
  cover?: string
}

export default mockOnlyBrowser([
  {
    url: '/api/list',
    method: 'get',
    // query / body / params 在 ProcessedRequest 里都是松散类型（值来自网络），
    // 在边界处断言一次即可，下面就能按业务形状用
    response: ({ query }) => {
      const q = query as ListQuery
      const pageNum = Number(q.pageNum ?? 1)
      const pageSize = Number(q.pageSize ?? 10)
      const filtered = filterItems(q)
      return ok(paginate(filtered, pageNum, pageSize))
    },
  },
  {
    url: '/api/list',
    method: 'post',
    response: ({ body }) => {
      const input = body as CreateBody
      if (!input.title?.trim()) return fail(400, '标题不能为空')
      const id = nextId++
      const item: DemoItem = {
        id,
        title: input.title.trim(),
        summary: (input.summary ?? '').trim() || '—',
        cover: input.cover?.trim() || `https://picsum.photos/seed/h5-new-${id}/200/120`,
        createdAt: new Date().toISOString(),
      }
      store.unshift(item)
      return ok(item)
    },
  },
  {
    url: '/api/list/:id',
    method: 'get',
    response: ({ params }) => {
      const id = Number(params.id)
      const item = store.find((x) => x.id === id)
      if (!item) return fail(404, '记录不存在')
      return ok(item)
    },
  },
  {
    url: '/api/list/:id',
    method: 'put',
    response: ({ body, params }) => {
      const id = Number(params.id)
      const idx = store.findIndex((x) => x.id === id)
      if (idx < 0) return fail(404, '记录不存在')
      const prev = store[idx]!
      const input = body as UpdateBody
      const next: DemoItem = {
        ...prev,
        title: input.title?.trim() ?? prev.title,
        summary: input.summary?.trim() ?? prev.summary,
        cover: input.cover?.trim() || prev.cover,
      }
      store[idx] = next
      return ok(next)
    },
  },
  {
    url: '/api/list/:id',
    method: 'delete',
    response: ({ params }) => {
      const id = Number(params.id)
      const idx = store.findIndex((x) => x.id === id)
      if (idx < 0) return fail(404, '记录不存在')
      store.splice(idx, 1)
      return ok({ id })
    },
  },
] satisfies FakeRoute[])
