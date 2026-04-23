import type { MockMethod } from 'vite-plugin-mock'
import type { MenuRoute } from '../src/types/api'

/** admin 拥有全部菜单 */
const adminMenus: MenuRoute[] = [
  {
    id: 1,
    parentId: 0,
    name: 'Home',
    path: '/home',
    component: 'home/index',
    meta: {
      title: '首页',
      icon: 'HomeFilled',
      affix: true,
      keepAlive: true,
      requiresAuth: true,
      permissions: ['dashboard:view']
    }
  },
  {
    id: 10,
    parentId: 0,
    name: 'System',
    path: '/system',
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      requiresAuth: true,
      roles: ['admin']
    },
    children: [
      {
        id: 11,
        parentId: 10,
        name: 'SystemUser',
        path: '/system/user',
        component: 'system/user/index',
        meta: {
          title: '用户管理',
          icon: 'User',
          keepAlive: true,
          requiresAuth: true,
          permissions: ['system:user:list']
        }
      },
      {
        id: 12,
        parentId: 10,
        name: 'SystemRole',
        path: '/system/role',
        component: 'system/role/index',
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          keepAlive: true,
          requiresAuth: true,
          permissions: ['system:role:list']
        }
      },
      {
        id: 13,
        parentId: 10,
        name: 'SystemMenu',
        path: '/system/menu',
        component: 'system/menu/index',
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          keepAlive: true,
          requiresAuth: true,
          permissions: ['system:menu:list']
        }
      }
    ]
  }
]

/** editor 只有首页 */
const editorMenus: MenuRoute[] = [
  {
    id: 1,
    parentId: 0,
    name: 'Home',
    path: '/home',
    component: 'home/index',
    meta: {
      title: '首页',
      icon: 'HomeFilled',
      affix: true,
      keepAlive: true,
      requiresAuth: true,
      permissions: ['dashboard:view']
    }
  }
]

export default [
  {
    url: '/api/menu/routes',
    method: 'get',
    response: ({ headers }: { headers: Record<string, string> }) => {
      const auth = headers['authorization'] || ''
      const isAdmin = !auth.includes('-2')
      return {
        code: 200,
        message: 'success',
        data: isAdmin ? adminMenus : editorMenus
      }
    }
  }
] as MockMethod[]
