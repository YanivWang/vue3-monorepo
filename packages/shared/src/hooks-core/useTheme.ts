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
} from '@vue3-monorepo/shared/styles/tokens'

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
  /**
   * 最近一次根据 DOM 同步的 light/dark（在 `mode` 变化、`onMounted` 时刷新）
   * `mode === 'system'` 且仅操作系统配色变化时不会自动更新，请以 `getAppliedThemeMode()` 或 store 的 `themeTick` 策略为准
   */
  resolvedMode: Ref<'light' | 'dark'>
  brands: readonly BrandPalette[]
  setBrand(id: BrandId): void
  setMode(id: ThemeModeId): void
  /** 按 `brandPalettes` 顺序切到下一品牌（内部 `setBrand`，由 watch 写 DOM） */
  cycleBrand(): void
  /**
   * 根据当前 `resolvedMode` 在显式 `light` / `dark` 间切换（`setMode`）
   * 若当前 `mode === 'system'`，会改为固定 light 或 dark，不再保持 system
   */
  toggleMode(): void
}

/**
 * 主题 composable 工厂（须在组件内调用返回的 `useTheme()` 才会注册生命周期与 `watch`）。
 *
 * - `setBrand` / `setMode`：只改 ref + `storage`；写 DOM 靠 `watch(brand|mode)` 调用 `applyBrand` / `applyThemeMode`
 * - `onMounted`：`applyAll()` 同步当前持久化状态到 DOM，并刷新 `resolvedMode`
 * - `mode === 'system'`：`applyThemeMode` 会监听系统配色；`resolvedMode` 仅在 `mode` 变化或 `applyAll` 时刷新，系统配色单独变化时不会更新（与 Pinia store 的 `themeTick` 策略不同）
 *
 * @example
 *   应用内封装，例如：`src/composables/useTheme.ts`
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

  /** 挂载时一次性：品牌 + 深浅模式写 DOM，并同步 `resolvedMode` */
  function applyAll(): void {
    applyBrand(brand.value)
    teardownMode()
    teardownMode = applyThemeMode(mode.value)
    resolvedMode.value = getAppliedThemeMode()
  }

  /** 仅更新状态与 storage；`useTheme()` 内的 `watch(brand)` 负责 `applyBrand` */
  function setBrand(id: BrandId): void {
    brand.value = id
    storage.set(BRAND_KEY, id)
  }

  /** 仅更新状态与 storage；`watch(mode)` 负责 `applyThemeMode` 与 `resolvedMode` */
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
