import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/profile')({
    component: Profile,
})

function Profile() {
    const { data: session, isPending } = authClient.useSession()
    if (isPending) {
        return (
            <div className='w-full flex justify-center mt-10'>
                <Skeleton className='w-140 h-60' />
            </div>
        )
    }
    if (!session) {
        throw redirect({ to: '/signin' })
    }
    const { user } = session

    return (
        <div className='w-full flex justify-center mt-10'>
            <Card className='w-140'>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>

                <CardContent className='space-y-2'>
                    <Row label='Name' value={user.name} />
                    <Row label='Email' value={user.email} />
                    <Row label='Role' value={user.role ?? 'user'} />
                    <Row label='User ID' value={user.id} />
                </CardContent>
            </Card>
        </div>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex justify-between border-b py-2 last:border-0'>
            <span className='text-muted-foreground'>{label}</span>
            <span className='font-medium'>{value}</span>
        </div>
    )
}
