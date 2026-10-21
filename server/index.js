import app from './app.js'

// Long-running server entry (Docker / Render / Railway / local `npm start`).
// Honors SERVER_PORT (local dev) then the host-provided PORT, else 3001.
const PORT = process.env.SERVER_PORT || process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Efficiance server listening on http://localhost:${PORT}`)
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && process.env.AI_PROVIDER !== 'openai') {
    console.log('Note: no AI key set — Insights will use the saved set until you add one to .env')
  }
})
