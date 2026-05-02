'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * YouTube-style top progress bar for instant navigation feedback.
 * Intercepts link clicks and shows a slim animated bar at the top of the viewport.
 */
const TopProgressBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevUrl = useRef<string>('')

  // Build a stable URL string from pathname + searchParams
  const currentUrl = `${pathname}?${searchParams.toString()}`

  const startProgress = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setState('loading')
  }, [])

  const completeProgress = useCallback(() => {
    setState('complete')
    timeoutRef.current = setTimeout(() => {
      setState('idle')
    }, 300) // Fade out duration
  }, [])

  // Detect route changes (pathname or search params changed = navigation complete)
  useEffect(() => {
    if (prevUrl.current && prevUrl.current !== currentUrl) {
      completeProgress()
    }
    prevUrl.current = currentUrl
  }, [currentUrl, completeProgress])

  // Intercept link clicks to start progress immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Skip external links, hash links, mailto, tel, etc.
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return
      }

      // Only trigger for internal navigation that will actually change the URL
      if (href !== window.location.pathname + window.location.search) {
        startProgress()
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [startProgress])

  // Also intercept history.pushState for programmatic navigation (router.push)
  useEffect(() => {
    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    history.pushState = function (...args) {
      startProgress()
      return originalPushState(...args)
    }

    history.replaceState = function (...args) {
      // Only show progress for URL changes, not for internal React state
      const newUrl = args[2]
      if (newUrl && typeof newUrl === 'string' && newUrl !== window.location.href) {
        startProgress()
      }
      return originalReplaceState(...args)
    }

    return () => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [startProgress])

  // Safety net: auto-complete after 8s to prevent stuck states
  useEffect(() => {
    if (state !== 'loading') return
    const safetyTimeout = setTimeout(() => {
      completeProgress()
    }, 8000)
    return () => clearTimeout(safetyTimeout)
  }, [state, completeProgress])

  if (state === 'idle') return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: state === 'complete' ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #2196F3, #42A5F5, #2196F3)',
          backgroundSize: '200% 100%',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 8px rgba(33, 150, 243, 0.4)',
          width: state === 'loading' ? '85%' : '100%',
          transition: state === 'loading'
            ? 'width 8s cubic-bezier(0.1, 0.05, 0, 1)'
            : 'width 0.2s ease-out',
          animation: 'topbar-shimmer 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes topbar-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export default TopProgressBar
