import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const NavBar = () => {
    return (
        <nav>
            <div className='p-2 flex gap-2'>
                <Link to='/' className='[&.active]:font-bold'>
                    Home
                </Link>
                <Link to='/expenses' className='[&.active]:font-bold'>
                    Expenses
                </Link>
                <Link to='/create-expense' className='[&.active]:font-bold'>
                    Create
                </Link>
                <Link to='/about' className='[&.active]:font-bold'>
                    About
                </Link>
                <Link to='/signin' className='[&.active]:font-bold'>
                    Sign In
                </Link>
                <Link to='/signup' className='[&.active]:font-bold'>
                    Sign Up
                </Link>
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
