import { describe, it, expect, beforeEach } from 'vitest'
import { H5Host } from '@vue3-mono/shared/enums'
import { BridgeError } from './types'
import { createBridge, useBridge, __resetBridge } from './index'

beforeEach(() => {
  __resetBridge()
})

describe('createBridge', () => {
  it('浏览器宿主具备存储能力且不具备原生 auth.login', () => {
    const b = createBridge({ host: H5Host.BROWSER })
    expect(b.host).toBe(H5Host.BROWSER)
    expect(b.hasAbility('storage.get')).toBe(true)
    expect(b.hasAbility('auth.login')).toBe(false)
  })

  it('微信小程序宿主声明 auth.login', () => {
    const b = createBridge({ host: H5Host.WECHAT_MINI })
    expect(b.hasAbility('auth.login')).toBe(true)
  })

  it('浏览器下 auth.login 抛出 BridgeError', async () => {
    const b = createBridge({ host: H5Host.BROWSER })
    await expect(b.auth.login()).rejects.toBeInstanceOf(BridgeError)
  })

  it('useBridge 返回单例', () => {
    const a = useBridge({ host: H5Host.BROWSER })
    const b = useBridge()
    expect(a).toBe(b)
    expect(b.host).toBe(H5Host.BROWSER)
  })
})
