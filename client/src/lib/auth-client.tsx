import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '@api/auth'

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
    plugins: [inferAdditionalFields<typeof auth>()],
})
