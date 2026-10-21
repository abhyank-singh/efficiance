// Provider layer shared by every AI feature (insights, quick-add parsing).
// Chosen by env (see .env.example):
//   AI_PROVIDER=gemini  → Google Gemini REST API   (GEMINI_API_KEY, default model gemini-2.5-flash-lite)
//   AI_PROVIDER=openai  → any OpenAI-compatible API (OpenAI, Groq, OpenRouter, local Ollama…)
//                         (OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL)

export const PROVIDER = process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai')
export const MODEL = process.env.AI_MODEL || process.env.OPENAI_MODEL ||
  (PROVIDER === 'gemini' ? 'gemini-2.5-flash-lite' : 'gpt-4o-mini')
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const isLocalBase = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(OPENAI_BASE)

const apiKey = () => (PROVIDER === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY)
export const keyLoaded = () => Boolean(apiKey()) || (PROVIDER === 'openai' && isLocalBase)

async function viaGemini({ system, user, maxTokens, temperature, signal }) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', temperature, maxOutputTokens: maxTokens },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
}

async function viaOpenAI({ system, user, maxTokens, temperature, signal }) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey()) headers.Authorization = `Bearer ${apiKey()}`
  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI-compatible ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/** Ask the model for a JSON object; returns the parsed value. Throws on empty/invalid output. */
export async function completeJson({ system, user, maxTokens = 1500, temperature = 0.7, timeoutMs = 20000 }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const raw = await (PROVIDER === 'gemini' ? viaGemini : viaOpenAI)({ system, user, maxTokens, temperature, signal: controller.signal })
    if (!raw) throw new Error('empty completion')
    return JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ''))
  } finally {
    clearTimeout(timer)
  }
}
