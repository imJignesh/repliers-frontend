import { permanentRedirect } from 'next/navigation'

import routes from '@configs/routes'

// Audit R02 (Nov 2026): the resale app no longer has its own privacy page
// (it was an unfinished draft). Old links go to the site-wide policy that
// the footer already uses.
const PrivacyPolicyPage = () => permanentRedirect(routes.privacy)

export default PrivacyPolicyPage
