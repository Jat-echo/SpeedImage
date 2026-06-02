# ⚡ SpeedImage

**Batch-compress JPEG, PNG & WebP images in your browser — near-lossless quality, typically 60–70%+ smaller.** Built for fast-loading e-commerce product pages.

SpeedImage runs the same class of codecs that power [TinyPNG](https://tinify.cn/) and Google's [Squoosh](https://squoosh.app) — **MozJPEG**, **libwebp**, and **OxiPNG** — compiled to WebAssembly and executed **entirely in your browser**. Images never leave your device, so it's private, free to host, and works offline once loaded.

## ✨ Features

- **Batch upload** — drag & drop or pick many JPEG / PNG / WebP files at once.
- **Near-lossless compression** — perceptually-tuned encoders shrink files dramatically while looking identical to the human eye.
- **Smart format strategy** — re-optimizes JPEGs as JPEG and converts PNG/WebP sources to WebP (keeping transparency) for the biggest savings.
- **Quality & resize controls** — quality slider plus an optional "max long edge" downscale, ideal for product thumbnails and gallery images.
- **Non-blocking** — encoding runs in a **Web Worker pool**, so the UI stays smooth even on large batches.
- **One-click download** — grab files individually or as a single ZIP.
- **100% client-side** — no servers, no uploads, no accounts.

## 🧠 How it compares to TinyPNG

TinyPNG's core trick is *smart lossy compression*: perceptual JPEG/WebP encoding and palette **quantization** for PNGs, plus metadata stripping. SpeedImage uses the open-source descendants of those same techniques:

| Concern | TinyPNG (SaaS) | SpeedImage |
| --- | --- | --- |
| JPEG | Perceptual encoder | **MozJPEG** (`@jsquash/jpeg`) |
| WebP | libwebp | **libwebp** (`@jsquash/webp`) |
| PNG | Lossy quantization | **OxiPNG** lossless + WebP conversion |
| Where it runs | Their servers | **Your browser** (WASM) |
| Privacy | Files uploaded | Files stay local |

Independent benchmarks of these WASM codecs land within ~2–3% of TinyPNG's output size — close enough to be visually indistinguishable.

## 🛠 Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [jSquash](https://github.com/jamsinclair/jSquash) WebAssembly codecs (MozJPEG, libwebp, OxiPNG, Lanczos3 resize)
- [JSZip](https://stuk.github.io/jszip/) for "download all"

## 🚀 Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

Then open the printed local URL, drop in some images, and download the compressed results.

## 📦 Deployment

The output in `dist/` is a fully static site — deploy it to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static host. A GitHub Actions workflow (`.github/workflows/deploy.yml`) is included to publish to **GitHub Pages** automatically on push to `main`.

> Note: `base: './'` in `vite.config.ts` keeps asset paths relative so the app works from a project subpath (e.g. `username.github.io/speedimage/`).

## 🙏 Credits & licenses

- Codecs via [jSquash](https://github.com/jamsinclair/jSquash), derived from [GoogleChromeLabs/squoosh](https://github.com/GoogleChromeLabs/squoosh) (Apache-2.0).
- SpeedImage source is released under the [MIT License](./LICENSE).
