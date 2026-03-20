import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'

function App() {
    const [totalSpent, setTotalSpent] = useState(0)

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
