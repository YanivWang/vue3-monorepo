/**
 * 敏感数据脱敏
 */

/** 手机号脱敏：139****1234 */
export function maskPhone(phone: string): string {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

/** 邮箱脱敏：j***n@example.com */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  if (name.length <= 2) return `${name.charAt(0)}*@${domain}`
  return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`
}

/** 身份证号脱敏：11**************2X */
export function maskIdCard(id: string): string {
  if (id.length !== 18) return id
  return `${id.slice(0, 2)}${'*'.repeat(14)}${id.slice(-2)}`
}

/** 通用字符串脱敏 */
export function maskSecret(input: string, keepStart = 3, keepEnd = 3): string {
  if (input.length <= keepStart + keepEnd) return '*'.repeat(input.length)
  return `${input.slice(0, keepStart)}${'*'.repeat(input.length - keepStart - keepEnd)}${input.slice(-keepEnd)}`
}
