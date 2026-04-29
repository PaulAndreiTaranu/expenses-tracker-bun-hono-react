import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import * as z from 'zod'
import { AuthMiddleware } from '../middleware/auth.middleware'

const expenseSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    title: z.string().min(3).max(100),
    amount: z.number().int().positive(),
})
const createPostSchema = expenseSchema.omit({ id: true, userId: true })
type Expense = z.infer<typeof expenseSchema>

const fakeExpenses: Expense[] = [
    { id: crypto.randomUUID(), userId: crypto.randomUUID(), title: 'Groceries', amount: 200 },
    { id: crypto.randomUUID(), userId: crypto.randomUUID(), title: 'Utilities', amount: 20 },
    { id: crypto.randomUUID(), userId: crypto.randomUUID(), title: 'Rent', amount: 720 },
    { id: crypto.randomUUID(), userId: crypto.randomUUID(), title: 'Claude', amount: 18 },
]

export const expensesRoute = new Hono()
    .use(AuthMiddleware)
    .get('/', async (c) => {
        const user = c.get('user')
        const expenses = fakeExpenses.filter((e) => e.userId === user.id)
        return c.json({ expenses })
    })
    .get('/total-spent', async (c) => {
        const user = c.get('user')
        const total = fakeExpenses
            .filter((e) => e.userId === user.id)
            .reduce((acc, expense) => acc + expense.amount, 0)
        return c.json({ total })
    })
    .post('/', zValidator('json', createPostSchema), async (c) => {
        const user = c.get('user')
        const input = c.req.valid('json')
        const expense: Expense = { ...input, id: crypto.randomUUID(), userId: user.id }
        fakeExpenses.push(expense)
        c.status(201)
        return c.json(expense)
    })
    .get('/:id{[0-9a-f-]+}', async (c) => {
        const user = c.get('user')
        const id = c.req.param('id')
        const expense = fakeExpenses.find((e) => e.id === id && e.userId === user.id)
        if (!expense) return c.notFound()
        return c.json({ expense })
    })
    .delete('/:id{[0-9a-f-]+}', async (c) => {
        const id = c.req.param('id')
        const user = c.get('user')
        const index = fakeExpenses.findIndex((e) => e.id === id && e.userId === user.id)
        if (index === -1) return c.notFound()
        const deletedExpense = fakeExpenses.splice(index, 1)[0]

        c.status(200)
        return c.json({ deletedExpense })
    })
