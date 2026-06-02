# SpeedImage — project guide for Claude

Browser-based batch image compressor (JPEG/PNG/WebP). Near-lossless quality,
~60–70%+ size reduction, aimed at e-commerce imagery. **100% client-side** —
all compression happens in the browser via WebAssembly codecs; nothing is
uploaded.

## Architecture

- **Vite + React + TypeScript**, single-page static app.
- **jSquash** WASM codecs (MozJPEG / libwebp / OxiPNG / Lanczos resize). These
  are heavy and CPU-bound, so they run **only inside a Web Worker**, never on
  the main thread.

### Key files

| Path | Responsibility |
| --- | --- |
| `src/lib/codec.ts` | All codec work: decode → optional resize → encode. Worker-only (imports WASM). |
| `src/worker/compress.worker.ts` | Thin worker shell that calls `codec.ts` and posts results (with transferables). |
| `src/hooks/useCompressor.ts` | Worker **pool** + task queue + React state for the image batch. |
| `src/components/` | `Dropzone`, `SettingsBar`, `ImageCard` presentational components. |
| `src/App.tsx` | Layout, aggregate stats, ZIP download. |
| `src/types.ts` | Shared message/state types (UI ↔ worker). |

## Conventions

- Never import `@jsquash/*` outside the worker / `codec.ts` — it must not load on
  the main thread.
- jSquash packages are listed in `optimizeDeps.exclude` (vite.config.ts); add any
  new codec there too, or its WASM loader breaks.
- Worker is ES-module format (`worker.format = 'es'`).
- Object URLs are revoked on item removal / re-compress — keep that discipline to
  avoid leaks.
- `base: './'` (relative) so the build works on GitHub Pages subpaths.

## Commands

```bash
npm run dev        # dev server
npm run build      # tsc --noEmit && vite build  (must pass before pushing)
npm run typecheck  # types only
```

## Output format strategy ("Smart")

JPEG input → re-encoded JPEG (compatibility); PNG/WebP input → WebP (keeps alpha,
best ratio). Users can override to keep-original / force WebP / JPEG / lossless PNG.
