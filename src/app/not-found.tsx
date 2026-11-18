import { type Metadata } from 'next'

import Page404Template from 'components/templates/Page404Template'

// Audit 4 C06: 404 pages used the home page title.
export const metadata: Metadata = {
  title: 'Page not found | Precondo',
  robots: { index: false, follow: true }
}

export default function NotFound() {
  return <Page404Template />
}
