import { User } from "./types"

const BASE_URL = (process.env.NEXT_PUBLIC_EVALUATIONS_API_URL ?? "").replace(
  /\/+$/,
  ""
)
const API_KEY = process.env.NEXT_PUBLIC_EVALUATIONS_API_KEY ?? ""

export const isRemoteStorageEnabled = BASE_URL !== ""

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      ...init?.headers,
    },
  })
  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(`API ${response.status}: ${message || response.statusText}`)
  }
  return response
}

export async function fetchRemoteUsers(): Promise<User[]> {
  const response = await request("/users")
  const body = (await response.json()) as { users?: User[] }
  return body.users ?? []
}

export async function putRemoteUser(user: User): Promise<void> {
  await request(`/users/${encodeURIComponent(user.id)}`, {
    method: "PUT",
    body: JSON.stringify(user),
  })
}
