import type { CompressionSettings, OutputFormat } from '../types';
import { useI18n } from '../i18n';

interface Props {
  settings: CompressionSettings;
  onChange: (next: CompressionSettings) => void;
  onApply: () => void;
  hasItems: boolean;
}

const FORMAT_VALUES: OutputFormat[] = ['smart', 'original', 'webp', 'jpeg', 'png'];
const RESIZE_VALUES: (number | null)[] = [null, 3000, 2000, 1600, 1200];

export function SettingsBar({ settings, onChange, onApply, hasItems }: Props) {
  const { t } = useI18n();
  const losslessPng = settings.format === 'png';

  return (
    <div className="settings">
      <label className="settings__field">
        <span className="settings__label">{t.settings.format}</span>
        <select
          value={settings.format}
          onChange={(e) =>
            onChange({ ...settings, format: e.target.value as OutputFormat })
          }
        >
          {FORMAT_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.settings.formatOptions[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="settings__field settings__field--quality">
        <span className="settings__label">
          {t.settings.quality}
          <strong>{losslessPng ? t.settings.lossless : settings.quality}</strong>
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
        <span className="settings__label">{t.settings.maxDim}</span>
        <select
          value={settings.maxEdge ?? ''}
          onChange={(e) =>
            onChange({
              ...settings,
              maxEdge: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          {RESIZE_VALUES.map((value) => (
            <option key={String(value)} value={value ?? ''}>
              {value == null ? t.settings.noResize : `${value} px`}
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
        {t.settings.recompress}
      </button>
    </div>
  );
}
