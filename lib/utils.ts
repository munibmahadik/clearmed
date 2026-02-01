import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Base64 string (e.g. from backend audio_base64) into a playable Blob URL.
 * Use with <audio src={audioUrl} />. Revoke the URL in a cleanup (e.g. useEffect return)
 * to avoid memory leaks.
 * @param base64 - Raw base64 string or data URL (e.g. "data:audio/mpeg;base64,...")
 * @param mimeType - Mime type for the blob (default: audio/mpeg for MP3)
 */
export function base64ToBlobUrl(base64: string, mimeType: string = "audio/mpeg"): string {
  const b64 = base64.startsWith("data:") ? (base64.split(",")[1] ?? "") : base64
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}
