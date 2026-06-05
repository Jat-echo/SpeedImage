import { useCallback, useRef, useState } from 'react';
import { useI18n } from '../i18n';

interface Props {
  /** Left side of the wipe — the original image. */
  beforeUrl: string;
  /** Right side of the wipe — the compressed image. */
  afterUrl: string;
  alt: string;
}

/**
 * Before/after image comparison with a draggable divider.
 *
 * The compressed image is the base layer; the original is overlaid and clipped
 * to the left of the handle, so dragging the divider wipes between the two.
 * Both images share the same aspect ratio (resize preserves it), so they line
 * up pixel-for-pixel.
 */
export function CompareSlider({ beforeUrl, afterUrl, alt }: Props) {
  const { t } = useI18n();
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 2));
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 2));
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      className="compare"
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <img className="compare__base" src={afterUrl} alt={alt} draggable={false} />

      <div
        className="compare__before"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={beforeUrl} alt="" draggable={false} />
      </div>

      <span className="compare__tag compare__tag--left">{t.compare.before}</span>
      <span className="compare__tag compare__tag--right">{t.compare.after}</span>

      <div
        className="compare__handle"
        style={{ left: `${pos}%` }}
        role="slider"
        aria-label="Comparison divider position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <span className="compare__grip" aria-hidden>
          ‹›
        </span>
      </div>
    </div>
  );
}
