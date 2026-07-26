export function StravaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#FC4C02" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066z" />
      <path fill="#FC4C02" d="M9.936 13.828h3.066L8.808 0 3.463 13.828h3.066l2.279-4.976z" />
    </svg>
  );
}

/** Round badge variant — used inline next to a bike's details to flag that
 * it's synced with Strava (as opposed to StravaIcon's flat wordmark glyph,
 * used for the standalone "Connected accounts" row). */
export function StravaBadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#FC4C02" />
      <path
        opacity="0.6"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M44.225 54.2L57.35 77.825L69.95 54.2H62.075L57.35 63.125L52.1 54.2H44.225Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M45.8 21.125L62.075 54.2H29L45.8 21.125ZM45.8 41.075L52.1 54.2H38.975L45.8 41.075Z"
        fill="white"
      />
    </svg>
  );
}
