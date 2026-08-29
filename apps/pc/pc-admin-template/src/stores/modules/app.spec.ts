import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from './app'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-brand')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('默认值正确', () => {
    const store = useAppStore()
    expect(store.sidebarCollapsed).toBe(false)
    expect(store.themeMode).toBe('system')
    expect(store.brand).toBe('blue')
    expect(store.language).toBe('zh-CN')
    expect(store.pageLoading).toBe(false)
  })

  it('toggleSidebar 切换折叠状态', () => {
    const store = useAppStore()
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('setSidebarCollapsed 直接设置', () => {
    const store = useAppStore()
    store.setSidebarCollapsed(true)
    expect(store.isCollapsed).toBe(true)
  })

  it('setTheme dark 时 html 添加 dark class', () => {
    const store = useAppStore()
    store.setTheme('dark')
    expect(store.themeMode).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme light 时 html 移除 dark class', () => {
    const store = useAppStore()
    document.documentElement.classList.add('dark')
    store.setTheme('light')
    expect(store.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme system 时跟随媒体查询', () => {
    const mockMQ = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMQ as unknown as MediaQueryList)

    const store = useAppStore()
    store.setTheme('system')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(mockMQ.addEventListener).toHaveBeenCalled()
  })

  it('setBrand 设置 data-brand', () => {
    const store = useAppStore()
    store.setBrand('green')
    expect(store.brand).toBe('green')
    expect(document.documentElement.getAttribute('data-brand')).toBe('green')
  })

  it('init 同步品牌与主题到 DOM', () => {
    const store = useAppStore()
    store.brand = 'purple'
    store.themeMode = 'dark'
    store.init()
    expect(document.documentElement.getAttribute('data-brand')).toBe('purple')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setPageLoading 设置加载状态', () => {
    const store = useAppStore()
    store.setPageLoading(true)
    expect(store.pageLoading).toBe(true)
    store.setPageLoading(false)
    expect(store.pageLoading).toBe(false)
  })
})
