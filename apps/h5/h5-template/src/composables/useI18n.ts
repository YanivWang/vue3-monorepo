import { watch } from 'vue'
import type { App } from 'vue'
import { Locale as VantLocale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import enUS from 'vant/es/locale/lang/en-US'
import type { Composer } from 'vue-i18n'
import {
  createI18nInstance,
  setLocale as _setLocale,
  getLocale as _getLocale,
  BASE_LOCALES,
  type BaseLocale
} from '@vue3-monorepo/shared/locale'

const PINIA_H5_APP_KEY = 'h5-app'

/** 与 useAppStore 持久化一致：优先读 Pinia 落盘的 language，其次历史 h5:language，再浏览器语言 */
function resolveInitialLocale(): BaseLocale {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(PINIA_H5_APP_KEY)
      if (raw) {
        const data = JSON.parse(raw) as { language?: string }
        const lang = data.language
        if (lang && BASE_LOCALES.includes(lang as BaseLocale)) return lang as BaseLocale
      }
    } catch {
      /* ignore */
    }
    const legacy = localStorage.getItem('h5:language') as BaseLocale | null
    if (legacy && BASE_LOCALES.includes(legacy)) return legacy
  }
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) return 'en-US'
  return 'zh-CN'
}

/** 同步 Vant 内置文案 */
function applyVantLocale(locale: string): void {
  if (locale.startsWith('zh')) VantLocale.use('zh-CN', zhCN)
  else VantLocale.use('en-US', enUS)
}

const initialLocale = resolveInitialLocale()
applyVantLocale(initialLocale)

export const i18n = createI18nInstance({
  locale: initialLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        login: '登录',
        logout: '退出',
        confirm: '确定',
        cancel: '取消',
        tip: '提示',
        noData: '暂无数据',
        notLoggedIn: '未登录',
        goLogin: '去登录'
      },
      nav: { home: '首页', list: '长列表', theme: '主题', mine: '我的' },
      theme: {
        brand: '品牌色',
        sectionMode: '模式',
        sectionLanguage: '语言',
        sectionCurrent: '当前状态',
        light: '浅色',
        dark: '深色',
        system: '跟随系统',
        statusHost: '宿主',
        statusBrand: '品牌',
        statusMode: '模式',
        statusLanguage: '语言',
        langZh: '简体中文',
        langEn: 'English'
      },
      home: {
        notice: '欢迎使用 Vue3 Monorepo H5 模板 —— 支持浏览器 / 小程序 / APP 多宿主',
        currentUser: '当前用户',
        nickname: '昵称',
        role: '角色',
        token: 'Token',
        viewListDemo: '查看长列表 Demo',
        goTheme: '主题切换',
        bannerHome: '首页',
        bannerApps: '应用',
        bannerCart: '购物车',
        bannerGift: '礼品',
        bannerCoupon: '优惠券',
        bannerService: '客服',
        bannerSettings: '设置',
        bannerMsg: '消息'
      },
      mine: {
        account: '账户',
        username: '用户名',
        role: '角色',
        permissionCount: '权限数',
        more: '更多',
        themeSettings: '主题设置',
        listLink: '长列表',
        logoutConfirm: '确定退出登录？'
      },
      list: { detail: '条目详情', create: '新建条目', edit: '编辑条目' },
      error: { server: '服务异常', network: '网络异常', notFound: '页面不存在' }
    },
    'en-US': {
      common: {
        login: 'Sign in',
        logout: 'Sign out',
        confirm: 'OK',
        cancel: 'Cancel',
        tip: 'Notice',
        noData: 'No data',
        notLoggedIn: 'Not signed in',
        goLogin: 'Sign in'
      },
      nav: { home: 'Home', list: 'List', theme: 'Theme', mine: 'Profile' },
      theme: {
        brand: 'Brand color',
        sectionMode: 'Appearance',
        sectionLanguage: 'Language',
        sectionCurrent: 'Status',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        statusHost: 'Host',
        statusBrand: 'Brand',
        statusMode: 'Mode',
        statusLanguage: 'Language',
        langZh: '简体中文',
        langEn: 'English'
      },
      home: {
        notice: 'Vue3 Monorepo H5 template — browser, mini-programs, and native app ready.',
        currentUser: 'User',
        nickname: 'Nickname',
        role: 'Role',
        token: 'Token',
        viewListDemo: 'Open long list demo',
        goTheme: 'Theme settings',
        bannerHome: 'Home',
        bannerApps: 'Apps',
        bannerCart: 'Cart',
        bannerGift: 'Gifts',
        bannerCoupon: 'Coupons',
        bannerService: 'Support',
        bannerSettings: 'Settings',
        bannerMsg: 'Messages'
      },
      mine: {
        account: 'Account',
        username: 'Username',
        role: 'Role',
        permissionCount: 'Permissions',
        more: 'More',
        themeSettings: 'Theme',
        listLink: 'Long list',
        logoutConfirm: 'Sign out?'
      },
      list: { detail: 'Detail', create: 'New item', edit: 'Edit item' },
      error: { server: 'Server error', network: 'Network error', notFound: 'Not found' }
    }
  }
})

// 监听 i18n 语言变化，同步 Vant Locale（语言持久化由 useAppStore + pinia-plugin-persistedstate 负责）
const composer = i18n.global as unknown as Composer
watch(
  () => composer.locale.value,
  lang => {
    applyVantLocale(String(lang))
  },
  { immediate: false }
)

export function setupI18n(app: App): void {
  app.use(i18n)
}

export function setLocale(locale: BaseLocale): void {
  _setLocale(i18n, locale)
}

export function getLocale(): string {
  return _getLocale(i18n)
}

export { BASE_LOCALES }
export type { BaseLocale }
