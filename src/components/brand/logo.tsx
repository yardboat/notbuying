import { LOGO_CLEAN, LOGO_GEO, LOGO_ORDER } from "./logo-paths";

const INK = "var(--ink)";
const HOT = "var(--hot)";

/**
 * Direction A, "The Filled O": NOT over BUYING, the O's counter overfilled in hot, off-register.
 * Static and server-safe. Accessible name lives on the svg (role="img").
 */
export function LogoLockup({ className, title = "Not Buying" }: { className?: string; title?: string }) {
  const { dot } = LOGO_GEO;
  return (
    <svg
      className={className}
      viewBox={`-2 -6 ${LOGO_GEO.w + 4} ${LOGO_GEO.h + 10}`}
      role="img"
      aria-label={title}
      focusable="false"
    >
      {LOGO_ORDER.map((k) => (
        <path key={k} d={LOGO_CLEAN[k]} fill={INK} />
      ))}
      <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={HOT} />
    </svg>
  );
}
