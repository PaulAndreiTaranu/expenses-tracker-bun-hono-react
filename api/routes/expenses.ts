import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import * as z from 'zod'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { db } from '../lib/db'
import { expenses } from '../lib/schema'
import { and, desc, eq, sum } from 'drizzle-orm'

const createPostSchema = z.object({
    title: z.string().min(3).max(100),
    amount: z.number().int().positive(),
})

export const expensesRoute = new Hono()
    .use(AuthMiddleware)
    .get('/', async (c) => {
        const user = c.get('user')
        const rows = await db
            .select()
            .from(expenses)
            .where(eq(expenses.userId, user.id))
            .orderBy(desc(expenses.createdAt))
        return c.json({ expenses: rows })
    })
    .get('/total-spent', async (c) => {
        const user = c.get('user')
        const result = await db
            .select({ total: sum(expenses.amount) })
            .from(expenses)
            .where(eq(expenses.userId, user.id))
        const total = Number(result[0]?.total ?? 0)
        return c.json({ total })
    })
    .post('/', zValidator('json', createPostSchema), async (c) => {
        const user = c.get('user')
        const input = c.req.valid('json')
        const [expense] = await db
            .insert(expenses)
            .values({ ...input, userId: user.id })
            .returning()
        c.status(201)
        return c.json(expense)
    })
    .get('/:id{[0-9a-f-]+}', async (c) => {
        const user = c.get('user')
        const id = c.req.param('id')
        const [expense] = await db
            .select()
            .from(expenses)
            .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
        if (!expense) return c.notFound()
        return c.json({ expense })
    })
    .delete('/:id{[0-9a-f-]+}', async (c) => {
        const user = c.get('user')
        const id = c.req.param('id')
        const [deleted] = await db
            .delete(expenses)
            .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
            .returning()
        if (!deleted) return c.notFound()

        c.status(200)
        return c.json({ deletedExpense: deleted })
    })
