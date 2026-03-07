/** Safely parse JSON from a Response. Returns fallback on empty or invalid JSON. */
export async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  const text = await res.text()
  if (!text?.trim()) return fallback
  try {
    const data = JSON.parse(text) as T
    return data
  } catch {
    return fallback
  }
}
