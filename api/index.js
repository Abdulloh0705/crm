// Vercel serverless entry point — wraps the same Express app used for local
// dev (mock-server/app.js) so BOLD YECHIM CRM's login/API calls work when
// deployed to Vercel, not just on `npm run dev`.
//
// IMPORTANT (see mock-server/app.js's own header): this is still the mock/
// demo backend — data lives in the function's in-memory state, which is NOT
// guaranteed to persist between invocations on Vercel (cold starts, and
// concurrent/scaled instances don't share memory). It's enough to make
// login and the demo data flow work in production; it is not a substitute
// for a real backend with a real database.
import app from '../mock-server/app.js'

export default function handler(req, res) {
  return app(req, res)
}
