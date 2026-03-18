import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import * as z from 'zod'

const expenseSchema = z.object({
    id: z.uuid(),
    title: z.string().min(3).max(100),
    amount: z.number().int().positive(),
})
const createPostSchema = expenseSchema.omit({ id: true })
type Expense = z.infer<typeof expenseSchema>

const fakeExpenses: Expense[] = [
    { id: crypto.randomUUID(), title: 'Groceries', amount: 200 },
    { id: crypto.randomUUID(), title: 'Utilities', amount: 20 },
    { id: crypto.randomUUID(), title: 'Rent', amount: 720 },
    { id: crypto.randomUUID(), title: 'Claude', amount: 18 },
]

export const expensesRoute = new Hono()
    .get('/', async (c) => {
        return c.json({ expenses: fakeExpenses })
    })
    .post('/', zValidator('json', createPostSchema), async (c) => {
        const expense = c.req.valid('json')
        fakeExpenses.push({ ...expense, id: crypto.randomUUID() })
        c.status(201)
        return c.json(expense)
    })
    .get('/:id{[0-9a-f-]+}', async (c) => {
        const id = c.req.param('id')
        const expense = fakeExpenses.find((expense) => expense.id === id)
        if (!expense) return c.notFound()
        return c.json({ expense })
    })
    .delete('/:id{[0-9a-f-]+}', async (c) => {
        const id = c.req.param('id')
        const index = fakeExpenses.findIndex((expense) => expense.id === id)
        if (index === -1) return c.notFound()
        const deletedExpense = fakeExpenses.splice(index, 1)[0]

        c.status(200)
        return c.json({ deletedExpense })
    })
