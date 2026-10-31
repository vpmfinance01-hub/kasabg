// Малък набор от линейни икони за сайта (без емотикони).
type P = { className?: string };
const base = { width: 28, height: 28, viewBox: "0 0 28 28", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IcoReceipt = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M7 3h14v22l-3.5-2.2L14 25l-3.5-2.2L7 25V3z" />
    <path d="M11 9h6M11 13h6M11 17h3" />
  </svg>
);
export const IcoRetry = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M22 14a8 8 0 1 1-2.6-5.9" />
    <path d="M22 4v5h-5" />
  </svg>
);
export const IcoPalette = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M14 4a10 10 0 1 0 0 20c1.6 0 2-1 1.4-2-.7-1.2 0-2.6 1.6-2.6H19a5 5 0 0 0 5-5C24 8 19.5 4 14 4z" />
    <circle cx="9.5" cy="12" r="1.2" /><circle cx="14" cy="8.8" r="1.2" /><circle cx="18.5" cy="12" r="1.2" />
  </svg>
);
export const IcoUndo = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M10 8 5 13l5 5" /><path d="M5 13h11a6 6 0 0 1 0 12h-3" />
  </svg>
);
export const IcoFolder = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M3 8a2 2 0 0 1 2-2h5l2.5 3H23a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
  </svg>
);
export const IcoPlug = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M10 4v6M18 4v6M7 10h14v3a7 7 0 0 1-14 0v-3zM14 20v4" />
  </svg>
);
export const IcoShield = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M14 3 5 6.5v7c0 5.5 3.6 9.3 9 11.5 5.4-2.2 9-6 9-11.5v-7L14 3z" /><path d="m10 14 3 3 5-6" />
  </svg>
);
export const IcoUsers = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <circle cx="11" cy="10" r="4" /><path d="M3 24a8 8 0 0 1 16 0" /><path d="M19 6.5a4 4 0 0 1 0 7M21 17a8 8 0 0 1 4 7" />
  </svg>
);
export const IcoCheck = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden><path d="m6 14.5 5.5 5.5L22 8.5" /></svg>
);
export const Arrow = ({ className = "arr" }: P) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M3 9h12M10 4l5 5-5 5" />
  </svg>
);
