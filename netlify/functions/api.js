// Netlify Function that runs the whole Express app.
// Requires: npm install serverless-http   (see netlify.toml note)
import serverless from 'serverless-http'
import app from '../../server/app.js'

const inner = serverless(app)

// netlify.toml redirects /api/* -> /.netlify/functions/api/:splat, so the function
// receives a path like /.netlify/functions/api/ai/insights. Express routes expect
// /api/ai/insights, so normalize the path back before handing it to the app.
export const handler = async (event, context) => {
  let p = event.path || '/'
  p = p.replace(/^\/\.netlify\/functions\/api/, '')
  if (!p.startsWith('/')) p = '/' + p
  event.path = '/api' + (p === '/' ? '' : p)
  return inner(event, context)
}
