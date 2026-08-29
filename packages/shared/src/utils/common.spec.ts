import { describe, expect, it } from 'vitest'
import {
  arrayToTree,
  capitalize,
  formatDate,
  formatFileSize,
  parseQuery,
  stringifyQuery,
  toKebabCase,
  unique,
  uniqueBy,
} from './common'

describe('formatDate', () => {
  it('按默认与自定义格式输出', () => {
    expect(formatDate('2026-08-29T13:45:07Z', 'YYYY/MM/DD')).toBe('2026/08/29')
    expect(formatDate(new Date('2026-01-02T00:00:00'))).toBe('2026-01-02')
  })
})

describe('parseQuery', () => {
  it('解析为键值对，支持带不带前导 ?', () => {
    expect(parseQuery('?a=1&b=x')).toEqual({ a: '1', b: 'x' })
    expect(parseQuery('a=1&b=x')).toEqual({ a: '1', b: 'x' })
  })

  it('空串得到空对象；重复键取最后一个', () => {
    expect(parseQuery('')).toEqual({})
    expect(parseQuery('a=1&a=2')).toEqual({ a: '2' })
  })

  it('值会被 URL 解码', () => {
    expect(parseQuery('q=%E4%B8%AD%E6%96%87')).toEqual({ q: '中文' })
  })
})

describe('stringifyQuery', () => {
  it('过滤 undefined / null，保留 0 与空串', () => {
    expect(stringifyQuery({ a: 1, b: undefined, c: null, d: 0, e: '' })).toBe('a=1&d=0&e=')
  })

  it('对象与数组按 JSON 传，不会退化成 [object Object]', () => {
    const out = stringifyQuery({ filter: { id: 1 } })
    expect(out).not.toContain('object')
    expect(decodeURIComponent(out)).toBe('filter={"id":1}')
    expect(decodeURIComponent(stringifyQuery({ ids: [1, 2] }))).toBe('ids=[1,2]')
  })

  it('函数与 symbol 落不进查询串，直接跳过', () => {
    expect(stringifyQuery({ fn: () => 1, s: Symbol('x'), ok: 'v' })).toBe('ok=v')
  })

  it('布尔与 bigint 正常序列化', () => {
    expect(stringifyQuery({ flag: true, big: 10n })).toBe('flag=true&big=10')
  })
})

describe('capitalize / toKebabCase', () => {
  it('capitalize 只动首字母，空串安全', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('hELLO')).toBe('HELLO')
    expect(capitalize('')).toBe('')
  })

  it('toKebabCase 处理驼峰与首字母大写', () => {
    expect(toKebabCase('backgroundColor')).toBe('background-color')
    expect(toKebabCase('BackgroundColor')).toBe('-background-color')
    expect(toKebabCase('plain')).toBe('plain')
  })
})

describe('unique / uniqueBy', () => {
  it('unique 保留首次出现的顺序', () => {
    expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2])
    expect(unique<string>([])).toEqual([])
  })

  it('uniqueBy 按字段去重，保留先出现的那条', () => {
    const list = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
    ]
    expect(uniqueBy(list, 'id')).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ])
  })
})

describe('arrayToTree', () => {
  const list = [
    { id: 1, parentId: null, name: '根' },
    { id: 2, parentId: 1, name: '子' },
    { id: 3, parentId: 2, name: '孙' },
    { id: 4, parentId: null, name: '另一个根' },
  ]

  it('按 parentId 组装层级', () => {
    const tree = arrayToTree(list)
    expect(tree).toHaveLength(2)
    expect(tree[0]?.children?.[0]?.id).toBe(2)
    expect(tree[0]?.children?.[0]?.children?.[0]?.id).toBe(3)
  })

  it('叶子节点的 children 为 undefined，而不是空数组', () => {
    const tree = arrayToTree(list)
    expect(tree[1]?.children).toBeUndefined()
  })

  it('挂在不存在的父节点下的数据会被丢弃（孤儿节点不进树）', () => {
    const orphan = [{ id: 9, parentId: 999 }]
    expect(arrayToTree(orphan)).toEqual([])
  })
})

describe('formatFileSize', () => {
  it('按 1024 进制换算并带单位', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(1024 ** 3)).toBe('1 GB')
  })

  it('小数位可配置，且不留多余的 0', () => {
    expect(formatFileSize(1536, 0)).toBe('2 KB')
    expect(formatFileSize(1234567, 1)).toBe('1.2 MB')
  })
})
