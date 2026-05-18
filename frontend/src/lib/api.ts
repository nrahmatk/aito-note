export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"
export const TOKEN_KEY = "notes_api_token"

export type User = {
  id: number
  name: string
  email: string
}

export type Note = {
  id: number
  title: string
  body: string | null
  created_at: string | null
  updated_at: string | null
}

export type AuthResponse = {
  user: User
  token: string
}

export type ApiResource<T> = {
  data: T
}

export type ApiCollection<T> = {
  data: T[]
}

export type NotePayload = {
  title: string
  body: string | null
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  }

  if (options.body) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? "The API request failed.",
      response.status,
      data?.errors
    )
  }

  return data as T
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const firstFieldError = error.errors
      ? Object.values(error.errors).flat().at(0)
      : undefined

    return firstFieldError ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string, rememberMe: boolean = false) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}
