import http from '@/utils/http'
import type { MenuRoute } from '@vue3-mono/shared/types'

/** 获取当前用户可访问的菜单路由树 */
export function getMenuRoutes(): Promise<MenuRoute[]> {
  return http.get<MenuRoute[]>('/menu/routes')
}
