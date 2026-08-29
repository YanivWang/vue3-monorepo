import { describe, expect, it } from 'vitest'
import { isEmail, isIdCard, isPhone, isUrl } from './validate'

describe('isEmail', () => {
  it.each(['a@b.co', 'john.doe+tag@sub.example.com', 'x_y-z@example-domain.cn'])('接受 %s', (v) => {
    expect(isEmail(v)).toBe(true)
  })

  it.each(['', 'plain', 'a@b', 'a@@b.co', '@b.co', 'a b@c.co'])('拒绝 %s', (v) => {
    expect(isEmail(v)).toBe(false)
  })
})

describe('isPhone', () => {
  it.each(['13912341234', '19900000000', '18888888888'])('接受 %s', (v) => {
    expect(isPhone(v)).toBe(true)
  })

  it.each(['12912341234', '1391234123', '139123412345', '+8613912341234', ''])('拒绝 %s', (v) => {
    expect(isPhone(v)).toBe(false)
  })
})

describe('isIdCard', () => {
  it('接受合法 18 位（含末位 X）', () => {
    expect(isIdCard('11010519900307123X')).toBe(true)
    expect(isIdCard('11010519900307123x')).toBe(true)
    expect(isIdCard('110105199003071234')).toBe(true)
  })

  it('月份 / 日期越界要拒绝', () => {
    expect(isIdCard('11010519901307123X')).toBe(false)
    expect(isIdCard('11010519900332123X')).toBe(false)
  })

  it('首位为 0、位数不足一律拒绝', () => {
    expect(isIdCard('01010519900307123X')).toBe(false)
    expect(isIdCard('1101051990030712')).toBe(false)
  })
})

describe('isUrl', () => {
  it('只接受 http / https', () => {
    expect(isUrl('http://example.com')).toBe(true)
    expect(isUrl('https://example.com/a?b=1#c')).toBe(true)
  })

  it('其他协议与非法串一律拒绝', () => {
    // javascript: 能被 URL 解析，但当成链接用就是 XSS 入口
    expect(isUrl('javascript:alert(1)')).toBe(false)
    expect(isUrl('ftp://example.com')).toBe(false)
    expect(isUrl('file:///etc/passwd')).toBe(false)
    expect(isUrl('example.com')).toBe(false)
    expect(isUrl('')).toBe(false)
  })
})
