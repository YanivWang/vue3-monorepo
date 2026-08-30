import { defineFakeRoute } from 'vite-plugin-fake-server'
import type { MenuRoute } from '@vue3-monorepo/shared/types'

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
      permissions: ['dashboard:view'],
    },
  },
  {
    id: 20,
    parentId: 0,
    name: 'Examples',
    path: '/examples',
    redirect: '/examples/crud',
    meta: {
      title: '示例页面',
      icon: 'Grid',
      requiresAuth: true,
    },
    children: [
      {
        id: 21,
        parentId: 20,
        name: 'ExampleCrud',
        path: '/examples/crud',
        component: 'examples/crud/index',
        meta: {
          title: 'CRUD 示例',
          icon: 'List',
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        id: 22,
        parentId: 20,
        name: 'ExampleForm',
        path: '/examples/form',
        component: 'examples/form/index',
        meta: {
          title: '表单验证',
          icon: 'Document',
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        id: 23,
        parentId: 20,
        name: 'ExampleUpload',
        path: '/examples/upload',
        component: 'examples/upload/index',
        meta: {
          title: '文件上传',
          icon: 'Upload',
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        id: 24,
        parentId: 20,
        name: 'ExampleCharts',
        path: '/examples/charts',
        component: 'examples/charts/index',
        meta: {
          title: '图表',
          icon: 'TrendCharts',
          keepAlive: true,
          requiresAuth: true,
        },
      },
    ],
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
      roles: ['admin'],
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
          permissions: ['system:user:list'],
        },
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
          permissions: ['system:role:list'],
        },
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
          permissions: ['system:menu:list'],
        },
      },
    ],
  },
]

/** editor 有首页 + 示例页 */
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
      permissions: ['dashboard:view'],
    },
  },
  {
    id: 20,
    parentId: 0,
    name: 'Examples',
    path: '/examples',
    redirect: '/examples/crud',
    meta: {
      title: '示例页面',
      icon: 'Grid',
      requiresAuth: true,
    },
    children: [
      {
        id: 21,
        parentId: 20,
        name: 'ExampleCrud',
        path: '/examples/crud',
        component: 'examples/crud/index',
        meta: {
          title: 'CRUD 示例',
          icon: 'List',
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        id: 22,
        parentId: 20,
        name: 'ExampleForm',
        path: '/examples/form',
        component: 'examples/form/index',
        meta: {
          title: '表单验证',
          icon: 'Document',
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        id: 23,
        parentId: 20,
        name: 'ExampleUpload',
        path: '/examples/upload',
        component: 'examples/upload/index',
        meta: {
          title: '文件上传',
          icon: 'Upload',
          keepAlive: true,
          requiresAuth: true,
        },
      },
      {
        id: 24,
        parentId: 20,
        name: 'ExampleCharts',
        path: '/examples/charts',
        component: 'examples/charts/index',
        meta: {
          title: '图表',
          icon: 'TrendCharts',
          keepAlive: true,
          requiresAuth: true,
        },
      },
    ],
  },
]

export default defineFakeRoute([
  {
    url: '/api/menu/routes',
    method: 'get',
    response: ({ headers }) => {
      const auth = headers.authorization ?? ''
      const isAdmin = !auth.includes('-2')
      return {
        code: 200,
        message: 'success',
        data: isAdmin ? adminMenus : editorMenus,
      }
    },
  },
])
