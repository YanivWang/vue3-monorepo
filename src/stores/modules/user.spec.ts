import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'

// Mock API 模块
vi.mock('@/api/modules/user', () => ({
  login: vi.fn().mockResolvedValue({ accessToken: 'mock-token', refreshToken: 'mock-refresh' }),
  logout: vi.fn().mockResolvedValue(undefined),
  getUserInfo: vi.fn().mockResolvedValue({
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: '',
    roles: ['admin'],
    permissions: ['*:*:*']
  })
}))

vi.mock('@/utils/storage', () => ({
  getToken: vi.fn().mockReturnValue(''),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  setRefreshToken: vi.fn(),
  removeRefreshToken: vi.fn(),
  getRefreshToken: vi.fn()
}))

vi.mock('@/router', () => ({
  resetRouter: vi.fn()
}))

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态：未登录', () => {
    const store = useUserStore()
    expect(store.isLoggedIn).toBe(false)
    expect(store.userInfo).toBeNull()
  })

  it('loginAction 设置 token', async () => {
    const store = useUserStore()
    await store.loginAction({ username: 'admin', password: '123456' })
    expect(store.token).toBe('mock-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('fetchUserInfo 正确填充 userInfo', async () => {
    const store = useUserStore()
    await store.fetchUserInfo()
    expect(store.username).toBe('admin')
    expect(store.nickname).toBe('管理员')
    expect(store.roles).toContain('admin')
  })

  it('hasPermission *:*:* 超级管理员通过所有权限', async () => {
    const store = useUserStore()
    await store.fetchUserInfo()
    expect(store.hasPermission('any:permission:code')).toBe(true)
  })

  it('hasPermission 普通权限码精确匹配', () => {
    const store = useUserStore()
    store.userInfo = {
      id: 2,
      username: 'editor',
      nickname: '编辑',
      avatar: '',
      email: '',
      phone: '',
      roles: ['editor'],
      permissions: ['user:list', 'user:create']
    }
    expect(store.hasPermission('user:list')).toBe(true)
    expect(store.hasPermission('user:delete')).toBe(false)
  })

  it('hasRole 角色匹配', () => {
    const store = useUserStore()
    store.userInfo = {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: '',
      email: '',
      phone: '',
      roles: ['admin'],
      permissions: []
    }
    expect(store.hasRole('admin')).toBe(true)
    expect(store.hasRole('guest')).toBe(false)
  })

  it('resetState 清空登录状态', () => {
    const store = useUserStore()
    store.resetState()
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })
})
