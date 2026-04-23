import type { LoginParams, LoginResult, UserInfo } from '@/types/api'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/** Mock：演示账号与 README 中提示一致 */
export async function mockLogin(params: LoginParams): Promise<LoginResult> {
  await delay(200)
  if (params.username === 'admin' && params.password === '123456') {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
  }
  throw new Error('用户名或密码错误')
}

export async function mockLogout(): Promise<void> {
  await delay(100)
}

export async function mockGetUserInfo(): Promise<UserInfo> {
  await delay(150)
  return {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: 'https://avatars.githubusercontent.com/u/100000000?v=4',
    email: 'admin@example.com',
    phone: '1234567890',
    roles: ['admin'],
    permissions: ['admin', 'dashboard:view']
  }
}

export async function mockRefreshToken(refreshToken: string): Promise<LoginResult> {
  await delay(100)
  if (refreshToken === 'mock-refresh-token') {
    return {
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
  }
  throw new Error('Refresh 无效')
}
