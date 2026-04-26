/**
 * 通用校验（与 UI 无关，纯正则 / 规则）
 */

/** 邮箱 */
export function isEmail(input: string): boolean {
  return /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(input)
}

/** 中国大陆手机号 */
export function isPhone(input: string): boolean {
  return /^1[3-9]\d{9}$/.test(input)
}

/** 身份证号（18 位） */
export function isIdCard(input: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(input)
}

/** URL（http/https） */
export function isUrl(input: string): boolean {
  try {
    const u = new URL(input)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
