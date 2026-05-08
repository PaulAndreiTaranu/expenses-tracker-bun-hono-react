import { userQueryOptions } from '@/lib/auth-query'
import { queryClient } from '@/lib/query-client'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({}) => {
        const data = await queryClient.ensureQueryData(userQueryOptions)
        if (!data) throw redirect({ to: '/signin' })
        return
    },
    component: Outlet,
})
