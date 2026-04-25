import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import {
  applyBrand,
  applyThemeMode,
  brandPalettes,
  getAppliedBrand,
  getAppliedThemeMode,
  type BrandId,
  type BrandPalette,
  type ThemeModeId
} from '@vue3-mono/shared'

export interface ThemeStorage {
  /** 读取 key 的字符串值（未命中返回 null/undefined） */
  get(key: string): string | null | undefined
  /** 写入字符串值 */
  set(key: string, value: string): void
  /** 删除 */
  remove?(key: string): void
}

export interface UseThemeContext {
  /** 持久化实现（admin 可用 utils.appStorage，h5 可用 sessionStorage wrapper） */
  storage: ThemeStorage
  /** 默认品牌；未持久化时使用，默认 'blue' */
  defaultBrand?: BrandId
  /** 默认模式；未持久化时使用，默认 'system' */
  defaultMode?: ThemeModeId
  /** storage key 前缀，默认 'app:theme' */
  storageKeyPrefix?: string
}

export interface UseThemeReturn {
  brand: Ref<BrandId>
  mode: Ref<ThemeModeId>
  /** 当前实际模式（system 已解析为 light/dark） */
  resolvedMode: Ref<'light' | 'dark'>
  brands: readonly BrandPalette[]
  setBrand(id: BrandId): void
  setMode(id: ThemeModeId): void
  /** 循环切换下一个品牌（demo / 主题按钮场景） */
  cycleBrand(): void
  /** 在 light / dark 之间切换（不处理 system） */
  toggleMode(): void
}

/**
 * 主题 composable 工厂。
 *
 * - brand & mode 均持久化到注入的 storage
 * - mode='system' 时动态订阅 prefers-color-scheme
 *
 * @example
 *   // apps/h5/src/composables/useTheme.ts
 *   export const useTheme = createUseTheme({ storage: sessionTokenStorage })
 */
export function createUseTheme(ctx: UseThemeContext) {
  const { storage, defaultBrand = 'blue', defaultMode = 'system', storageKeyPrefix = 'app:theme' } = ctx
  const BRAND_KEY = `${storageKeyPrefix}:brand`
  const MODE_KEY = `${storageKeyPrefix}:mode`

  const brand = ref<BrandId>((storage.get(BRAND_KEY) as BrandId | null) || defaultBrand)
  const mode = ref<ThemeModeId>((storage.get(MODE_KEY) as ThemeModeId | null) || defaultMode)
  const resolvedMode = ref<'light' | 'dark'>(getAppliedThemeMode())

  let teardownMode: () => void = () => {}

  function applyAll(): void {
    applyBrand(brand.value)
    teardownMode()
    teardownMode = applyThemeMode(mode.value)
    resolvedMode.value = getAppliedThemeMode()
  }

  function setBrand(id: BrandId): void {
    brand.value = id
    storage.set(BRAND_KEY, id)
  }

  function setMode(id: ThemeModeId): void {
    mode.value = id
    storage.set(MODE_KEY, id)
  }

  function cycleBrand(): void {
    const idx = brandPalettes.findIndex(p => p.id === brand.value)
    const next = brandPalettes[(idx + 1) % brandPalettes.length]!
    setBrand(next.id)
  }

  function toggleMode(): void {
    setMode(resolvedMode.value === 'dark' ? 'light' : 'dark')
  }

  return function useTheme(): UseThemeReturn {
    onMounted(() => {
      if (!getAppliedBrand() || getAppliedBrand() !== brand.value) applyBrand(brand.value)
      applyAll()
    })
    onBeforeUnmount(() => {
      teardownMode()
    })
    watch(brand, () => applyBrand(brand.value))
    watch(mode, () => {
      teardownMode()
      teardownMode = applyThemeMode(mode.value)
      resolvedMode.value = getAppliedThemeMode()
    })

    return {
      brand,
      mode,
      resolvedMode,
      brands: brandPalettes,
      setBrand,
      setMode,
      cycleBrand,
      toggleMode
    }
  }
}

export type UseThemeFactory = typeof createUseTheme
