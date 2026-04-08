import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <Card className='w-3xl mx-auto mt-10'>
            <CardHeader>
                <CardTitle>Total Spent</CardTitle>
                <CardDescription>The total amount that you've spent</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
        </Card>
    )
}
