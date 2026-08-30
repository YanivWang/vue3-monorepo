import { defineFakeRoute } from 'vite-plugin-fake-server'

const userList = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '超级管理员',
    avatar: 'https://avatars.githubusercontent.com/u/100000000?v=4',
    email: 'admin@example.com',
    phone: '13800138000',
    roles: ['admin'],
    permissions: ['*:*:*'],
  },
  {
    id: 2,
    username: 'editor',
    password: '123456',
    nickname: '编辑员',
    avatar: 'https://avatars.githubusercontent.com/u/200000000?v=4',
    email: 'editor@example.com',
    phone: '13900139000',
    roles: ['editor'],
    permissions: ['dashboard:view', 'system:user:list', 'system:user:detail'],
  },
]

export default defineFakeRoute([
  {
    url: '/api/auth/login',
    method: 'post',
    // 请求体来自网络，在边界处断言一次即可
    response: ({ body }) => {
      const { username, password } = body as { username: string; password: string }
      const user = userList.find((u) => u.username === username && u.password === password)
      if (!user) {
        return { code: 401, message: '用户名或密码错误', data: null }
      }
      return {
        code: 200,
        message: 'success',
        data: {
          accessToken: `mock-access-token-${user.id}`,
          refreshToken: `mock-refresh-token-${user.id}`,
          expiresIn: 7200,
          tokenType: 'Bearer',
        },
      }
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({ code: 200, message: 'success', data: null }),
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ headers }) => {
      const auth = headers.authorization ?? ''
      const userId = auth.includes('-2') ? 2 : 1
      // userList 是模块级非空字面量，兜底项必然存在（noUncheckedIndexedAccess 下需显式表达）
      const user = userList.find((u) => u.id === userId) ?? userList[0]!
      const { password: _p, ...info } = user
      return { code: 200, message: 'success', data: info }
    },
  },
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: ({ body }) => {
      const { refreshToken } = body as { refreshToken?: string }
      if (refreshToken?.startsWith('mock-refresh-token-')) {
        const userId = refreshToken.replace('mock-refresh-token-', '')
        return {
          code: 200,
          message: 'success',
          data: {
            accessToken: `mock-access-token-${userId}-refreshed`,
            refreshToken: `mock-refresh-token-${userId}`,
            expiresIn: 7200,
            tokenType: 'Bearer',
          },
        }
      }
      return { code: 401, message: 'Refresh Token 无效', data: null }
    },
  },
  {
    url: '/api/user/password',
    method: 'put',
    response: () => ({ code: 200, message: '密码修改成功', data: null }),
  },
])
