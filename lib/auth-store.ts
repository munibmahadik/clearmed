import { hash, compare } from "bcryptjs"

export interface StoredUser {
  email: string
  passwordHash: string
  name?: string
}

// In-memory user store for email/password. Use globalThis so it survives HMR and is shared.
const globalForAuth = globalThis as unknown as { authStore?: Map<string, StoredUser> }
const users = globalForAuth.authStore ?? new Map<string, StoredUser>()
if (!globalForAuth.authStore) globalForAuth.authStore = users

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return { ok: false, error: "Email is required" }
  if (!password || password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters" }
  if (users.has(normalized)) return { ok: false, error: "An account with this email already exists" }
  const passwordHash = await hash(password, 12)
  users.set(normalized, { email: normalized, passwordHash, name: name?.trim() || undefined })
  return { ok: true }
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase()
  const user = users.get(normalized)
  if (!user) return null
  const valid = await compare(password, user.passwordHash)
  return valid ? user : null
}
