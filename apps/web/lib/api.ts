export const API_URL = "http://localhost:3001"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken() ?? ""}`,
  }
}

export function getTokenPayload(): { sub: string; email: string } | null {
  const token = getToken()
  if (!token) return null
  try {
    const part = token.split(".")[1]
    if (!part) return null
    return JSON.parse(atob(part)) as { sub: string; email: string }
  } catch {
    return null
  }
}
