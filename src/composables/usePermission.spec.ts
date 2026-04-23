import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { usePermission } from './usePermission'
import { useUserStore } from '@/stores/modules/user'

vi.mock('@/utils/storage', () => ({
  getToken: vi.fn().mockReturnValue(''),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  setRefreshToken: vi.fn(),
  removeRefreshToken: vi.fn()
}))

vi.mock('@/router', () => ({ resetRouter: vi.fn() }))

function mountWithPermission() {
  let result: ReturnType<typeof usePermission>
  mount(
    defineComponent({
      setup() {
        result = usePermission()
        return {}
      },
      template: '<div />'
    })
  )
  return () => result
}

describe('usePermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function setupUser(permissions: string[], roles: string[]) {
    const store = useUserStore()
    store.userInfo = { id: 1, username: 'test', nickname: 'Test', avatar: '', email: '', phone: '', roles, permissions }
  }

  it('hasPermission 权限码匹配', () => {
    setupUser(['user:list', 'user:create'], [])
    const getResult = mountWithPermission()
    expect(getResult().hasPermission('user:list')).toBe(true)
    expect(getResult().hasPermission('user:delete')).toBe(false)
  })

  it('hasPermission 数组满足其一', () => {
    setupUser(['user:list'], [])
    const getResult = mountWithPermission()
    expect(getResult().hasPermission(['user:list', 'user:create'])).toBe(true)
    expect(getResult().hasPermission(['user:delete', 'user:export'])).toBe(false)
  })

  it('hasAllPermissions 必须全部满足', () => {
    setupUser(['user:list', 'user:create'], [])
    const getResult = mountWithPermission()
    expect(getResult().hasAllPermissions(['user:list', 'user:create'])).toBe(true)
    expect(getResult().hasAllPermissions(['user:list', 'user:delete'])).toBe(false)
  })

  it('hasRole 角色匹配', () => {
    setupUser([], ['admin', 'editor'])
    const getResult = mountWithPermission()
    expect(getResult().hasRole('admin')).toBe(true)
    expect(getResult().hasRole('guest')).toBe(false)
  })

  it('hasAllRoles 必须全部满足', () => {
    setupUser([], ['admin', 'editor'])
    const getResult = mountWithPermission()
    expect(getResult().hasAllRoles(['admin', 'editor'])).toBe(true)
    expect(getResult().hasAllRoles(['admin', 'guest'])).toBe(false)
  })
})
