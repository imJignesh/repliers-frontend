import { permanentRedirect } from 'next/navigation'

import routes from '@configs/routes'

// Audit R02 (Nov 2026): the resale app no longer has its own terms page
// (it was an unfinished draft). Old links go to the site-wide Terms of
// Service that the footer already uses.
const TermsOfUsePage = () => permanentRedirect(routes.terms)

export default TermsOfUsePage
