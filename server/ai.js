// Provider layer shared by every AI feature (insights, quick-add parsing).
// Chosen by env (see .env.example):
//   AI_PROVIDER=gemini  → Google Gemini REST API   (GEMINI_API_KEY; model auto-heals if retired)
//   AI_PROVIDER=openai  → any OpenAI-compatible API (OpenAI, Groq, OpenRouter, local Ollama…)
//                         (OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL)

export const PROVIDER = process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai')
const PREFERRED = process.env.AI_MODEL || process.env.OPENAI_MODEL ||
  (PROVIDER === 'gemini' ? 'gemini-flash-lite-latest' : 'gpt-4o-mini')
const GEMINI_BASE = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const isLocalBase = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(OPENAI_BASE)

const apiKey = () => (PROVIDER === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY)
export const keyLoaded = () => Boolean(apiKey()) || (PROVIDER === 'openai' && isLocalBase)

// Gemini retires models regularly (2.5 Flash-Lite included). So the model is self-healing:
// try the preferred one; if the API says it is gone, ask the API which models exist and pick the best Flash-Lite.
const state = { model: PREFERRED, listedAt: 0 }
export const currentModel = () => state.model

const apiError = (msg, status) => Object.assign(new Error(msg), { status })
const scrub = (t) => String(t).replace(/key=[^&\s"]+/gi, 'key=…').slice(0, 200)

async function listGeminiModels() {
  const res = await fetch(`${GEMINI_BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': apiKey() } })
  if (!res.ok) throw apiError(`Gemini list ${res.status}: ${scrub(await res.text())}`, res.status)
  const data = await res.json()
  return (data.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => String(m.name).replace(/^models\//, ''))
}

const EXCLUDE = /image|tts|audio|live|embedding|vision|robotics|computer|native|learnlm|gemma|imagen|veo|thinking|exp\b|-001$/i
const version = (n) => Number((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1])
const better = (a, b) => // alias first, then newest version, then stable over preview
  (/latest/.test(b) - /latest/.test(a)) || (version(b) - version(a)) || (/preview/.test(a) - /preview/.test(b))

/** Best-first candidates: Flash-Lite models, then plain Flash models. */
export function rankModels(names) {
  const ok = [...new Set(names)].filter((n) => /^gemini/.test(n) && /flash/.test(n) && !EXCLUDE.test(n))
  const lite = ok.filter((n) => /lite/.test(n)).sort(better)
  const flash = ok.filter((n) => !/lite/.test(n)).sort(better)
  return [...lite, ...flash]
}

async function callGemini(model, { system, user, maxTokens, temperature, signal }) {
  const res = await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      // generous headroom: newer "thinking" models spend output tokens before answering
      generationConfig: { responseMimeType: 'application/json', temperature, maxOutputTokens: maxTokens * 3 + 512 },
    }),
  })
  if (!res.ok) throw apiError(`Gemini ${res.status} (${model}): ${scrub(await res.text())}`, res.status)
  const data = await res.json()
  const cand = data.candidates?.[0]
  const text = cand?.content?.parts?.map((p) => p.text || '').join('') || ''
  if (!text) throw apiError(`Gemini empty output (${model}, finishReason=${cand?.finishReason || data.promptFeedback?.blockReason || 'none'})`, 502)
  return text
}

const MODEL_GONE = new Set([400, 403, 404]) // "this model is unavailable to you": try another one

async function viaGemini(args) {
  const order = [state.model]
  let lastErr
  for (let i = 0; i < order.length; i++) {
    try {
      const text = await callGemini(order[i], args)
      if (state.model !== order[i]) console.log(`AI model switched: ${state.model} -> ${order[i]}`)
      state.model = order[i]
      return text
    } catch (err) {
      lastErr = err
      if (!MODEL_GONE.has(err.status)) throw err
      console.error(`Gemini model "${order[i]}" unavailable (${err.status}); looking for a replacement`)
      if (i === order.length - 1 && Date.now() - state.listedAt > 10 * 60 * 1000) {
        state.listedAt = Date.now()
        try {
          const found = rankModels(await listGeminiModels()).filter((m) => !order.includes(m)).slice(0, 4)
          order.push(...found)
        } catch (listErr) { console.error('Could not list Gemini models:', listErr.message) }
      }
    }
  }
  throw lastErr
}

async function viaOpenAI({ system, user, maxTokens, temperature, signal }) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey()) headers.Authorization = `Bearer ${apiKey()}`
  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: PREFERRED,
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
