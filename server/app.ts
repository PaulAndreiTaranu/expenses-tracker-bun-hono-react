import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { expensesRoute } from './routes/expenses'

const app = new Hono()
app.use(logger())

app.get('/', (c) => {
    return c.text('Hello Hono!')
})
app.route('/api/v1/expenses', expensesRoute)

export default app
