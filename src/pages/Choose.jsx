import { useState } from "react";
import MKLogo from "../components/MKLogo";
import BackButton from "../components/BackButton";
import StepHeader from "../components/StepHeader";
import { humanize } from "../lib/humanize";

// Choose — the human-pick checkpoint. Shows candidate message strategies as cards;
// the user locks one, which drives finalize. Candidates come from build-candidates.
export default function Choose({ candidates = [], onLock, busy, onBack }) {
  const [picked, setPicked] = useState(candidates[0]?.candidate_id || null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-cream)", position: "relative" }}>
      <BackButton onBack={onBack} onNavy />
      <div className="mk-navy-band" style={{ padding: "22px 40px 26px" }}>
        <MKLogo size={30} onNavy />
        <div style={{ marginTop: 22 }}><StepHeader current="choose" /></div>
        <h1 className="mk-h1" style={{ color: "#F3F6F9", marginTop: 22 }}>Choose your message strategy</h1>
        <p className="mk-sub" style={{ marginTop: 6 }}>
          MK generated these candidates. Lock the one to build your plan around.
        </p>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "34px 24px 90px", display: "flex", flexDirection: "column", gap: 16 }}>
        {candidates.map((c) => {
          const on = picked === c.candidate_id;
          return (
            <button key={c.candidate_id} onClick={() => setPicked(c.candidate_id)}
              style={{ textAlign: "left", cursor: "pointer", padding: 0, border: "none", background: "none" }}>
              <div className="mk-card" style={{ borderColor: on ? "var(--mk-accent)" : "var(--mk-border)",
                                                 borderWidth: on ? 2 : 1, transition: "border-color .12s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <h2 className="mk-h2" style={{ fontSize: 20 }}>&ldquo;{c.headline}&rdquo;</h2>
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                                 border: `2px solid ${on ? "var(--mk-accent)" : "var(--mk-border)"}`,
                                 background: on ? "var(--mk-accent)" : "transparent",
                                 display: "grid", placeItems: "center", color: "#241a05", fontSize: 13 }}>
                    {on ? "✓" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {c.appeal && <span className="mk-tag">{humanize(c.appeal)}</span>}
                  {c.technique && <span className="mk-tag">{humanize(c.technique)}</span>}
                </div>
                {c.differentiation_rationale && (
                  <p style={{ fontSize: 14, color: "var(--mk-grey)", marginTop: 12, lineHeight: 1.5 }}>
                    {c.differentiation_rationale}
                  </p>
                )}
                {(c.craft_score != null || c.resonance) && (
                  <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 13, color: "var(--mk-grey)" }}>
                    {c.craft_score != null && <span>Craft <b className="mk-mono" style={{ color: "var(--mk-ink)" }}>{Number(c.craft_score).toFixed(3)}</b></span>}
                    {c.resonance && <span>Resonance <b className="mk-mono" style={{ color: "var(--mk-ink)" }}>{c.resonance.total}/{c.resonance.max}</b></span>}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <button className="mk-btn mk-btn-ghost-ink" onClick={onBack}>← Back</button>
          <button className="mk-btn mk-btn-primary" disabled={!picked || busy}
            onClick={() => onLock(picked)}>
            {busy ? "Building plan…" : "Lock & build plan →"}
          </button>
        </div>
      </div>
    </div>
  );
}
