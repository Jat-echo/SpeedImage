import { useCallback, useRef, useState } from 'react';
import { useI18n } from '../i18n';

interface Props {
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles }: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      onFiles(Array.from(e.dataTransfer.files));
    },
    [onFiles],
  );

  return (
    <div
      className={`dropzone${dragging ? ' dropzone--active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
    >
      <div className="dropzone__icon" aria-hidden>
        ⬆
      </div>
      <p className="dropzone__title">{t.dropzone.title}</p>
      <p className="dropzone__hint">{t.dropzone.hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
    </div>
  );
}
