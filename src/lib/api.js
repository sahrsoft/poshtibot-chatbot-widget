const BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const { retries = 2, ...fetchOptions } = options

  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new ApiError(
          body?.error || `Request failed with status ${res.status}`,
          res.status,
          body
        )
      }

      return await res.json()
    } catch (err) {
      lastError = err
      if (err instanceof ApiError && err.status < 500) break
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError
}

export const api = {
  get: (endpoint, options) =>
    request(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body, options) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    })
}

export { ApiError }
