import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { expensesRoute } from './routes/expenses'

const app = new Hono()
app.use(logger())

const apiRoutes = app.basePath('/api').route('/v1/expenses', expensesRoute)

export type ApiRoutes = typeof apiRoutes
export default app
