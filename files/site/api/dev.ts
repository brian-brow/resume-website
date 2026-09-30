// Local dev server for the API: `bun run dev:api` (Vite proxies /api here)
import app from "./index";

export default { port: 3001, fetch: app.fetch };
console.log("API on http://localhost:3001/api/health");
