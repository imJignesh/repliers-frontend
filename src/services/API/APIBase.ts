import apiConfig from '@configs/api'

import { clearToken, expired, getToken } from 'utils/tokens'
import { getForwardedFrom } from 'utils/xff'

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

class APIBase {
  getAbsoluteUrl(url: string) {
    return url.startsWith('http') ? url : API_URL + url
  }

  async getHeaders() {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')

    const forwarded = await getForwardedFrom()
    if (forwarded) {
      headers.append('X-Forwarded-For-Token', forwarded.token)
      headers.append('X-Forwarded-From', forwarded.from)
    }

    if (typeof window === 'undefined') {
      try {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const cookieHeader = cookieStore.toString()
        if (cookieHeader) {
          headers.append('Cookie', cookieHeader)
        }
      } catch {
        // SSR context where next/headers might not be available or fails
      }
    }

    const token = await getToken()
    if (token && !expired(token)) {
      headers.append('Authorization', `Bearer ${token}`)
    }

    return headers
  }

  async fetchRaw(request: string, options?: RequestInit): Promise<Response> {
    const headers = await this.getHeaders()
    const fullUrl = this.getAbsoluteUrl(request)
    // eslint-disable-next-line no-console
    console.log('[APIBase] fetchRaw request:', request, 'fullUrl:', fullUrl)

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include'
      })
      if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`, request)
      }
      return response
    } catch (error: any) {
      console.error(
        '[APIBase] fetchRaw CATCH ERROR:',
        error.message,
        error.stack || error
      )
      if (error.message === '401') {
        console.error('Authorization header is invalid or expired.')
        clearToken()
      }
      // Instead of throwing the error, return a response-like fallback
      return new Response(null, { status: 503 })
    }
  }

  async fetchJSON<T>(request: string, options?: RequestInit): Promise<T> {
    let response: Response | null = null
    // there are few queries that has custom abort signal

    if (options?.signal) {
      response = await this.fetchRaw(request, options)
    } else {
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        apiConfig.apiRequestTimeout
      ) // 10 seconds

      response = await this.fetchRaw(request, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId))
    }

    // Always parse the JSON response
    let data: any = null
    try {
      data = await response.json()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // TODO: handle error
    }

    if (response?.ok) {
      return data as T
    } else {
      // Reject with an object containing both status and JSON body
      // WARN: fix NextJS error handling
      return Promise.reject({ status: response.status, data })
    }
  }
}

export default APIBase
