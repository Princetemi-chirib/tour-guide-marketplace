const HERO_IMAGE = '/images/whereto.png';

const DEFAULT_MESSAGE =
  'Easily book tours, manage trips, and connect with local guides — all in one place.';

export function AuthSplitVisual({ message = DEFAULT_MESSAGE }: { message?: string }) {
  return (
    <aside className="auth-split__visual" aria-hidden="true">
      <img src={HERO_IMAGE} alt="" />
      <div className="auth-split__card">
        <div className="auth-split__card-icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <p>{message}</p>
      </div>
    </aside>
  );
}
