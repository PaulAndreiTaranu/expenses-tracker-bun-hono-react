import { hc } from 'hono/client'
import type { ApiType } from '@api/app'

const client = hc<ApiType>('/')

export const api = client.api
