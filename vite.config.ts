import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // `bun run dev:api` serves the Hono app on :3001 during local dev
    proxy: { "/api": "http://localhost:3001" },
  },
});
