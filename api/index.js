// Vercel serverless entry.
// vercel.json rewrites every /api/* request to this function; Vercel's Node runtime
// invokes the exported Express app as the handler. Express still sees the original
// URL (e.g. /api/ai/insights), so the routes in server/app.js match unchanged.
import app from '../server/app.js'

export default app
