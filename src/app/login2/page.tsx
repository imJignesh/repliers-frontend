import { Suspense } from 'react'

import { PageTemplate } from '@templates'
import { ClientLoginPageContent } from '@pages/login'

const LoginPage = () => {
  return (
    <PageTemplate noHeader noFooter>
      <Suspense fallback={null}>
        <ClientLoginPageContent />
      </Suspense>
    </PageTemplate>
  )
}

export default LoginPage
