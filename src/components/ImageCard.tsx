import type { ImageItem } from '../types';
import { downloadBlob, formatBytes, savedPercent } from '../lib/format';
import { useI18n } from '../i18n';

interface Props {
  item: ImageItem;
  onRemove: (id: string) => void;
  onCompare: (item: ImageItem) => void;
}

function formatLabel(type?: string): string {
  if (!type) return '';
  if (type.includes('webp')) return 'WebP';
  if (type.includes('png')) return 'PNG';
  if (type.includes('jpeg')) return 'JPEG';
  return type.replace('image/', '').toUpperCase();
}

export function ImageCard({ item, onRemove, onCompare }: Props) {
  const { t } = useI18n();
  const saved =
    item.outputSize != null ? savedPercent(item.originalSize, item.outputSize) : 0;
  const previewUrl = item.outputUrl ?? item.originalUrl;
  const comparable = item.status === 'done' && !!item.outputUrl;

  return (
    <div className="card">
      <div
        className={`card__thumb${comparable ? ' card__thumb--clickable' : ''}`}
        onClick={comparable ? () => onCompare(item) : undefined}
        role={comparable ? 'button' : undefined}
        tabIndex={comparable ? 0 : undefined}
        title={comparable ? t.card.compareTitle : undefined}
        onKeyDown={
          comparable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCompare(item);
                }
              }
            : undefined
        }
      >
        <img src={previewUrl} alt={item.name} loading="lazy" />
        {item.status === 'done' && (
          <span className={`card__badge${saved < 0 ? ' card__badge--neg' : ''}`}>
            {saved >= 0 ? `−${saved}%` : `+${-saved}%`}
          </span>
        )}
        {comparable && (
          <span className="card__compare-hint" aria-hidden>
            ‹›&nbsp; {t.card.compare}
          </span>
        )}
      </div>

      <div className="card__body">
        <div className="card__name" title={item.name}>
          {item.outputName ?? item.name}
        </div>

        {item.status === 'queued' && (
          <div className="card__status">{t.card.queued}</div>
        )}
        {item.status === 'processing' && (
          <div className="card__status card__status--busy">
            {t.card.compressing}
          </div>
        )}
        {item.status === 'error' && (
          <div className="card__status card__status--error">{item.error}</div>
        )}
        {item.status === 'done' && (
          <div className="card__sizes">
            <span className="card__old">{formatBytes(item.originalSize)}</span>
            <span className="card__arrow">→</span>
            <span className="card__new">{formatBytes(item.outputSize!)}</span>
            {item.outputType && (
              <span className="card__chip">{formatLabel(item.outputType)}</span>
            )}
            {item.width != null && (
              <span className="card__dims">
                {item.width}×{item.height}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card__actions">
        {item.status === 'done' && item.outputBlob && (
          <button
            type="button"
            className="btn btn--small"
            onClick={() => downloadBlob(item.outputBlob!, item.outputName!)}
          >
            {t.card.download}
          </button>
        )}
        {comparable && (
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={() => onCompare(item)}
          >
            {t.card.compare}
          </button>
        )}
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={() => onRemove(item.id)}
          aria-label={t.card.remove}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
