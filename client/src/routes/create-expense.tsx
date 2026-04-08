import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/create-expense')({
    component: CreateExpense,
})

function CreateExpense() {
    const navigate = useNavigate()

    const form = useForm({
        defaultValues: {
            title: 'rent, food, etc...',
            amount: 10,
        },
        onSubmit: async ({ value }) => {
            const res = await api.v1.expenses.$post({
                json: { title: value.title, amount: value.amount },
            })

            if (!res.ok) {
                throw new Error('Server Error')
            }
            navigate({ to: '/expenses' })
        },
    })
    return (
        <div className='max-w-2xl mx-auto mt-5 space-y-5'>
            <h2>Create Expense</h2>
            <form
                className='space-y-2'
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}>
                <form.Field
                    name='title'
                    validators={{
                        onChange: ({ value }) =>
                            value.length < 3 ? 'Title must be at least 3 characters' : undefined,
                    }}
                    children={(field) => (
                        <div className='space-y-1'>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input
                                type='text'
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className='text-sm text-red-500'>
                                    {field.state.meta.errors.join(', ')}
                                </p>
                            )}
                        </div>
                    )}
                />
                <form.Field
                    name='amount'
                    validators={{
                        onChange: ({ value }) =>
                            value <= 0 ? 'Amount  must be positive' : undefined,
                    }}
                    children={(field) => (
                        <div className='space-y-1'>
                            <Label htmlFor={field.name}>Amount</Label>
                            <Input
                                type='number'
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className='text-sm text-red-500'>
                                    {field.state.meta.errors.join(', ')}
                                </p>
                            )}
                        </div>
                    )}
                />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <>
                            <Button className='mt-4' type='submit' disabled={!canSubmit}>
                                {isSubmitting ? '...' : 'Create Expense'}
                            </Button>
                            <Button
                                className='mt-4 ml-4'
                                type='reset'
                                onClick={(e) => {
                                    // Avoid unexpected resets of form elements (especially <select> elements)
                                    e.preventDefault()
                                    form.reset()
                                }}>
                                Reset
                            </Button>
                        </>
                    )}
                />
            </form>
        </div>
    )
}
