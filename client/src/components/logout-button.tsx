import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { userQueryOptions } from '@/lib/auth-query'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function LogoutButton() {
    const { data, isPending } = useQuery(userQueryOptions)
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    if (isPending || !data) return null

    async function handleLogout() {
        await authClient.signOut()
        queryClient.setQueryData(userQueryOptions.queryKey, null)
        navigate({ to: '/signin' })
    }

    return (
        <Button variant='link' onClick={handleLogout}>
            Logout
        </Button>
    )
}
