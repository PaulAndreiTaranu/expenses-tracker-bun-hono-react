import { hc } from 'hono/client'
import type { ApiType } from '@api/app'

const client = hc<ApiType>(import.meta.env.VITE_API_URL || '/', {
    init: {
        credentials: 'include',
    },
})

export const api = client.api
