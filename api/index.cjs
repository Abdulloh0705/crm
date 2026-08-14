// Vercel serverless entry point — wraps the same Express app used for local
// dev (mock-server/app.js) so BOLD YECHIM CRM's login/API calls work when
// deployed to Vercel, not just on `npm run dev`.
//
// Deliberately plain CommonJS (`.cjs` extension forces this regardless of
// this project's root package.json "type": "module") and `require()`, so
// there is no ESM/CJS module-boundary ambiguity for Vercel's Node.js
// function bundler to resolve when it traces into mock-server/app.js (a
// CommonJS file, per mock-server/package.json).
//
// IMPORTANT (see mock-server/app.js's own header): this is still the mock/
// demo backend — data lives in the function's in-memory state, which is NOT
// guaranteed to persist between invocations on Vercel (cold starts, and
// concurrent/scaled instances don't share memory). It's enough to make
// login and the demo data flow work in production; it is not a substitute
// for a real backend with a real database.
const app = require('../mock-server/app.js')

module.exports = (req, res) => app(req, res)
