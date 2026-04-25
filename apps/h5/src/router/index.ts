import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupRouterGuards } from './guards'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL ?? '/'),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved || { top: 0 }
  }
})

setupRouterGuards(router)

export { routes }
