import MKLogo from "../components/MKLogo";

const GOLD = "#E3B23C";
const GOLD_INK = "#8A6D1E";
const GOLD_TINT = "#FBF6E8";
const GOLD_BORDER = "#E8D9A8";

// MK Campaign landing — full page mirroring MK Intel's structure:
// navy hero (unchanged) -> white "better planner" section -> cream live-example
// + how-it-works -> footer. Gold accent throughout; circle mark anchors bottom-right.
export default function Landing({ onStart, onDemo }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* ============ NAVY HERO (unchanged) ============ */}
      <div className="mk-navy-band">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "22px 40px" }}>
          <MKLogo size={34} onNavy />
          <button className="mk-btn mk-btn-ghost" onClick={onDemo}
                  style={{ padding: "8px 18px", fontSize: 14 }}>See how it works</button>
        </div>

        <div style={{ maxWidth: 920, margin: "0 auto", padding: "70px 24px 90px", textAlign: "center" }}>
          <div className="mk-pill-badge" style={{ marginBottom: 34 }}>
            <span className="dot" /> Behavioral campaign planning · Reach-modeled
          </div>

          <h1 className="mk-display" style={{ color: "#F3F6F9" }}>
            Know your audience.<br />
            <span className="mk-accent-metal">Own the campaign.</span>
          </h1>

          <p className="mk-sub" style={{ maxWidth: 600, margin: "26px auto 0" }}>
            Turn any audience and marketing objective into a sequenced, multi-channel campaign
            plan. Reach-modeled, honestly projected, ready to run.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 44 }}>
            <button className="mk-btn mk-btn-primary" onClick={onStart}>
              Plan your campaign
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </button>
            <button className="mk-btn mk-btn-ghost" onClick={onDemo}>See how it works</button>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", marginTop: 90, paddingTop: 40,
                        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              ["3-stage", "Funnel-modeled", "awareness → consideration → conversion"],
              ["Multi-channel", "20 channels", "reach-optimized per stage"],
              ["AI-augmented", "Reality-grounded", "sourced benchmarks, not guesses"],
            ].map(([n, l, s]) => (
              <div key={l}>
                <div className="mk-stat-n">{n}</div>
                <div className="mk-stat-l">{l}</div>
                <div className="mk-stat-s">{s}</div>
              </div>
            ))}
          </div>

          {/* scroll cue */}
          <div style={{ marginTop: 54, color: GOLD, fontSize: 22, opacity: 0.7 }}>⌄</div>
        </div>
      </div>

      {/* ============ WHITE — "A BETTER CAMPAIGN PLANNER" ============ */}
      <div style={{ background: "#fff", padding: "88px 24px 96px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "#6B7A8D",
                        textTransform: "uppercase", marginBottom: 30 }}>
            A better campaign planner
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, lineHeight: 1.22,
                       color: "#1A2230", margin: 0, letterSpacing: "-0.01em" }}>
            Unlike media schedulers that just place ads, MK Campaign builds a{" "}
            <span style={{ color: GOLD_INK }}>behavioral plan</span>. The right message, on the
            right channels, sequenced across the funnel.
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 40 }}>
            {["Message strategy", "Channel mix", "Reach & frequency", "Budget optimization", "Conversion projection"].map((p) => (
              <span key={p} style={{ padding: "9px 18px", borderRadius: 999, fontSize: 15,
                                     background: GOLD_TINT, color: GOLD_INK, border: `1px solid ${GOLD_BORDER}`,
                                     fontWeight: 500 }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ============ CREAM — LIVE EXAMPLE + HOW IT WORKS ============ */}
      <div style={{ background: "var(--mk-cream, #F7F4ED)", padding: "80px 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* live example */}
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "#6B7A8D",
                        textTransform: "uppercase", marginBottom: 22 }}>
            Live example
          </div>
          <button onClick={onDemo}
            style={{ width: "100%", maxWidth: 560, textAlign: "left", cursor: "pointer",
                     background: "#fff", border: `1px solid ${GOLD_BORDER}`, borderRadius: 14,
                     padding: "24px 26px", display: "block", transition: "box-shadow .15s, transform .15s",
                     boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(227,178,60,.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: "#1A2230" }}>Subscription Renewals</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: GOLD_INK, background: GOLD_TINT,
                             border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "4px 12px" }}>Subscription</span>
            </div>
            <p style={{ fontSize: 15, color: "#55606E", lineHeight: 1.55, margin: "12px 0 16px" }}>
              Moderate-engagement subscribers whose renewal runs on habit. The goal: keep them
              through the next billing cycle without triggering a re-think.
            </p>
            <span style={{ fontSize: 15, fontWeight: 600, color: GOLD_INK }}>Launch this campaign →</span>
          </button>

          {/* how it works */}
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "#6B7A8D",
                        textTransform: "uppercase", margin: "72px 0 26px" }}>
            How it works
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
            {[
              ["You set the goals",
               "You define the audience, objective, budget, and channels through simple controls; MK resolves them into campaign parameters. You own the targets; the model does the math."],
              ["MK crafts the message",
               "A message strategy is built from the audience's behavioral profile. Without a full report, it's drafted and ranked by our engagement evaluator. The right angle, chosen on evidence."],
              ["The plan optimizes itself",
               "MK sequences the campaign across the funnel and allocates budget across channels for the best reach and conversion mix, with honest, sourced projections."],
            ].map(([title, body]) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #EAE6DC", borderRadius: 14,
                                        padding: "26px 24px" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: GOLD_TINT,
                              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <MKLogo size={26} wordmark={false} onNavy={false} accent={GOLD} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#1A2230", margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontSize: 14.5, color: "#55606E", lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <div style={{ background: "#fff", borderTop: "1px solid #EEE", padding: "30px 24px", textAlign: "center" }}>
        <span style={{ fontSize: 14, color: "#8A93A0" }}>MK Campaign · Market Kinetics platform</span>
      </div>
    </div>
  );
}
