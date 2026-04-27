import { describe, it, expect } from 'vitest'

/** 占位：保证 H5 工程在根 `pnpm test` / `pnpm run h5:test` 下有可收集用例；业务单测放在同目录约定 `*.spec.ts`。 */
describe('h5 template', () => {
  it('vitest 与 happy-dom 已接通', () => {
    expect(typeof window).toBe('object')
  })
})
