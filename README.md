# brianbrown.dev — redesign

A personal site built as a single hairline grid: a big name, windows onto a
dithered pond, and an accent-coloured door that zooms into a four-room menu
(Bio, Links, Play, Writing).

## The plan

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | Familiar, fast, and the site is one rich interactive experience |
| Toolchain | Bun | Installs, scripts, tests, and runs the API locally |
| Simulations | Rust → WebAssembly | Pixel-heavy work (water, dither, boids) and a Rust learning project |
| API | Hono on Vercel Functions (Bun runtime) | Tiny, TS-first, end-to-end typed client for React |
| Hosting | Vercel | Static frontend + functions from one repo |
| CI/CD | GitHub Actions + Vercel | Actions checks every PR; Vercel deploys from Git |

### Roadmap

1. **Now:** TypeScript version of the whole site (this branch). The pond runs
   in TS so everything works before any Rust exists.
2. **Next:** fill in real content (bio, links, projects, posts).
3. **Then:** port the pond to Rust (`crates/pond`) behind the same interface,
   and swap it in with one line.
4. **Later:** blog posts as MDX, real API routes (guestbook, game scores),
   and possibly pre-rendering for posts.

## Structure

```
├── src/
│   ├── App.tsx              # layer state, zoom, focus, Escape to go back
│   ├── components/          # Home (index), Inside (four rooms), Play, Writing, clock, icons
│   ├── play/                # projects shown at /play: connectfour, sandsim, wfcollapse (ported from main)
│   ├── posts/               # one plain-text post per YYYY-MM-DD-slug.md; first paragraph is the title
│   ├── pond/
│   │   ├── engine.ts        # the simulation: water + dither + boids (PondCore)
│   │   ├── engine.test.ts   # bun test
│   │   ├── loop.ts          # animation loop, paints each window's crop
│   │   └── react.tsx        # <PondProvider>, <PondWindow>, usePondStage
│   ├── lib/api.ts           # typed Hono client
│   ├── lib/posts.ts         # parses src/posts into the post list
│   ├── palettes.ts          # generated colour palettes the menu's Shuffle button picks from
│   └── styles.css
├── scripts/palettes.ts      # writes src/palettes.ts: the default palette's OKLCH lightness and chroma, new hues
├── api/
│   ├── index.ts             # Hono app → one Vercel Function
│   └── dev.ts               # local API server on :3001
├── crates/pond/             # Rust port (starter: water + dither only)
├── .github/workflows/deploy.yml
└── vercel.json
```

### How the pond works

There is one simulated field the size of the whole screen, measured in
dither dots (`DOT` = 3 css px). Each `<PondWindow>` measures where it sits on
the page and renders only its crop of that field, so the water and fish line
up across the grid and swim "behind" the hairlines. The loop runs at 30 fps,
paints only windows that are on screen, and draws a single still frame for
visitors with reduced motion turned on.

- **Water:** three directional sine waves; the surface slope is shaded
  against a light direction, plus a broad light falloff.
- **Dither:** 8×8 Bayer ordered threshold, pure 1-bit output.
- **Shapes:** two flat arcs and three pads that sway, drawn without dither.
- **Boids:** separation, alignment, cohesion, plus pad avoidance, soft walls,
  wander, and scattering from the cursor. Pointer movement also drops ripples.

## Local development

```sh
bun install
bun run dev        # site at http://localhost:5173
bun run dev:api    # (second terminal) API at http://localhost:3001/api/health
bun test
bun run typecheck
bun run palettes   # regenerate src/palettes.ts
```

Rust (optional until the port starts):

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
cd crates/pond && cargo fmt && cargo test
bun run build:wasm   # outputs crates/pond/pkg (gitignored; CI builds it)
```

Run `cargo fmt` once before your first push. CI fails on unformatted Rust,
and the starter crate was written without rustfmt available.

## Swapping in the Rust pond

The Rust `Pond` mirrors `PondCore` from `engine.ts`. Once it's fully ported,
wrap it and pass it to the provider:

```ts
import init, { Pond as WasmPond } from "../../crates/pond/pkg/pond";
import type { Crop, PondCore } from "./engine";

const { memory } = await init();
const pond = new WasmPond(480, 300);

export const wasmCore: PondCore = {
  resize: (w, h) => pond.resize(w, h),
  step: (t, dt) => pond.step(t, dt),
  poke: (x, y, t) => pond.poke(x, y, t),
  render(buf: Uint32Array, c: Crop) {
    pond.render(c.sx, c.sy, c.sw, c.sh);
    buf.set(new Uint32Array(memory.buffer, pond.pixels_ptr(), c.sw * c.sh));
  },
};

// <PondProvider core={() => wasmCore}>
```

(For true zero-copy, point the canvas `ImageData` at wasm memory directly
instead of `buf.set`; this version is simpler to start with.)

## Deploys

Vercel's Git integration deploys every push once the repo is connected to a
Vercel project: branches get a preview URL, `main` goes to production.
GitHub Actions only runs checks, on PRs and pushes to `main`.

## Notes to verify when setting up

- Hono on Vercel: `api/index.ts` default-exports the app, and `vercel.json`
  rewrites `/api/*` to it. Confirm with `bunx vercel dev` and check Hono's
  Vercel guide if the export style has changed.
- The Bun runtime on Vercel is in beta. If anything misbehaves, remove
  `bunVersion` from `vercel.json` to fall back to Node.
- GitHub Action versions are pinned to major versions; check for newer ones.
