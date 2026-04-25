import type { MockMethod } from 'vite-plugin-mock'
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
    createdAt: new Date(Date.now() - id * 3600_000).toISOString()
  }
}

/** 进程内可变数据源（仅 dev mock） */
const store: DemoItem[] = Array.from({ length: SEED_COUNT }, (_, i) => makeItem(i + 1))
let nextId = SEED_COUNT + 1

function filterItems(q: ListQuery): DemoItem[] {
  let list = [...store]
  const kw = typeof q.keyword === 'string' ? q.keyword.trim() : ''
  if (kw) {
    list = list.filter(i => String(i.id).includes(kw) || i.title.includes(kw) || i.summary.includes(kw))
  }
  const minId = q.minId != null && q.minId !== '' ? Number(q.minId) : NaN
  if (!Number.isNaN(minId)) list = list.filter(i => i.id >= minId)
  const maxId = q.maxId != null && q.maxId !== '' ? Number(q.maxId) : NaN
  if (!Number.isNaN(maxId)) list = list.filter(i => i.id <= maxId)
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
    response: ({ query }: { query: ListQuery }) => {
      const pageNum = Number(query?.pageNum ?? 1)
      const pageSize = Number(query?.pageSize ?? 10)
      const filtered = filterItems(query)
      return ok(paginate(filtered, pageNum, pageSize))
    }
  },
  {
    url: '/api/list',
    method: 'post',
    response: ({ body }: { body: CreateBody }) => {
      if (!body?.title?.trim()) return fail(400, '标题不能为空')
      const id = nextId++
      const item: DemoItem = {
        id,
        title: body.title.trim(),
        summary: (body.summary ?? '').trim() || '—',
        cover: body.cover?.trim() || `https://picsum.photos/seed/h5-new-${id}/200/120`,
        createdAt: new Date().toISOString()
      }
      store.unshift(item)
      return ok(item)
    }
  },
  {
    url: '/api/list/:id',
    method: 'get',
    response: (opt: { query: ListQuery; params: { id: string } }) => {
      const id = Number(opt.params?.id)
      const item = store.find(x => x.id === id)
      if (!item) return fail(404, '记录不存在')
      return ok(item)
    }
  },
  {
    url: '/api/list/:id',
    method: 'put',
    response: (opt: { body: UpdateBody; params: { id: string } }) => {
      const id = Number(opt.params?.id)
      const idx = store.findIndex(x => x.id === id)
      if (idx < 0) return fail(404, '记录不存在')
      const prev = store[idx]!
      const body = opt.body ?? {}
      const next: DemoItem = {
        ...prev,
        title: body.title?.trim() ?? prev.title,
        summary: body.summary?.trim() ?? prev.summary,
        cover: body.cover?.trim() || prev.cover
      }
      store[idx] = next
      return ok(next)
    }
  },
  {
    url: '/api/list/:id',
    method: 'delete',
    response: (opt: { params: { id: string } }) => {
      const id = Number(opt.params?.id)
      const idx = store.findIndex(x => x.id === id)
      if (idx < 0) return fail(404, '记录不存在')
      store.splice(idx, 1)
      return ok({ id })
    }
  }
] satisfies MockMethod[])
