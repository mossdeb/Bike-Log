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
    <svg viewBox="0 0 84 84" className={className} aria-hidden="true">
      <circle cx="42" cy="42" r="42" fill="#FC4C02" />
      <path
        opacity="0.6"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36.225 46.2L49.35 69.825L61.95 46.2H54.075L49.35 55.125L44.1 46.2H36.225Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M37.8 13.125L54.075 46.2H21L37.8 13.125ZM37.8 33.075L44.1 46.2H30.975L37.8 33.075Z"
        fill="white"
      />
    </svg>
  );
}
