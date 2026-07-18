import { useState } from "react";
import MKLogo from "../components/MKLogo";
import BackButton from "../components/BackButton";
import { readTar } from "../lib/tar";
import { EXAMPLE_TARS } from "../examples/index";

// Live Demo — mirrors MK Intel's "Run live" card. Pre-loaded example TARs the user
// can launch a campaign from without their own data. Picking one hands the TAR to the
// wizard (pre-loaded). "Or upload your own" routes to the normal wizard.
export default function Demo({ onLaunch, onUpload, onExit, onBack }) {
  const [selected, setSelected] = useState(EXAMPLE_TARS[0]?.id || null);
  const chosen = EXAMPLE_TARS.find((e) => e.id === selected);
  const info = chosen ? readTar(chosen.tar) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-cream)", position: "relative" }}>
      <BackButton onBack={onBack} onNavy />
      <div className="mk-navy-band" style={{ padding: "22px 40px 34px" }}>
        <MKLogo size={30} onNavy />
        <div className="mk-eyebrow" style={{ color: "var(--mk-accent)", marginTop: 20 }}>Live demo</div>
        <h1 className="mk-h1" style={{ color: "#F3F6F9", marginTop: 6 }}>See MK Campaign in action</h1>
        <p className="mk-sub" style={{ marginTop: 6 }}>
          Launch a full campaign plan on a pre-loaded audience — no upload needed.
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 90px" }}>
        <div className="mk-card">
          <h2 className="mk-h2" style={{ textAlign: "center" }}>Run a live campaign</h2>
          <p className="mk-sub" style={{ textAlign: "center", marginTop: 8, marginBottom: 22 }}>
            Pick a pre-loaded audience report and launch the real planning pipeline.
          </p>

          {EXAMPLE_TARS.length === 0 ? (
            <p className="mk-hint" style={{ textAlign: "center" }}>
              No example TARs bundled yet. Drop TAR JSON files into <code className="mk-mono">src/examples/</code>.
            </p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(EXAMPLE_TARS.length, 2)}, 1fr)`, gap: 12 }}>
                {EXAMPLE_TARS.map((ex) => (
                  <button key={ex.id} onClick={() => setSelected(ex.id)}
                    style={{
                      textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                      background: selected === ex.id ? "var(--mk-accent-tint)" : "#fff",
                      border: `1.5px solid ${selected === ex.id ? "var(--mk-accent)" : "var(--mk-border)"}`,
                    }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                    <div className="mk-hint" style={{ margin: "2px 0 0" }}>{ex.tagline}</div>
                  </button>
                ))}
              </div>

              {chosen && (
                <div style={{ marginTop: 16, padding: "14px 16px", background: "#FBF9F3",
                              borderRadius: 10, border: "1px solid var(--mk-border)" }}>
                  <div className="mk-eyebrow" style={{ marginBottom: 6 }}>Selected audience</div>
                  <div style={{ fontSize: 14 }}>{chosen.description}</div>
                  {info?.objective && <div style={{ fontSize: 13, color: "var(--mk-grey)", marginTop: 6 }}>
                    Objective: {info.objective}
                  </div>}
                </div>
              )}

              <button className="mk-btn mk-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
                onClick={() => onLaunch(chosen)}>Launch campaign →</button>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button onClick={onUpload}
                  style={{ background: "none", border: "none", color: "var(--mk-accent-ink)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  Or upload your own TAR →
                </button>
              </div>
            </>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={onExit} style={{ background: "none", border: "none", color: "var(--mk-grey)", cursor: "pointer", fontSize: 14 }}>← Back to home</button>
        </div>
      </div>
    </div>
  );
}
