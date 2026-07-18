// MK target logo. A continuous ring whose opacity fades CLOCKWISE from an anchor
// quarter, plus a solid center dot with a thin grey ring. Per design system:
// MK Campaign anchors BOTTOM-RIGHT in amber. The fade is a real progressive
// gradient — clearly dimmer by halfway, clearly faded by 3/4 — not flat-then-cliff.

export default function MKLogo({ size = 38, accent = "#E3B23C", wordmark = true, onNavy = true }) {
  const cx = 60, cy = 60, r = 42, steps = 90;
  const seg = 360 / steps;
  // anchor at bottom-right = 45° in SVG coords (x right, y down). Ring starts full
  // opacity at the anchor and fades clockwise (increasing angle).
  const anchor = 45;

  // progressive fade: near-linear falloff from 1.0 at anchor to ~0.05 just before
  // wrapping back. Eased slightly so the drop is perceptible by the halfway mark.
  const opacityAt = (frac) => {
    // frac 0..1 around the ring from the anchor
    const eased = Math.pow(frac, 0.85);           // gentle ease so mid is clearly dimmer
    return Math.max(0.05, 1 - eased * 0.95);
  };

  const arcs = [];
  for (let i = 0; i < steps; i++) {
    const a0 = anchor + i * seg;
    const a1 = a0 + seg + 0.6;
    const op = opacityAt(i / (steps - 1));
    const x0 = cx + r * Math.cos((a0 * Math.PI) / 180);
    const y0 = cy + r * Math.sin((a0 * Math.PI) / 180);
    const x1 = cx + r * Math.cos((a1 * Math.PI) / 180);
    const y1 = cy + r * Math.sin((a1 * Math.PI) / 180);
    arcs.push(
      <path key={i} d={`M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`}
        stroke={accent} strokeWidth="7" strokeLinecap="round" fill="none" opacity={op.toFixed(3)} />
    );
  }

  const ringGrey = onNavy ? "#37506B" : "#C7C2B4";
  const mkColor = onNavy ? "#F3F6F9" : "#1A2230";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-label="MK Campaign">
        {arcs}
        <circle cx="60" cy="60" r="15" fill="none" stroke={ringGrey} strokeWidth="4" />
        <circle cx="60" cy="60" r="8" fill={accent} />
      </svg>
      {wordmark && (
        <span style={{ fontSize: size * 0.5, fontWeight: 700, letterSpacing: "-0.01em", color: mkColor }}>
          MK <span style={{ color: accent }}>Campaign</span>
        </span>
      )}
    </span>
  );
}
