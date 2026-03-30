import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { api } from './lib/api'
import { useQuery } from '@tanstack/react-query'

function App() {
    const [totalSpent, setTotalSpent] = useState(0)

    async function getTotalSpent() {
        const res = await api.v1.expenses['total-spent'].$get()
        if (!res.ok) {
            throw new Error('server errro')
        }
        const data = await res.json()
        return data
    }

    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['get-total-spent'],
        queryFn: getTotalSpent,
    })

    if (error) return 'An error has occured: ' + error.message

    return (
        <Card className='w-3xl mx-auto mt-10'>
            <CardHeader>
                <CardTitle>Total Spent</CardTitle>
                <CardDescription>The total amount that you've spent</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{isPending ? '...' : data.total}</p>
            </CardContent>
        </Card>
    )
}

export default App
