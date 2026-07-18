import { useState } from "react";
import MKLogo from "../components/MKLogo";
import BackButton from "../components/BackButton";

// Entry — the "Plan your campaign" landing pad. Two card paths (Upload TAR /
// Describe your audience), mirroring the Demo page's card-selection structure.
// Picking one enters the Wizard pre-set to that mode.
export default function Entry({ onChoose, onExit, onBack }) {
  const [selected, setSelected] = useState("upload");

  const PATHS = [
    ["upload", "Upload a TAR", "Have a Target Audience Report from MK Intel? Upload it. MK reads the audience and objective straight from it."],
    ["describe", "Describe your audience", "No TAR yet? Describe who you're targeting and what you want them to do, and MK takes it from there."],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-cream)", position: "relative" }}>
      <BackButton onBack={onBack} onNavy />
      <div className="mk-navy-band" style={{ padding: "22px 40px 34px" }}>
        <MKLogo size={30} onNavy />
        <div className="mk-eyebrow" style={{ color: "var(--mk-accent)", marginTop: 20 }}>New campaign</div>
        <h1 className="mk-h1" style={{ color: "#F3F6F9", marginTop: 6 }}>Plan your campaign</h1>
        <p className="mk-sub" style={{ marginTop: 6 }}>Start from a TAR, or describe your audience. Either way, MK builds the plan.</p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 90px" }}>
        <div className="mk-card">
          <h2 className="mk-h2" style={{ textAlign: "center" }}>How do you want to start?</h2>
          <p className="mk-sub" style={{ textAlign: "center", marginTop: 8, marginBottom: 22 }}>
            Pick a path; you can switch inside the setup too.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PATHS.map(([id, name, desc]) => (
              <button key={id} onClick={() => setSelected(id)}
                style={{
                  textAlign: "left", padding: "18px 18px", borderRadius: 12, cursor: "pointer",
                  background: selected === id ? "var(--mk-accent-tint)" : "#fff",
                  border: `1.5px solid ${selected === id ? "var(--mk-accent)" : "var(--mk-border)"}`,
                }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
                <div className="mk-hint" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>{desc}</div>
              </button>
            ))}
          </div>

          <button className="mk-btn mk-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
            onClick={() => onChoose(selected)}>Continue →</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={onExit} style={{ background: "none", border: "none", color: "var(--mk-grey)", cursor: "pointer", fontSize: 14 }}>← Back to home</button>
        </div>
      </div>
    </div>
  );
}
