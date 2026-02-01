export interface ScanEntry {
  executionId: string
  createdAt: number
}

const globalForHistory = globalThis as unknown as { historyStore?: Map<string, ScanEntry[]> }
const byUser = globalForHistory.historyStore ?? new Map<string, ScanEntry[]>()
if (!globalForHistory.historyStore) globalForHistory.historyStore = byUser

export function addScan(userEmail: string, executionId: string): void {
  const key = userEmail.trim().toLowerCase()
  if (!key || !executionId) return
  const list = byUser.get(key) ?? []
  list.unshift({ executionId, createdAt: Date.now() })
  byUser.set(key, list)
}

export function getScans(userEmail: string): ScanEntry[] {
  const key = userEmail.trim().toLowerCase()
  if (!key) return []
  return byUser.get(key) ?? []
}
