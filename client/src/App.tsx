import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

function App() {
    const [totalSpent, setTotalSpent] = useState(0)

    useEffect(() => {
        async function fetchTotal() {
            const res = await fetch('/api/v1/expenses/total-spent')
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
