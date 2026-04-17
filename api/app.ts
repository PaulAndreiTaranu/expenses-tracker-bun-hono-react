import { Hono } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { auth } from './auth'
import { expensesRoute } from './routes/expenses'

type Variables = {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
}

const app = new Hono<{ Variables: Variables }>()

app.use(logger())

app.use(secureHeaders())

app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100,
        keyGenerator: (c) => c.req.header('x-forwarded-for') || '',
    }),
)

if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            origin: 'http://localhost:5173',
            credentials: true,
        }),
    )
}
app.use('/api/v1/*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
        return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('user', session.user)
    c.set('session', session.session)
    await next()
})
const apiRoutes = app.route('/api/v1/expenses', expensesRoute)
app.on(['GET', 'POST'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw)
})

app.use('/*', serveStatic({ root: './client/dist' }))
app.get('/*', serveStatic({ root: './client/dist', path: '/index.html' }))

export type ApiType = typeof apiRoutes
export default app
