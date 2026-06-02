/// <reference lib="webworker" />
import { compress } from '../lib/codec';
import type { CompressRequest, CompressResponse } from '../types';

self.onmessage = async (event: MessageEvent<CompressRequest>) => {
  const req = event.data;
  try {
    const result = await compress(req);
    // Transfer the encoded buffer back to avoid a copy.
    (self as DedicatedWorkerGlobalScope).postMessage(result, [result.buffer]);
  } catch (err) {
    const response: CompressResponse = {
      id: req.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    (self as DedicatedWorkerGlobalScope).postMessage(response);
  }
};
