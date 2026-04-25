import { http } from './http'

export interface ListItem extends Record<string, unknown> {
  id: number
  title: string
  summary: string
  cover: string
  createdAt: string
}

export interface ListResult {
  list: ListItem[]
  total: number
}

export interface ListQueryParams {
  pageNum: number
  pageSize: number
  keyword?: string
  minId?: number
  maxId?: number
}

export interface ListCreateBody {
  title: string
  summary: string
  cover?: string
}

export type ListUpdateBody = Partial<ListCreateBody>

export const listApi = {
  fetch(params: ListQueryParams): Promise<ListResult> {
    return http.get('/list', {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      keyword: params.keyword,
      minId: params.minId,
      maxId: params.maxId
    })
  },

  fetchById(id: number): Promise<ListItem> {
    return http.get(`/list/${id}`)
  },

  create(body: ListCreateBody): Promise<ListItem> {
    return http.post('/list', body)
  },

  update(id: number, body: ListUpdateBody): Promise<ListItem> {
    return http.put(`/list/${id}`, body)
  },

  remove(id: number): Promise<{ id: number }> {
    return http.delete(`/list/${id}`)
  }
}
