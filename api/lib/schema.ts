import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const expenses = pgTable('expenses', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id').notNull(),
    title: varchar('title', { length: 100 }).notNull(),
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})
