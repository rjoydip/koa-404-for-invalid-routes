import type Koa from 'koa'
import consola from 'consola'
import { pathToRegexp } from 'path-to-regexp'
import { safeParse } from 'valibot'
import { getUser, getUsers, isDBUp, isRedisUp, pingDB, setUser } from './db'
import { UserSchema } from './schema'

export const routes = [
  {
    name: 'Root',
    path: '/',
    method: 'GET',
    regex: pathToRegexp('/'),
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = 200
      ctx.body = {
        message: 'Root',
        data: {},
        error: {},
      }
    },
  },
  {
    name: 'Status',
    path: '/status',
    method: 'GET',
    regex: pathToRegexp('/status'),
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      const ping = await pingDB()
      ctx.status = 200
      ctx.body = {
        message: 'Status',
        data: {
          status: !!ping,
        },
        error: {},
      }
    },
  },
  {
    name: 'Health',
    path: '/health',
    method: 'GET',
    regex: pathToRegexp('/health'),
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      const db = await isDBUp()
      const redis = await isRedisUp()
      ctx.status = 200
      ctx.body = {
        message: 'Health',
        data: {
          db,
          redis,
        },
        error: {},
      }
    },
  },
  {
    name: 'GetUsers',
    path: '/users',
    method: 'GET',
    regex: pathToRegexp('/users'),
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      const users = await getUsers()
      ctx.status = 200
      ctx.body = {
        message: 'All users',
        data: users,
        error: {},
      }
    },
  },
  {
    name: 'GetUser',
    path: '/user/:id',
    method: 'GET',
    regex: pathToRegexp('/user/:id'),
    middleware: [async (ctx: Koa.Context, next: Koa.Next) => {
      await next()
      consola.info('USER ID: ', ctx.params.id)
    }],
    handler: async (ctx: Koa.Context) => {
      const user = await getUser(ctx.params.id)
      if (user) {
        ctx.status = 200
        ctx.body = {
          message: 'User data',
          data: user,
          error: {},
        }
      }
      else {
        ctx.status = 422
        ctx.body = {
          message: 'User ID Not Valid',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: 'Invalid user id',
          },
        }
      }
    },
  },
  {
    name: 'PostUser',
    path: '/user',
    method: 'POST',
    regex: pathToRegexp('/user'),
    middleware: [async (ctx: Koa.Context, next: Koa.Next) => {
      const payload = ctx.request.body
      const result = safeParse(UserSchema, { _id: '', ...payload })
      if (result.success) {
        await next()
      }
      else {
        ctx.status = 422
        ctx.body = {
          message: 'User Data Invalid',
          data: {},
          error: result.issues,
        }
      }
    }],
    handler: async (ctx: Koa.Context) => {
      const payload = await setUser(ctx.request.body)
      ctx.status = 200
      ctx.body = {
        message: 'User Data Stored',
        data: payload,
        error: {},
      }
    },
  },
]
