import { queryOptions } from '@tanstack/react-query'
import { authClient } from './auth-client'

export const userQueryOptions = queryOptions({
    queryKey: ['current-user'],
    queryFn: async () => {
        const { data, error } = await authClient.getSession()
        if (error) throw new Error(error.message)
        return data
    },
    staleTime: Infinity,
})
