import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { betterSignUp } from '@/lib/auth-query'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
    component: SignUp,
})

function SignUp() {
    const navigate = useNavigate()
    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            await betterSignUp(value.name, value.email, value.password)
            navigate({ to: '/' })
        },
    })
    return (
        <div className='flex items-center justify-center min-h-screen'>
            <Card className='w-md'>
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create your account</CardDescription>
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
                            name='name'
                            children={(field) => (
                                <div className='space-y-1'>
                                    <Label htmlFor={field.name}>Name</Label>
                                    <Input
                                        id={field.name}
                                        type='text'
                                        placeholder='John Doe'
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />
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
                            Sign Up
                        </Button>
                        <p className='text-sm text-center text-muted-foreground'>
                            Already have an account?{' '}
                            <Link to='/signin' className='underline'>
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
