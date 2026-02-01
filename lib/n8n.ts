/**
 * n8n API client for the ClearMED pipeline.
 * Used to trigger the "process doctor's note" workflow and fetch execution results.
 */

const getBaseUrl = () => {
  const url = process.env.N8N_BASE_URL
  if (!url) throw new Error("N8N_BASE_URL is not set")
  return url.replace(/\/$/, "")
}

const getApiKey = () => {
  const key = process.env.N8N_API_KEY
  if (!key) throw new Error("N8N_API_KEY is not set")
  return key
}

export type TriggerWorkflowOptions = {
  workflowId: string
  /** Payload to send to the workflow (e.g. image base64, text). */
  data?: Record<string, unknown>
}

export type TriggerWorkflowResult = {
  executionId: string
  /** If workflow returns data synchronously, it may be here. */
  data?: unknown
}

/** In-memory cache for webhook results (used when n8n API is unavailable, e.g. free trial). */
const webhookResultCache = new Map<string, ScanResultPayload>()

export const WEBHOOK_EXECUTION_PREFIX = "wh-"

/**
 * Call n8n webhook directly. Medical Agent Backend expects multipart/form-data with image.
 * Works on free trial (no API needed). Returns cached executionId.
 */
export async function triggerViaWebhook(formData: FormData): Promise<TriggerWorkflowResult> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) throw new Error("N8N_WEBHOOK_URL is not set")

  const res = await fetch(webhookUrl.trim(), {
    method: "POST",
    body: formData,
  })
  const text = await res.text()
  if (!res.ok) {

    throw new Error(`n8n webhook failed (${res.status}): ${text}`)
  }

  if (!text || text.trim() === "") {
    throw new Error("n8n webhook returned empty response. Check Respond to Webhook node config and that Prepare Response outputs valid JSON.")

  }

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(text) as Record<string, unknown>

  } catch (e) {
    const preview = text.length > 200 ? `${text.slice(0, 200)}...` : text
    throw new Error(`n8n webhook returned invalid JSON (Unexpected end of JSON input). Raw response preview: ${preview}`)

  }
  const payload = parseWebhookResponse(raw)

  const executionId = `${WEBHOOK_EXECUTION_PREFIX}${crypto.randomUUID()}`
  webhookResultCache.set(executionId, payload)
  setTimeout(() => webhookResultCache.delete(executionId), 5 * 60 * 1000)

  return { executionId, data: payload }
}

function parseWebhookResponse(raw: Record<string, unknown>): ScanResultPayload {
  // n8n "First Incoming Item" may send item.json at top level or wrapped as { json: { ... } }
  const obj = (raw.json && typeof raw.json === "object" ? raw.json : raw) as RawMedicalOutput

  // App shape { checklist, summary?, audioUrl?, audio_base64? }
  if (obj.checklist && Array.isArray(obj.checklist)) {
    const checklist = obj.checklist.map((c) =>
      typeof c === "string" ? { text: c, checked: true } : { text: (c as { text?: string }).text ?? String(c), checked: (c as { checked?: boolean }).checked ?? true }
    )
    return {
      checklist,
      summary: (obj.summary as string) ?? (obj.text as string) ?? "",
      audioUrl: (obj.audio_url as string) ?? (obj.audioUrl as string),
      audio_base64: (obj.audio_base64 as string) ?? undefined,
      verifiedSafe: obj.verifiedSafe === false ? false : true,
    }
  }

  // Raw medical { Diagnosis, Medications, Warning Signs }
  if (obj.Diagnosis ?? obj.Medications ?? obj.Warning_Signs ?? obj.WarningSigns ?? obj["Warning Signs"]) {
    return rawToScanResult(obj)
  }

  return rawToScanResult(obj)
}

export function getWebhookCachedResult(executionId: string): ScanResultPayload | null {
  return webhookResultCache.get(executionId) ?? null
}

/**
 * Trigger an n8n workflow by ID. Returns the execution ID so you can poll for results.
 * Requires paid plan; use N8N_WEBHOOK_URL for free trial.
 */
export async function triggerWorkflow({
  workflowId,
  data = {},
}: TriggerWorkflowOptions): Promise<TriggerWorkflowResult> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()
  const res = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": apiKey,
    },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`n8n trigger failed (${res.status}): ${text}`)
  }
  const json = (await res.json()) as { data?: { executionId?: string; id?: string }; executionId?: string; id?: string }
  const executionId = json.data?.executionId ?? json.data?.id ?? json.executionId ?? json.id
  if (!executionId) throw new Error("n8n response missing execution ID")
  return {
    executionId: String(executionId),
    data: json.data,
  }
}

export type GetExecutionResult = {
  id: string
  finished: boolean
  status: string
  data?: { resultData?: { runData?: Record<string, unknown[]> } }
}

/**
 * Fetch an execution by ID. Use includeData: true to get workflow output.
 */
export async function getExecution(
  executionId: string,
  options?: { includeData?: boolean }
): Promise<GetExecutionResult> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()
  const qs = options?.includeData ? "?includeData=true" : ""
  const res = await fetch(`${baseUrl}/api/v1/executions/${executionId}${qs}`, {
    headers: {
      "X-N8N-API-KEY": apiKey,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`n8n getExecution failed (${res.status}): ${text}`)
  }
  return res.json() as Promise<GetExecutionResult>
}

/** Shape we expect from the "process doctor's note" workflow output (last node). */
export type ScanResultPayload = {
  checklist?: { text: string; checked: boolean }[]
  summary?: string
  audioUrl?: string
  /** Base64-encoded MP3 from n8n (ElevenLabs); use base64ToBlobUrl() for playback */
  audio_base64?: string
  verifiedSafe?: boolean
}

/** Raw medical extraction from LLM (current workflow Code node output). */
type RawMedicalOutput = {
  Diagnosis?: string
  Medications?: Array<{ Name?: string; Dosage?: string; Frequency?: string } | string>
  Warning_Signs?: string[]
  WarningSigns?: string[]
  "Warning Signs"?: string[]
  [key: string]: unknown
}

/**
 * Convert raw medical output to app shape. Used when workflow outputs
 * { Diagnosis, Medications, Warning Signs } instead of { checklist, summary, verifiedSafe }.
 */
function rawToScanResult(raw: RawMedicalOutput): ScanResultPayload {
  const meds = raw.Medications ?? []
  const warnings = raw.Warning_Signs ?? raw.WarningSigns ?? raw["Warning Signs"] ?? []
  const checklist: { text: string; checked: boolean }[] = []

  meds.forEach((m) => {
    const item = typeof m === "string" ? m : [m.Name, m.Dosage, m.Frequency].filter(Boolean).join(" ")
    if (item) checklist.push({ text: `Take: ${item}`, checked: true })
  })
  warnings.forEach((w) => {
    if (w) checklist.push({ text: `Watch for: ${w}`, checked: false })
  })
  if (raw.Diagnosis) checklist.unshift({ text: `Diagnosis: ${raw.Diagnosis}`, checked: true })
  if (checklist.length === 0) checklist.push({ text: "No specific action items extracted", checked: false })

  const summary =
    typeof raw.Diagnosis === "string"
      ? raw.Diagnosis + (meds.length ? ` Take medications as prescribed.` : "") + (warnings.length ? ` Watch for warning signs.` : "")
      : "Medical note processed. See checklist for details."
  const verifiedSafe = warnings.length === 0

  return { checklist, summary, verifiedSafe }
}

/**
 * Parse n8n execution result into the shape ResultsCard expects.
 * Supports both: (1) app shape { checklist, summary, verifiedSafe, audioUrl }
 * and (2) raw medical shape { Diagnosis, Medications, Warning_Signs }.
 */
export function parseScanResultFromExecution(exec: GetExecutionResult): ScanResultPayload | null {
  if (!exec.finished || !exec.data?.resultData?.runData) return null
  const runData = exec.data.resultData.runData

  // Prefer "Prepare Response" (final payload) or other output nodes
  const preferredOrder = ["Prepare Response", "Prepare Response1", "Transform to Patient-Friendly Format", "Code in JavaScript", "HTTP Request"]
  let lastOutput: unknown = null
  let lastNodeName: string | null = null

  type RunItem = { data?: { main?: Array<Array<{ json?: unknown }>> } }
  for (const name of preferredOrder) {
    const runs = runData[name] as RunItem[] | undefined
    const item = runs?.[0]
    if (item?.data?.main?.[0]?.[0]?.json) {
      lastOutput = item.data.main[0][0].json
      lastNodeName = name
      break
    }
  }
  if (!lastOutput && lastNodeName === null) {
    const lastKey = Object.keys(runData).pop()
    if (lastKey) {
      const lastRuns = runData[lastKey] as RunItem[] | undefined
      const lastItem = lastRuns?.[0]
      lastOutput = lastItem?.data?.main?.[0]?.[0]?.json ?? lastItem?.data?.main?.[0]?.[0]
      lastNodeName = lastKey
    }
  }

  if (!lastOutput || typeof lastOutput !== "object") return null

  const rawObj = lastOutput as Record<string, unknown>
  // Unwrap if n8n returned full item { json: {...} }
  const obj = (rawObj.json && typeof rawObj.json === "object" ? rawObj.json : rawObj) as Record<string, unknown>

  if (obj.checklist && Array.isArray(obj.checklist)) {
    const checklist = (obj.checklist as unknown[]).map((c) =>
      typeof c === "string" ? { text: c, checked: true } : { text: (c as { text?: string }).text ?? String(c), checked: (c as { checked?: boolean }).checked ?? true }
    )
    return {
      checklist,
      summary: (obj.summary as string) ?? "",
      audioUrl: (obj.audio_url as string) ?? (obj.audioUrl as string),
      audio_base64: (obj.audio_base64 as string) ?? undefined,
      verifiedSafe: obj.verifiedSafe === false ? false : true,
    }
  }

  const raw = obj as RawMedicalOutput
  if (raw.Diagnosis ?? raw.Medications ?? raw.Warning_Signs ?? raw.WarningSigns ?? raw["Warning Signs"]) {
    return rawToScanResult(raw)
  }

  return null
}

const DEMO_EXECUTION_ID = "demo"

const demoScanResult: ScanResultPayload = {
  checklist: [
    { text: "Take medication with food", checked: true },
    { text: "Drink plenty of water daily", checked: true },
    { text: "Schedule follow-up in 2 weeks", checked: false },
    { text: "Rest and avoid heavy lifting", checked: true },
  ],
  summary: "Demo summary. Configure n8n to get real results.",
  verifiedSafe: true,
}

/**
 * Get scan result for the results page (server-side). Handles demo and real n8n execution.
 */
export async function getScanResult(executionId: string | null): Promise<ScanResultPayload | null> {
  if (!executionId) return null
  if (executionId === DEMO_EXECUTION_ID) return demoScanResult
  if (executionId.startsWith(WEBHOOK_EXECUTION_PREFIX)) {
    return getWebhookCachedResult(executionId)
  }
  try {
    const exec = await getExecution(executionId, { includeData: true })
    return parseScanResultFromExecution(exec)
  } catch (e) {
    console.error("[getScanResult]", e)
    return null
  }
}
