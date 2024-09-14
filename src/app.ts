import type { MethodTypes } from './types'
import consola from 'consola'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ip from 'koa-ip'
import json from 'koa-json'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import { routes } from './routers'
import { getRegisteredRoutes } from './utils'

// Aapplication instances
const db = new Map()
const app = new Koa({
  asyncLocalStorage: false,
})
const router = new Router()

/* External middleware - [START] */
app.use(json({
  pretty: true,
  spaces: 2,
}))
app.use(helmet())
app.use(koaBody())
app.use(ip({
  whitelist: ['127.0.0.1'],
  blacklist: ['192.168.0.*', '8.8.8.[0-3]'],
  handler: async (ctx: Koa.Context) => {
    ctx.status = 403
  },
}))
app.use(ratelimit({
  driver: 'memory',
  db,
  duration: 60000,
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  id: (ctx: Koa.Context) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total',
  },
  max: 100,
  disableHeader: false,
}))
/* External middleware - [END] */

// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  consola.info(`> ${ctx.method} ${ctx.url} - ${ms}ms`)
  ctx.set('X-Response-Time', `${ms}ms`)
})

// Middleware to check if the incoming URL matches custom routes
app.use(async (ctx, next) => {
  const requestedUrl = ctx.request.path

  // Print all routes
  const registeredRoutes = getRegisteredRoutes(router)

  // Check if the requested URL matches any route regex pattern
  const routeMatched = registeredRoutes.some(route => route.regexp.test(requestedUrl))

  if (!routeMatched) {
    ctx.status = 404
    ctx.body = { message: 'Route Not Found' }
  }
  else {
    await next() // Proceed to the next middleware if route matches
  }
})

// Authentication middleware
app.use(async (_, next) => {
  consola.ready('Authentication Middleware')
  await next()
})

// Custom middlewares
routes.map(r => router[r.method.toLocaleLowerCase() as MethodTypes](r.name, r.path, ...r.middleware, r.handler))

// Apply the defined routes
app.use(router.routes())
app.use(router.allowedMethods())

export { app }
export default app
