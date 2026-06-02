import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CompressionSettings,
  CompressResponse,
  ImageItem,
} from '../types';

/** Leave one core free for the UI; cap the pool so we don't thrash on big batches. */
const POOL_SIZE = Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 4) - 1));

export const DEFAULT_SETTINGS: CompressionSettings = {
  format: 'smart',
  quality: 75,
  maxEdge: null,
};

const ACCEPTED = /image\/(jpeg|png|webp)/;

let counter = 0;
const nextId = () => `${Date.now().toString(36)}-${counter++}`;

export function useCompressor() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);

  const workersRef = useRef<Worker[]>([]);
  const idleRef = useRef<Worker[]>([]);
  const queueRef = useRef<string[]>([]);
  const tasksRef = useRef<Map<string, { file: File; settings: CompressionSettings }>>(
    new Map(),
  );
  const itemsRef = useRef<ImageItem[]>([]);
  itemsRef.current = items;

  const updateItem = useCallback((id: string, patch: Partial<ImageItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const pump = useCallback(() => {
    while (idleRef.current.length && queueRef.current.length) {
      const id = queueRef.current.shift()!;
      const task = tasksRef.current.get(id);
      if (!task) continue;
      const worker = idleRef.current.pop()!;
      updateItem(id, { status: 'processing', error: undefined });
      task.file
        .arrayBuffer()
        .then((buf) => {
          worker.postMessage(
            {
              id,
              name: task.file.name,
              type: task.file.type,
              buffer: buf,
              settings: task.settings,
            },
            [buf],
          );
        })
        .catch((err) => {
          updateItem(id, { status: 'error', error: String(err) });
          idleRef.current.push(worker);
          pump();
        });
    }
  }, [updateItem]);

  const handleResult = useCallback(
    (worker: Worker, res: CompressResponse) => {
      if (res.ok) {
        const blob = new Blob([res.buffer], { type: res.outputType });
        const url = URL.createObjectURL(blob);
        setItems((prev) =>
          prev.map((it) => {
            if (it.id !== res.id) return it;
            if (it.outputUrl) URL.revokeObjectURL(it.outputUrl);
            return {
              ...it,
              status: 'done',
              outputBlob: blob,
              outputUrl: url,
              outputSize: blob.size,
              outputType: res.outputType,
              outputName: res.outputName,
              width: res.width,
              height: res.height,
            };
          }),
        );
      } else {
        updateItem(res.id, { status: 'error', error: res.error });
      }
      tasksRef.current.delete(res.id);
      idleRef.current.push(worker);
      pump();
    },
    [pump, updateItem],
  );

  // Spin up the worker pool once.
  useEffect(() => {
    const workers: Worker[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const worker = new Worker(
        new URL('../worker/compress.worker.ts', import.meta.url),
        { type: 'module' },
      );
      worker.onmessage = (e: MessageEvent<CompressResponse>) =>
        handleResult(worker, e.data);
      workers.push(worker);
    }
    workersRef.current = workers;
    idleRef.current = [...workers];
    return () => workers.forEach((w) => w.terminate());
    // handleResult is stable for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enqueue = useCallback(
    (id: string, file: File, s: CompressionSettings) => {
      tasksRef.current.set(id, { file, settings: s });
      queueRef.current.push(id);
    },
    [],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted = files.filter((f) => ACCEPTED.test(f.type));
      const newItems: ImageItem[] = accepted.map((f) => ({
        id: nextId(),
        file: f,
        name: f.name,
        originalSize: f.size,
        originalUrl: URL.createObjectURL(f),
        status: 'queued',
      }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => enqueue(it.id, it.file, settings));
      pump();
    },
    [enqueue, pump, settings],
  );

  const recompressAll = useCallback(() => {
    queueRef.current = [];
    itemsRef.current.forEach((it) => {
      updateItem(it.id, { status: 'queued' });
      enqueue(it.id, it.file, settings);
    });
    pump();
  }, [enqueue, pump, settings, updateItem]);

  const removeItem = useCallback((id: string) => {
    queueRef.current = queueRef.current.filter((q) => q !== id);
    tasksRef.current.delete(id);
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        URL.revokeObjectURL(target.originalUrl);
        if (target.outputUrl) URL.revokeObjectURL(target.outputUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    queueRef.current = [];
    tasksRef.current.clear();
    setItems((prev) => {
      prev.forEach((i) => {
        URL.revokeObjectURL(i.originalUrl);
        if (i.outputUrl) URL.revokeObjectURL(i.outputUrl);
      });
      return [];
    });
  }, []);

  return {
    items,
    settings,
    setSettings,
    addFiles,
    recompressAll,
    removeItem,
    clearAll,
  };
}
