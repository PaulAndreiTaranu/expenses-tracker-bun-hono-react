import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client.tsx'
import { userQueryOptions } from '@/lib/auth-query'
import { queryClient } from '@/lib/query-client'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
    component: SignIn,
})

function SignIn() {
    const navigate = useNavigate()
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            const { error } = await authClient.signIn.email({
                email: value.email,
                password: value.password,
            })
            if (error) return
            await queryClient.invalidateQueries({
                queryKey: userQueryOptions.queryKey,
            })
            navigate({ to: '/' })
        },
    })
    return (
        <div className='flex items-center justify-center min-h-screen'>
            <Card className='w-md'>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Welcome back</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className='space-y-4'
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}>
                        <form.Field
                            name='email'
                            children={(field) => (
                                <div className='space-y-1'>
                                    <Label htmlFor={field.name}>Email</Label>
                                    <Input
                                        id={field.name}
                                        type='email'
                                        placeholder='you@example.com'
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />
                        <form.Field
                            name='password'
                            children={(field) => (
                                <div className='space-y-1'>
                                    <Label htmlFor={field.name}>Password</Label>
                                    <Input
                                        id={field.name}
                                        type='password'
                                        placeholder='••••••••'
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />
                        <Button className='w-full' type='submit'>
                            Sign In
                        </Button>
                        <p className='text-sm text-center text-muted-foreground'>
                            Don't have an account?{' '}
                            <Link to='/signup' className='underline'>
                                Sign up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
