import { hc } from "hono/client";
import type { AppType } from "../../api/index";

/** Typed client for the Hono API: api.api.health.$get() etc. */
export const api = hc<AppType>("/");
