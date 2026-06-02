// Shared types used by both the UI and the compression Web Worker.

/** Output format strategy chosen by the user. */
export type OutputFormat = 'smart' | 'original' | 'webp' | 'jpeg' | 'png';

/** Concrete codec the worker encodes with. */
export type CodecFormat = 'jpeg' | 'png' | 'webp';

export interface CompressionSettings {
  /** Desired output format strategy. */
  format: OutputFormat;
  /** Lossy quality, 1-100 (ignored for lossless PNG output). */
  quality: number;
  /** Resize so the longest edge is at most this many pixels. `null` disables resizing. */
  maxEdge: number | null;
}

/** Message sent to the worker. */
export interface CompressRequest {
  id: string;
  name: string;
  type: string;
  buffer: ArrayBuffer;
  settings: CompressionSettings;
}

export interface CompressSuccess {
  id: string;
  ok: true;
  buffer: ArrayBuffer;
  outputType: string;
  outputName: string;
  width: number;
  height: number;
}

export interface CompressFailure {
  id: string;
  ok: false;
  error: string;
}

export type CompressResponse = CompressSuccess | CompressFailure;

export type ItemStatus = 'queued' | 'processing' | 'done' | 'error';

/** UI-side representation of a single image in the batch. */
export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalUrl: string;
  status: ItemStatus;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  outputType?: string;
  outputName?: string;
  width?: number;
  height?: number;
  error?: string;
}
