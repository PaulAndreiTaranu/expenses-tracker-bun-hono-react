import { queryOptions } from '@tanstack/react-query'
import { authClient } from './auth-client'
import { queryClient } from './query-client'

export const userQueryOptions = queryOptions({
    queryKey: ['current-user'],
    queryFn: async () => {
        const { data, error } = await authClient.getSession()
        if (error) throw new Error(error.message)
        return data
    },
    staleTime: Infinity,
})

export async function betterSignIn(email: string, password: string) {
    const { error } = await authClient.signIn.email({ email, password })
    if (error) throw new Error(error.message)
    await queryClient.invalidateQueries({ queryKey: userQueryOptions.queryKey })
}

export async function betterSignUp(name: string, email: string, password: string) {
    const { error } = await authClient.signUp.email({ name, email, password })
    if (error) throw new Error(error.message)
    await queryClient.invalidateQueries({ queryKey: userQueryOptions.queryKey })
}

export async function betterSignOut() {
    await authClient.signOut()
    queryClient.setQueryData(userQueryOptions.queryKey, null)
}
