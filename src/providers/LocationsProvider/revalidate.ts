'use server'

import { revalidateTag } from 'next/cache'

export default async function revalidate() {
  (revalidateTag as any)('locations')
}
