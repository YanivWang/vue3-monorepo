import type { MockMethod } from 'vite-plugin-mock'
import { fail, mockOnlyBrowser, ok } from './_utils'

interface LoginBody {
  username: string
  password: string
}
interface ExchangeBody {
  host: string
  credential: string
}

interface SmsSendBody {
  phone: string
}

interface SmsLoginBody {
  phone: string
  code: string
}

/** 内存验证码（仅 mock）；固定为 123456，便于本地联调 */
const smsCodeByPhone = new Map<string, string>()

const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '超级管理员',
    avatar: 'https://avatars.githubusercontent.com/u/100000000?v=4',
    roles: ['admin'],
    permissions: ['*:*:*']
  },
  {
    id: 2,
    username: 'member',
    password: '123456',
    nickname: '普通用户',
    avatar: 'https://avatars.githubusercontent.com/u/200000000?v=4',
    roles: ['user'],
    permissions: ['home:view']
  }
]

export default mockOnlyBrowser([
  {
    url: '/api/auth/sms/send',
    method: 'post',
    response: ({ body }: { body: SmsSendBody }) => {
      if (!/^1\d{10}$/.test(body.phone ?? '')) return fail(400, '手机号格式错误')
      const code = '123456'
      smsCodeByPhone.set(body.phone, code)
      return ok({ expiresIn: 60 })
    }
  },
  {
    url: '/api/auth/sms/login',
    method: 'post',
    response: ({ body }: { body: SmsLoginBody }) => {
      if (!/^1\d{10}$/.test(body.phone ?? '')) return fail(400, '手机号格式错误')
      const expected = smsCodeByPhone.get(body.phone)
      if (!expected || expected !== body.code) return fail(400, '验证码错误或已失效')
      const u = users[1]!
      return ok({
        accessToken: `h5-sms-mock-token-${u.id}`,
        refreshToken: `h5-sms-mock-refresh-${u.id}`,
        expiresIn: 7200,
        tokenType: 'Bearer'
      })
    }
  },
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: LoginBody }) => {
      const u = users.find(x => x.username === body.username && x.password === body.password)
      if (!u) return fail(401, '用户名或密码错误')
      return ok({
        accessToken: `h5-mock-token-${u.id}`,
        refreshToken: `h5-mock-refresh-${u.id}`,
        expiresIn: 7200,
        tokenType: 'Bearer'
      })
    }
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ok(null)
  },
  {
    url: '/api/auth/exchange',
    method: 'post',
    response: ({ body }: { body: ExchangeBody }) => {
      if (!body.credential) return fail(400, 'credential 为空')
      return ok({
        accessToken: `h5-${body.host}-token`,
        refreshToken: `h5-${body.host}-refresh`,
        expiresIn: 7200,
        tokenType: 'Bearer'
      })
    }
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ headers }: { headers: Record<string, string> }) => {
      const auth = headers['authorization'] || ''
      const userId = auth.includes('-2') ? 2 : 1
      const u = users.find(x => x.id === userId) ?? users[0]!
      const { password: _p, ...info } = u
      return ok(info)
    }
  }
] satisfies MockMethod[])
