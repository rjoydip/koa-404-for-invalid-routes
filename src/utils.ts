import type Router from 'koa-router'
import type { RegisteredRoutes } from './types'

// Function to get all registered routes
export function getRegisteredRoutes(router: Router<any>): RegisteredRoutes[] {
  return router.stack.map((layer) => {
    return {
      method: layer.methods,
      path: layer.path,
      regexp: layer.regexp,
    }
  })
}
