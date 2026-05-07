import { useCallback } from 'react'

export const useScrollToContact = () => {
  const scrollToContact = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    
    const element = document.getElementById('contact-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.classList.remove('highlight-form')
      void element.offsetWidth // trigger reflow
      element.classList.add('highlight-form')
      setTimeout(() => {
        element.classList.remove('highlight-form')
      }, 1500)
    }
  }, [])

  return scrollToContact
}
