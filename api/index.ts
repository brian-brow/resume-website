import { Hono } from "hono";

/**
 * The site's API. On Vercel this file becomes one Function, and vercel.json
 * rewrites every /api/* request to it. Add routes by chaining onto `routes`
 * so their types flow to the frontend client in src/lib/api.ts.
 */
const app = new Hono().basePath("/api");

const routes = app.get("/health", (c) =>
  c.json({
    ok: true,
    runtime: typeof Bun !== "undefined" ? `bun ${Bun.version}` : "node",
  }),
);

export type AppType = typeof routes;
export default app;
