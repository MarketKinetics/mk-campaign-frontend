import MKLogo from "../components/MKLogo";
import BackButton from "../components/BackButton";
import { DEMOS } from "../examples/index";

// Guided demo picker. Two examples, each launches the wizard in demo mode (fields
// pre-filled + locked) and ends on a pre-generated finished plan. No live build,
// no data entry — a tour of the platform that always lands on a great plan.
export default function Demo({ onLaunchDemo, onBack, onExit }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-cream)", position: "relative" }}>
      <BackButton onBack={onBack} onNavy />
      <div className="mk-navy-band" style={{ padding: "22px 40px 34px" }}>
        <MKLogo size={30} onNavy />
        <div className="mk-eyebrow" style={{ color: "var(--mk-accent)", marginTop: 20 }}>See how it works</div>
        <h1 className="mk-h1" style={{ color: "#F3F6F9", marginTop: 6 }}>Two ways to plan a campaign</h1>
        <p className="mk-sub" style={{ marginTop: 6 }}>
          Walk through a pre-filled example — click through the setup, then see the finished plan MK produces.
        </p>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 90px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {DEMOS.map((d) => (
            <div key={d.id} className="mk-card" style={{ display: "flex", flexDirection: "column" }}>
              <div className="mk-eyebrow" style={{ color: "var(--mk-accent)" }}>{d.tagline}</div>
              <h2 className="mk-h2" style={{ marginTop: 6, marginBottom: 8 }}>{d.name}</h2>
              <p className="mk-sub" style={{ marginBottom: 20, flex: 1 }}>{d.description}</p>
              <button className="mk-btn mk-btn-primary" style={{ alignSelf: "flex-start" }}
                onClick={() => onLaunchDemo(d)}>
                Walk me through it →
              </button>
            </div>
          ))}
        </div>
        <p className="mk-hint" style={{ textAlign: "center", marginTop: 26 }}>
          Want to plan your own?{" "}
          <button className="mk-link" onClick={onExit}
            style={{ background: "none", border: "none", color: "var(--mk-accent-ink, #B8860B)", cursor: "pointer", font: "inherit", padding: 0, textDecoration: "underline" }}>
            Start a real campaign →
          </button>
        </p>
      </div>
    </div>
  );
}
