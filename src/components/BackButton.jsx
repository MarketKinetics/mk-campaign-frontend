// Shared Back button, gold box, matching the other CTAs. Goes exactly one page
// back (via onBack from App's history stack). Renders nothing if there's nowhere
// to go back to.
//   default : absolute top-right (pages with no button cluster)
//   inline  : renders as a normal flex child (pages that already have a
//             top-right cluster, e.g. Plan — avoids floating over them)
export default function BackButton({ onBack, inline = false }) {
  if (!onBack) return null;
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "var(--mk-accent, #E3B23C)", color: "#1A2230",
    border: "none", borderRadius: 10, cursor: "pointer",
    fontSize: 14, fontWeight: 600, padding: "9px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,.12)",
  };
  const placement = inline
    ? {}
    : { position: "absolute", top: 20, right: 24, zIndex: 30 };
  return (
    <button onClick={onBack} aria-label="Back" style={{ ...base, ...placement }}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> Back
    </button>
  );
}
