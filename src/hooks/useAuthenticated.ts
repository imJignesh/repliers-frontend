import { useEffect, useState } from 'react'
import cookies from 'js-cookie'
import { useUser } from 'providers/UserProvider'

/**
 * Hook to check if user is authenticated via login or cookie
 * Checks both logged-in state and the 'rauthenticated' cookie
 * Updates on client-side only to avoid SSR issues
 */
export const useAuthenticated = () => {
    const { logged } = useUser()
    const [cookieAuth, setCookieAuth] = useState(false)

    useEffect(() => {
        // Check cookie on client side only
        const checkCookie = () => {
            const hasAuthCookie = cookies.get('rauthenticated') === 'true'
            setCookieAuth(hasAuthCookie)
        }

        // Check immediately
        checkCookie()

        // Check periodically in case cookie changes
        const interval = setInterval(checkCookie, 1000)

        return () => clearInterval(interval)
    }, [])

    return logged || cookieAuth
}
