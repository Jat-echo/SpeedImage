// Core compression logic. This module is imported by the Web Worker only —
// it pulls in the WASM codecs, which must never run on the main thread.
import { decode as decodeJpeg, encode as encodeJpeg } from '@jsquash/jpeg';
import { decode as decodePng } from '@jsquash/png';
import { decode as decodeWebp, encode as encodeWebp } from '@jsquash/webp';
// Use OxiPNG's single-threaded build directly. The package's default `optimise`
// auto-selects a parallel (rayon) build inside Workers, but that needs
// SharedArrayBuffer / cross-origin isolation (COOP+COEP) — which static hosts
// like GitHub Pages don't provide. In that case `initThreadPool` deadlocks and
// PNG encoding hangs forever, so we pin the ST build that always works.
import initOxipng, {
  optimise_raw as oxipngOptimiseRaw,
} from '@jsquash/oxipng/codec/pkg/squoosh_oxipng.js';
import resize from '@jsquash/resize';

let oxipngReady: Promise<unknown> | null = null;
/** Initialise the single-threaded OxiPNG WASM module once, lazily. */
function ensureOxipng(): Promise<unknown> {
  if (!oxipngReady) oxipngReady = initOxipng();
  return oxipngReady;
}
import type {
  CodecFormat,
  CompressRequest,
  CompressSuccess,
  OutputFormat,
} from '../types';

const OUTPUT_META: Record<CodecFormat, { mime: string; ext: string }> = {
  jpeg: { mime: 'image/jpeg', ext: 'jpg' },
  png: { mime: 'image/png', ext: 'png' },
  webp: { mime: 'image/webp', ext: 'webp' },
};

/** Detect the input codec from MIME type, falling back to the file extension. */
function detectFormat(type: string, name: string): CodecFormat | null {
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg';
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
  if (ext === 'png') return 'png';
  if (ext === 'webp') return 'webp';
  return null;
}

async function decodeAny(fmt: CodecFormat, buffer: ArrayBuffer): Promise<ImageData> {
  switch (fmt) {
    case 'jpeg':
      return decodeJpeg(buffer);
    case 'png':
      return decodePng(buffer) as Promise<ImageData>;
    case 'webp':
      return decodeWebp(buffer);
  }
}

/**
 * Resolve the user's format strategy into a concrete codec.
 *
 * "Smart" keeps JPEGs as (re-optimized) JPEG for maximum compatibility, and
 * converts PNG/WebP sources to WebP — which preserves transparency while
 * delivering the biggest near-lossless savings for e-commerce imagery.
 */
function resolveOutput(format: OutputFormat, input: CodecFormat): CodecFormat {
  switch (format) {
    case 'smart':
      return input === 'jpeg' ? 'jpeg' : 'webp';
    case 'original':
      return input;
    default:
      return format;
  }
}

/**
 * Fixed OxiPNG effort level for lossless PNG output.
 *
 * PNG is lossless, so the quality slider is disabled for it and this only
 * controls how hard OxiPNG searches. We run single-threaded (GitHub Pages isn't
 * cross-origin isolated), where high levels can take minutes on large images and
 * look like a hang. Level 2 (OxiPNG's own default) is a good speed/size balance.
 */
const PNG_EFFORT_LEVEL = 2;

async function encodeImage(
  fmt: CodecFormat,
  image: ImageData,
  quality: number,
): Promise<ArrayBuffer> {
  switch (fmt) {
    case 'jpeg':
      return encodeJpeg(image, { quality });
    case 'webp':
      return encodeWebp(image, { quality });
    case 'png': {
      // OxiPNG is lossless; "quality" controls how hard it searches.
      await ensureOxipng();
      const optimised = oxipngOptimiseRaw(
        image.data,
        image.width,
        image.height,
        PNG_EFFORT_LEVEL,
        false, // interlace
        true, // optimiseAlpha
      );
      // ST build uses non-shared memory, so this is always a plain ArrayBuffer.
      return optimised.buffer as ArrayBuffer;
    }
  }
}

/** Replace a filename's extension, leaving the base name intact. */
function renameExt(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.${ext}`;
}

export async function compress(req: CompressRequest): Promise<CompressSuccess> {
  const inputFmt = detectFormat(req.type, req.name);
  if (!inputFmt) throw new Error('Unsupported image format');

  let image = await decodeAny(inputFmt, req.buffer);

  const { maxEdge } = req.settings;
  const longest = Math.max(image.width, image.height);
  if (maxEdge && longest > maxEdge) {
    const scale = maxEdge / longest;
    image = await resize(image, {
      width: Math.round(image.width * scale),
      height: Math.round(image.height * scale),
    });
  }

  const outFmt = resolveOutput(req.settings.format, inputFmt);
  const buffer = await encodeImage(outFmt, image, req.settings.quality);
  const meta = OUTPUT_META[outFmt];

  return {
    id: req.id,
    ok: true,
    buffer,
    outputType: meta.mime,
    outputName: renameExt(req.name, meta.ext),
    width: image.width,
    height: image.height,
  };
}
