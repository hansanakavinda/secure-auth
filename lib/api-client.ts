/**
 * Lightweight wrapper around fetch for JSON API calls.
 * Handles headers, JSON serialization, and error extraction.
 */

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, any>
  headers?: Record<string, string>
}

export class ApiClient {
  static async request<T = any>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<{ ok: boolean; data?: T; error?: string }> {
    const { method = 'GET', data, headers = {} } = options

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      // Try to extract error from response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || `HTTP ${response.status}`
        return { ok: false, error: errorMessage }
      }

      const responseData = await response.json().catch(() => null)
      return { ok: true, data: responseData }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { ok: false, error: message }
    }
  }

  static get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  static post<T = any>(endpoint: string, data?: Record<string, any>, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'POST', data, headers })
  }

  static put<T = any>(endpoint: string, data?: Record<string, any>, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'PUT', data, headers })
  }

  static delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}
