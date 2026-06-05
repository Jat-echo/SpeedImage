import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'en' | 'zh';

const STORAGE_KEY = 'speedimage-lang';

/** Auto-detect language from the browser, defaulting to English. */
export function detectLang(): Lang {
  if (typeof navigator !== 'undefined') {
    const langs = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    if (langs.some((l) => l?.toLowerCase().startsWith('zh'))) return 'zh';
  }
  return 'en';
}

const en = {
  title: 'SpeedImage · Batch image compressor for the web',
  hero: {
    tagline:
      'Batch-compress JPEG, PNG & WebP with near-lossless quality — built for fast e-commerce pages. Everything runs in your browser; images never leave your device.',
    inBrowser: '100% in your browser',
    noUploads: 'No uploads',
    formats: 'JPEG · PNG · WebP',
  },
  settings: {
    format: 'Output format',
    formatOptions: {
      smart: 'Smart (recommended)',
      original: 'Keep original',
      webp: 'WebP',
      jpeg: 'JPEG',
      png: 'PNG (lossless)',
    },
    quality: 'Quality',
    lossless: 'lossless',
    maxDim: 'Max dimension',
    noResize: 'No resize',
    recompress: 'Re-compress all',
  },
  dropzone: {
    title: 'Drop images here, or click to browse',
    hint: 'JPEG · PNG · WebP — batch upload supported',
  },
  toolbar: {
    detail: (a: string, b: string, done: number, total: number) =>
      `smaller · ${a} → ${b} · ${done}/${total} done`,
    processing: (n: number) => `Processing ${n} image${n > 1 ? 's' : ''}…`,
    downloadAll: (n: number) => `Download all (${n})`,
    zipping: 'Zipping…',
    clear: 'Clear',
  },
  card: {
    queued: 'Queued…',
    compressing: 'Compressing…',
    download: 'Download',
    compare: 'Compare',
    remove: 'Remove',
    compareTitle: 'Compare before / after',
  },
  compare: {
    before: 'Before',
    after: 'After',
    saved: 'Saved',
    dimensions: 'Dimensions',
    format: 'Format',
    close: 'Close',
    hint: 'Drag the divider (or use ← →) to compare — left is the original, right is compressed.',
  },
  footer: {
    pre: 'Powered by ',
    post: ' WebAssembly codecs (MozJPEG · libwebp · OxiPNG), derived from Google Squoosh. 100% client-side & open source.',
  },
  langLabel: 'Language',
};

export type Messages = typeof en;

const zh: Messages = {
  title: 'SpeedImage · 网页批量图片压缩工具',
  hero: {
    tagline:
      '批量压缩 JPEG、PNG 和 WebP 图片，近乎无损画质 —— 专为高速电商页面打造。全部在浏览器中完成，图片绝不离开你的设备。',
    inBrowser: '100% 浏览器本地处理',
    noUploads: '无需上传',
    formats: 'JPEG · PNG · WebP',
  },
  settings: {
    format: '输出格式',
    formatOptions: {
      smart: '智能（推荐）',
      original: '保持原格式',
      webp: 'WebP',
      jpeg: 'JPEG',
      png: 'PNG（无损）',
    },
    quality: '质量',
    lossless: '无损',
    maxDim: '最大尺寸',
    noResize: '不缩放',
    recompress: '全部重新压缩',
  },
  dropzone: {
    title: '拖拽图片到此处，或点击选择',
    hint: 'JPEG · PNG · WebP —— 支持批量上传',
  },
  toolbar: {
    detail: (a, b, done, total) => `更小 · ${a} → ${b} · 完成 ${done}/${total}`,
    processing: (n) => `正在处理 ${n} 张图片…`,
    downloadAll: (n) => `全部下载 (${n})`,
    zipping: '打包中…',
    clear: '清空',
  },
  card: {
    queued: '排队中…',
    compressing: '压缩中…',
    download: '下载',
    compare: '对比',
    remove: '移除',
    compareTitle: '对比压缩前后',
  },
  compare: {
    before: '压缩前',
    after: '压缩后',
    saved: '节省',
    dimensions: '尺寸',
    format: '格式',
    close: '关闭',
    hint: '拖动分隔线（或使用 ← →）对比 —— 左侧为原图，右侧为压缩后。',
  },
  footer: {
    pre: '由 ',
    post: ' WebAssembly 编解码器（MozJPEG · libwebp · OxiPNG）驱动，衍生自 Google Squoosh。100% 客户端运行，开源。',
  },
  langLabel: '语言',
};

export const messages: Record<Lang, Messages> = { en, zh };

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Messages;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'zh') return stored;
    } catch {
      /* ignore */
    }
    return detectLang();
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = messages[lang].title;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: messages[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
