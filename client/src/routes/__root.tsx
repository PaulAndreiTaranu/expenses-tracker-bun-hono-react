import { LogoutButton } from '@/components/logout-button'
import { userQueryOptions } from '@/lib/auth-query'
import { useQuery } from '@tanstack/react-query'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const NavBar = () => {
    const { data, isPending } = useQuery(userQueryOptions)
    const isLoggedIn = !!data

    return (
        <nav>
            <div className='p-2 ml-10 flex gap-2 max-w-2xl'>
                <Link to='/' className='[&.active]:font-bold'>
                    Home
                </Link>
                <Link to='/about' className='[&.active]:font-bold'>
                    About
                </Link>
                {isPending ? null : isLoggedIn ? (
                    <>
                        <Link to='/expenses' className='[&.active]:font-bold'>
                            Expenses
                        </Link>
                        <Link to='/create-expense' className='[&.active]:font-bold'>
                            Create
                        </Link>
                        <Link to='/profile' className='[&.active]:font-bold'>
                            Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to='/signin' className='[&.active]:font-bold'>
                            Sign In
                        </Link>
                        <Link to='/signup' className='[&.active]:font-bold'>
                            Sign Up
                        </Link>
                    </>
                )}
                <LogoutButton />
            </div>
        </nav>
    )
}

const RootLayout = () => (
    <>
        <NavBar />
        <hr />
        <Outlet />
        {/* <TanStackRouterDevtools /> */}
    </>
)

export const Route = createRootRoute({ component: RootLayout })
