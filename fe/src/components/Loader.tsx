import '../styles/loader.css';

export type LoaderVariant = 'fullscreen' | 'full' | 'section' | 'inline' | 'compact';

interface LoaderProps {
  /** fullscreen = auth gate; full = page content; section = block; inline = row with text */
  variant?: LoaderVariant;
  message?: string;
  className?: string;
}

function LuggageIcon() {
  return (
    <svg viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Handle */}
      <path
        d="M16 8h16a4 4 0 0 1 4 4v2H12v-2a4 4 0 0 1 4-4z"
        stroke="#1a6b5c"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Body */}
      <rect x="8" y="14" width="32" height="24" rx="4" fill="#e8f3ef" stroke="#1a6b5c" strokeWidth="2" />
      {/* Strap line */}
      <path d="M8 22h32" stroke="#1a6b5c" strokeWidth="1.5" strokeOpacity="0.35" />
      {/* Wheels */}
      <g className="tgm-loader__wheel">
        <circle cx="16" cy="38" r="4" fill="#1a6b5c" />
        <circle cx="16" cy="38" r="1.5" fill="#f9f7f2" />
      </g>
      <g className="tgm-loader__wheel">
        <circle cx="32" cy="38" r="4" fill="#1a6b5c" />
        <circle cx="32" cy="38" r="1.5" fill="#f9f7f2" />
      </g>
    </svg>
  );
}

const DEFAULT_MESSAGES: Partial<Record<LoaderVariant, string>> = {
  fullscreen: 'Packing your adventure…',
  full: 'Loading your journey…',
  section: 'Loading…',
  inline: 'Loading…',
  compact: 'Loading…',
};

export function Loader({ variant = 'section', message, className = '' }: LoaderProps) {
  const text = message ?? DEFAULT_MESSAGES[variant] ?? 'Loading…';

  return (
    <div
      className={`tgm-loader tgm-loader--${variant} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="tgm-loader__scene">
        <div className="tgm-loader__track" />
        <div className="tgm-loader__luggage">
          <LuggageIcon />
        </div>
      </div>
      {text ? <p className="tgm-loader__message">{text}</p> : null}
    </div>
  );
}
