import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hc } from 'hono/client'
import { useEffect, useState } from 'react'
import { type ApiRoutes } from '../../api/app'

function App() {
    const [totalSpent, setTotalSpent] = useState(0)
    const client = hc<ApiRoutes>('/')

    useEffect(() => {
        async function fetchTotal() {
            const res = await client.api.v1.expenses['total-spent'].$get()
            const data = await res.json()
            setTotalSpent(data.total)
        }

        fetchTotal()
    }, [])

    return (
        <Card className='w-3xl mx-auto mt-10'>
            <CardHeader>
                <CardTitle>Total Spent</CardTitle>
                <CardDescription>The total amount that you've spent</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{totalSpent}</p>
            </CardContent>
        </Card>
    )
}

export default App
