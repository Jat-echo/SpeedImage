import type { CompressionSettings, OutputFormat } from '../types';

interface Props {
  settings: CompressionSettings;
  onChange: (next: CompressionSettings) => void;
  onApply: () => void;
  hasItems: boolean;
}

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'smart', label: 'Smart (recommended)' },
  { value: 'original', label: 'Keep original' },
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG (lossless)' },
];

const RESIZE_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'No resize' },
  { value: 3000, label: '3000 px' },
  { value: 2000, label: '2000 px' },
  { value: 1600, label: '1600 px' },
  { value: 1200, label: '1200 px' },
];

export function SettingsBar({ settings, onChange, onApply, hasItems }: Props) {
  const losslessPng = settings.format === 'png';

  return (
    <div className="settings">
      <label className="settings__field">
        <span className="settings__label">Output format</span>
        <select
          value={settings.format}
          onChange={(e) =>
            onChange({ ...settings, format: e.target.value as OutputFormat })
          }
        >
          {FORMAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="settings__field settings__field--quality">
        <span className="settings__label">
          Quality
          <strong>{losslessPng ? 'lossless' : settings.quality}</strong>
        </span>
        <input
          type="range"
          min={1}
          max={100}
          value={settings.quality}
          disabled={losslessPng}
          onChange={(e) =>
            onChange({ ...settings, quality: Number(e.target.value) })
          }
        />
      </label>

      <label className="settings__field">
        <span className="settings__label">Max dimension</span>
        <select
          value={settings.maxEdge ?? ''}
          onChange={(e) =>
            onChange({
              ...settings,
              maxEdge: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          {RESIZE_OPTIONS.map((o) => (
            <option key={String(o.value)} value={o.value ?? ''}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="btn btn--primary settings__apply"
        onClick={onApply}
        disabled={!hasItems}
      >
        Re-compress all
      </button>
    </div>
  );
}
