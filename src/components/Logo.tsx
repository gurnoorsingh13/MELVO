import { MARK_POLYGONS, WORDMARK_DOT, WORDMARK_TEXT, WORDMARK_VIEWBOX } from "@/lib/logo";

/** Horizontal logo. Colours follow `currentColor`; the dot and panel 2 stay firozi. */
export function Logo({ className, withMark = true }: { className?: string; withMark?: boolean }) {
  const [, top, w, h] = WORDMARK_VIEWBOX.split(" ").map(Number);
  const markH = 745;
  const markW = (100 / 80) * markH;
  const gap = markH * 0.3;
  const total = withMark ? markW + gap + w : w;
  return (
    <svg className={className} viewBox={`0 ${top} ${total} ${h}`} role="img" aria-label="MELVO">
      {withMark && (
        <g transform={`translate(0 ${top}) scale(${markH / 80})`}>
          {MARK_POLYGONS.map((p, i) => (
            <polygon key={i} points={p} fill={i === 1 ? "var(--firozi)" : "currentColor"} />
          ))}
        </g>
      )}
      <g transform={withMark ? `translate(${markW + gap} 0)` : undefined}>
        <path d={WORDMARK_TEXT} fill="currentColor" />
        <path d={WORDMARK_DOT} fill="var(--firozi)" />
      </g>
    </svg>
  );
}
