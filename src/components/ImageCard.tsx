import type { ImageItem } from '../types';
import { downloadBlob, formatBytes, savedPercent } from '../lib/format';

interface Props {
  item: ImageItem;
  onRemove: (id: string) => void;
}

export function ImageCard({ item, onRemove }: Props) {
  const saved =
    item.outputSize != null ? savedPercent(item.originalSize, item.outputSize) : 0;
  const previewUrl = item.outputUrl ?? item.originalUrl;

  return (
    <div className="card">
      <div className="card__thumb">
        <img src={previewUrl} alt={item.name} loading="lazy" />
        {item.status === 'done' && (
          <span
            className={`card__badge${saved < 0 ? ' card__badge--neg' : ''}`}
          >
            {saved >= 0 ? `-${saved}%` : `+${-saved}%`}
          </span>
        )}
      </div>

      <div className="card__body">
        <div className="card__name" title={item.name}>
          {item.outputName ?? item.name}
        </div>

        {item.status === 'queued' && (
          <div className="card__status">Queued…</div>
        )}
        {item.status === 'processing' && (
          <div className="card__status card__status--busy">Compressing…</div>
        )}
        {item.status === 'error' && (
          <div className="card__status card__status--error">{item.error}</div>
        )}
        {item.status === 'done' && (
          <div className="card__sizes">
            <span className="card__old">{formatBytes(item.originalSize)}</span>
            <span className="card__arrow">→</span>
            <span className="card__new">{formatBytes(item.outputSize!)}</span>
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
            Download
          </button>
        )}
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={() => onRemove(item.id)}
          aria-label="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
