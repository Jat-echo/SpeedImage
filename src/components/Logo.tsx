interface Props {
  className?: string;
}

/** SpeedImage brand mark — a photo (sun + mountains) charged with a speed bolt. */
export function Logo({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="si-bg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8ea3ac" />
          <stop offset="0.5" stopColor="#a99c9b" />
          <stop offset="1" stopColor="#93a585" />
        </linearGradient>
        <linearGradient id="si-bolt" x1="22" y1="9" x2="42" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbf9f4" />
          <stop offset="1" stopColor="#eef1e9" />
        </linearGradient>
      </defs>

      <rect x="3" y="3" width="58" height="58" rx="15" fill="url(#si-bg)" />
      <path d="M18 3h28a15 15 0 0 1 15 15v4H3v-4A15 15 0 0 1 18 3Z" fill="#ffffff" opacity="0.12" />

      <circle cx="22" cy="21" r="5" fill="#ffffff" opacity="0.9" />
      <path
        d="M5 52 V40 l11-12 10 12 8-7 12 13 v6 a4 4 0 0 1-4 4 H9 a4 4 0 0 1-4-4 Z"
        fill="#ffffff"
        opacity="0.28"
      />

      <path
        d="M37 7 L19 35 h11 l-4 22 21-30 H35 Z"
        fill="url(#si-bolt)"
        stroke="#0b1020"
        strokeWidth="0.5"
        strokeOpacity="0.06"
        strokeLinejoin="round"
      />
    </svg>
  );
}
