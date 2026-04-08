import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
export const Route = createFileRoute('/expenses')({
    component: Expenses,
})

function Expenses() {
    async function getAllExpenses() {
        const res = await api.v1.expenses.$get()
        if (!res.ok) {
            throw new Error('server errro')
        }
        const data = await res.json()
        return data
    }

    const { isPending, error, data } = useQuery({
        queryKey: ['get-all-expenses'],
        queryFn: getAllExpenses,
    })

    if (error) return 'An error has occured: ' + error.message

    return (
        <div className='w-full'>
            <Table className='w-140 mx-auto mt-10'>
                <TableCaption>A list of your expenses.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className='w-35'>Id</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isPending
                        ? Array(3)
                              .fill(0)
                              .map((_, i) => (
                                  <TableRow key={i}>
                                      <TableCell className='font-medium'>
                                          <Skeleton className='h-4' />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className='h-4' />
                                      </TableCell>
                                      <TableCell className='text-right'>
                                          <Skeleton className='h-4' />
                                      </TableCell>
                                  </TableRow>
                              ))
                        : data?.expenses.map((expense, index) => (
                              <TableRow key={expense.id}>
                                  <TableCell className='font-medium'>{++index}</TableCell>
                                  <TableCell>{expense.title}</TableCell>
                                  <TableCell className='text-right'>{expense.amount}</TableCell>
                              </TableRow>
                          ))}
                </TableBody>
            </Table>
        </div>
    )
}
