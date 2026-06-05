import { useEffect } from 'react';
import type { ImageItem } from '../types';
import { formatBytes, savedPercent } from '../lib/format';
import { CompareSlider } from './CompareSlider';
import { useI18n } from '../i18n';

interface Props {
  item: ImageItem;
  onClose: () => void;
}

function formatLabel(type?: string): string {
  if (!type) return '';
  if (type.includes('webp')) return 'WebP';
  if (type.includes('png')) return 'PNG';
  if (type.includes('jpeg')) return 'JPEG';
  return type.replace('image/', '').toUpperCase();
}

export function CompareModal({ item, onClose }: Props) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const saved = savedPercent(item.originalSize, item.outputSize ?? item.originalSize);

  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div className="modal__title" title={item.outputName ?? item.name}>
            {item.outputName ?? item.name}
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t.compare.close}
          >
            ✕
          </button>
        </header>

        <CompareSlider
          beforeUrl={item.originalUrl}
          afterUrl={item.outputUrl!}
          alt={item.name}
        />

        <div className="modal__stats">
          <div className="stat">
            <span className="stat__k">{t.compare.before}</span>
            <span className="stat__v">{formatBytes(item.originalSize)}</span>
          </div>
          <div className="stat">
            <span className="stat__k">{t.compare.after}</span>
            <span className="stat__v stat__v--good">
              {formatBytes(item.outputSize ?? 0)}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">{t.compare.saved}</span>
            <span
              className={`stat__v ${saved >= 0 ? 'stat__v--good' : 'stat__v--bad'}`}
            >
              {saved >= 0 ? `${saved}%` : `+${-saved}%`}
            </span>
          </div>
          {item.width != null && (
            <div className="stat">
              <span className="stat__k">{t.compare.dimensions}</span>
              <span className="stat__v">
                {item.width}×{item.height}
              </span>
            </div>
          )}
          {item.outputType && (
            <div className="stat">
              <span className="stat__k">{t.compare.format}</span>
              <span className="stat__v">{formatLabel(item.outputType)}</span>
            </div>
          )}
        </div>

        <p className="modal__hint">{t.compare.hint}</p>
      </div>
    </div>
  );
}
