import { Button } from '@/components/ui/button'
import { betterSignOut, userQueryOptions } from '@/lib/auth-query'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function LogoutButton() {
    const { data, isPending } = useQuery(userQueryOptions)
    const navigate = useNavigate()

    if (isPending || !data) return null

    async function handleLogout() {
        betterSignOut()
        navigate({ to: '/signin' })
    }

    return (
        <Button variant='link' onClick={handleLogout}>
            Logout
        </Button>
    )
}
