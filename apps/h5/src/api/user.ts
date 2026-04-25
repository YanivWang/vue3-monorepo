import type { UserInfo } from '@vue3-mono/shared'
import { http } from './http'

export interface LoginFormParams extends Record<string, unknown> {
  username: string
  password: string
}

export interface LoginTokenResult {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

export interface SmsSendResult {
  expiresIn: number
}

export interface SmsLoginParams extends Record<string, unknown> {
  phone: string
  code: string
}

export const loginApi = {
  /** 表单登录（浏览器、APP 回落） */
  formLogin(params: LoginFormParams): Promise<LoginTokenResult> {
    return http.post('/auth/login', params)
  },
  /** 发送短信验证码（mock 下固定验证码 123456） */
  sendSmsCode(phone: string): Promise<SmsSendResult> {
    return http.post('/auth/sms/send', { phone })
  },
  /** 短信验证码登录 */
  smsLogin(params: SmsLoginParams): Promise<LoginTokenResult> {
    return http.post('/auth/sms/login', params)
  },
  /**
   * SSO 凭证换 token：
   *  - 微信小程序 WebView：credential = wx.login().code
   *  - 支付宝小程序：credential = my.getAuthCode().authCode
   *  - Native APP：credential = 客户端颁发的 SSO token
   */
  exchangeCode(credential: string, host: string): Promise<LoginTokenResult> {
    return http.post('/auth/exchange', { credential, host })
  },
  logout(): Promise<null> {
    return http.post('/auth/logout', {})
  },
  getUserInfo(): Promise<UserInfo> {
    return http.get('/user/info')
  }
}
