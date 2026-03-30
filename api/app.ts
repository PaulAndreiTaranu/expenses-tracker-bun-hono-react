import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'
import { expensesRoute } from './routes/expenses'

const app = new Hono()

app.use(logger())

const apiRoutes = app.route('api/v1/expenses', expensesRoute)

app.use('/*', serveStatic({ root: './client/dist' }))
app.get('/*', serveStatic({ root: './client/dist', path: '/index.html' }))

export type ApiType = typeof apiRoutes
export default app
