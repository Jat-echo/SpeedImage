import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { useCompressor } from './hooks/useCompressor';
import { Dropzone } from './components/Dropzone';
import { SettingsBar } from './components/SettingsBar';
import { ImageCard } from './components/ImageCard';
import { CompareModal } from './components/CompareModal';
import { Logo } from './components/Logo';
import { downloadBlob, formatBytes, savedPercent } from './lib/format';

export default function App() {
  const {
    items,
    settings,
    setSettings,
    addFiles,
    recompressAll,
    removeItem,
    clearAll,
  } = useCompressor();
  const [zipping, setZipping] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);

  const done = useMemo(
    () => items.filter((i) => i.status === 'done' && i.outputBlob),
    [items],
  );

  const totals = useMemo(() => {
    const original = done.reduce((s, i) => s + i.originalSize, 0);
    const compressed = done.reduce((s, i) => s + (i.outputSize ?? 0), 0);
    return { original, compressed, saved: savedPercent(original, compressed) };
  }, [done]);

  const compareItem = useMemo(
    () => items.find((i) => i.id === compareId && i.outputUrl),
    [items, compareId],
  );

  const downloadAll = async () => {
    if (!done.length) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      done.forEach((i) => zip.file(i.outputName!, i.outputBlob!));
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, 'speedimage-compressed.zip');
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1 className="hero__title">
          <Logo className="hero__logo" />
          SpeedImage
        </h1>
        <p className="hero__tagline">
          Batch-compress JPEG, PNG &amp; WebP with near-lossless quality — built
          for fast e-commerce pages. Everything runs in your browser; images
          never leave your device.
        </p>
        <div className="hero__badges">
          <span className="chip">
            <span className="chip__dot" aria-hidden /> 100% in your browser
          </span>
          <span className="chip">No uploads</span>
          <span className="chip">JPEG · PNG · WebP</span>
        </div>
      </header>

      <main className="container">
        <SettingsBar
          settings={settings}
          onChange={setSettings}
          onApply={recompressAll}
          hasItems={items.length > 0}
        />

        <Dropzone onFiles={addFiles} />

        {items.length > 0 && (
          <div className="toolbar">
            <div className="toolbar__stats">
              {done.length > 0 ? (
                <>
                  <span className="toolbar__saved">{totals.saved}%</span>
                  <span className="toolbar__detail">
                    smaller · {formatBytes(totals.original)} →{' '}
                    {formatBytes(totals.compressed)} · {done.length}/{items.length}{' '}
                    done
                  </span>
                </>
              ) : (
                <span className="toolbar__detail">
                  Processing {items.length} image{items.length > 1 ? 's' : ''}…
                </span>
              )}
            </div>
            <div className="toolbar__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={downloadAll}
                disabled={!done.length || zipping}
              >
                {zipping ? 'Zipping…' : `Download all (${done.length})`}
              </button>
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="grid">
          {items.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              onRemove={removeItem}
              onCompare={(it) => setCompareId(it.id)}
            />
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>
          Powered by{' '}
          <a href="https://github.com/jamsinclair/jSquash" target="_blank" rel="noreferrer">
            jSquash
          </a>{' '}
          WebAssembly codecs (MozJPEG · libwebp · OxiPNG), derived from Google
          Squoosh. 100% client-side &amp; open source.
        </p>
      </footer>

      {compareItem && (
        <CompareModal item={compareItem} onClose={() => setCompareId(null)} />
      )}
    </div>
  );
}
