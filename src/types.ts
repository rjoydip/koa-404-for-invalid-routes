import type v from 'valibot'
import type { UserSchema } from './schema'

export type MethodTypes = 'get' | 'post' | 'put' | 'delete' | 'all'
export type User = v.InferOutput<typeof UserSchema>
export interface RegisteredRoutes {
  method: string[]
  path: string
  regexp: RegExp
}
export interface Health {
  id: string
  tool: 'db' | 'redis'
  up: boolean
}
