import { describe, expect, it } from 'vitest'
import { maskEmail, maskIdCard, maskPhone, maskSecret } from './mask'

describe('maskPhone', () => {
  it('11 位手机号保留前 3 后 4', () => {
    expect(maskPhone('13912341234')).toBe('139****1234')
  })

  it('位数不对时原样返回——脱敏函数不该悄悄改数据', () => {
    expect(maskPhone('1391234')).toBe('1391234')
    expect(maskPhone('139123412345')).toBe('139123412345')
    expect(maskPhone('')).toBe('')
  })
})

describe('maskEmail', () => {
  it('保留首尾字符', () => {
    expect(maskEmail('john@example.com')).toBe('j**n@example.com')
  })

  it('用户名 ≤2 字符时只留首字母', () => {
    expect(maskEmail('ab@example.com')).toBe('a*@example.com')
    expect(maskEmail('a@example.com')).toBe('a*@example.com')
  })

  it('不是邮箱就原样返回', () => {
    expect(maskEmail('not-an-email')).toBe('not-an-email')
    expect(maskEmail('@example.com')).toBe('@example.com')
    expect(maskEmail('name@')).toBe('name@')
  })
})

describe('maskIdCard', () => {
  it('18 位保留前 2 后 2，中间 14 个星号', () => {
    const masked = maskIdCard('11010519900307123X')
    expect(masked).toBe('11**************3X')
    expect(masked).toHaveLength(18)
  })

  it('非 18 位原样返回', () => {
    expect(maskIdCard('110105199003071')).toBe('110105199003071')
  })
})

describe('maskSecret', () => {
  it('默认保留前 3 后 3', () => {
    expect(maskSecret('sk-1234567890abcdef')).toBe('sk-*************def')
  })

  it('长度不足以保留首尾时全部打码——不能泄露出原文', () => {
    expect(maskSecret('abcdef')).toBe('******')
    expect(maskSecret('ab')).toBe('**')
    expect(maskSecret('')).toBe('')
  })

  it('保留位数可配置', () => {
    expect(maskSecret('1234567890', 2, 2)).toBe('12******90')
    expect(maskSecret('1234567890', 0, 0)).toBe('**********')
  })
})
