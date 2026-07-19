import React from "react";
import { useState, useEffect } from "react";
import MKLogo from "../components/MKLogo";
import BackButton from "../components/BackButton";
import { readTar } from "../lib/tar";
import { getChannels } from "../api/client";

// MK Campaign setup wizard — 3 steps, matching the MK Intel stepped-card pattern.
//   1. Audience & Objective (TAR-aware: if a TAR is present, its objective is fetched
//      and shown read-only; if not, the user states "Target Audience does X").
//   2. Parameters (audience size, budget, duration, warm/cold, advanced reach).
//   3. Review & Build (summary + BYO-key box + data notice + build).
// Assembles the rich {value,unit} build-candidates payload and hands it up via onBuild.

const OBJECTIVE_UNITS = [
  ["count", "conversions", "Absolute number of conversions"],
  ["pct_of_audience", "% of audience", "Percent of the total audience"],
  ["pct_of_reached", "% of reached", "Percent of the people actually reached"],
  ["cac_usd", "$ max CAC", "Max cost per acquisition → implies a count from budget"],
  ["roas", "× ROAS", "Return on ad spend → implies a count (needs AOV)"],
];

const STEP_TITLES = ["Audience & objective", "Parameters", "Review & build"];



function Dots({ step }) {
  return (
    <div className="mk-steps" style={{ justifyContent: "center", marginBottom: 30 }}>
      {[0, 1, 2].map((i) => {
        const state = i < step ? "done" : i === step ? "active" : "todo";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div className={`mk-step ${state}`}>
              <span className="num" style={numStyle(state)}>{i < step ? "✓" : i + 1}</span>
            </div>
            {i < 2 && <span className="mk-step-sep" style={{ background: i < step ? "var(--mk-accent)" : "var(--mk-border)" }} />}
          </div>
        );
      })}
    </div>
  );
}
function numStyle(state) {
  if (state === "todo") return { background: "#EDE8DC", color: "var(--mk-grey)", border: "none" };
  return {};
}

export default function Wizard({ initialTar = null, initialMode = "upload", onBuild, busy, needsKey = false, onExit, onBack }) {
  const [step, setStep] = useState(0);

  // audience & objective
  const [taMode, setTaMode] = useState(initialTar ? "upload" : initialMode);
  const [tar, setTar] = useState(initialTar);
  const [tarName, setTarName] = useState(initialTar ? "example TAR" : "");
  const [tarError, setTarError] = useState("");
  const tarInfo = tar ? readTar(tar) : null;

  const [describeTA, setDescribeTA] = useState("");
  const [describeObj, setDescribeObj] = useState("");   // "Target Audience does X" (no-TAR path)
  const [pickedChannels, setPickedChannels] = useState([]);   // populated once channels load

  // always-asked campaign specifics (not in the TAR)
  const [action, setAction] = useState("");
  const [productWhat, setProductWhat] = useState("");
  const [company, setCompany] = useState("");   // optional brand/company context → feeds message generation

  // objective knob
  const [objVal, setObjVal] = useState(150);
  const [objUnit, setObjUnit] = useState("count");
  const [aov, setAov] = useState(1200);

  // parameters
  const [audience, setAudience] = useState(10000);
  const [campaignType, setCampaignType] = useState("cold");
  const [forbiddenChannels, setForbiddenChannels] = useState([]);
  const [allChannels, setAllChannels] = useState([]);   // full universe from the rulebook
  useEffect(() => {
    getChannels()
      .then((d) => {
        const ch = d.channels || [];
        setAllChannels(ch);
        // default the describe-path picker to a few common digital channels
        const defaults = ch.filter((c) => ["email", "facebook", "sem"].includes(c.key)).map((c) => c.label);
        setPickedChannels(defaults);
      })
      .catch(() => setAllChannels([]));
  }, []);
  const [budgetVal, setBudgetVal] = useState(50000);
  const [budgetUnit, setBudgetUnit] = useState("total_usd");
  const [durMode, setDurMode] = useState("derive");
  const [durVal, setDurVal] = useState(24);
  const [showAdv, setShowAdv] = useState(false);
  const [threshold, setThreshold] = useState(65);
  const [freqK, setFreqK] = useState(3);
  const [showPricing, setShowPricing] = useState(false);
  const [priceOverrides, setPriceOverrides] = useState({});   // {channel_key: {value, basis}}
  function setChannelPrice(key, basis, raw) {
    setPriceOverrides((prev) => {
      const next = { ...prev };
      const v = String(raw).trim();
      if (v === "") { delete next[key]; }
      else { const n = Number(v); if (!Number.isNaN(n)) next[key] = { value: n, basis }; }
      return next;
    });
  }

  // BYO key
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  async function handleFile(e) {
    setTarError("");
    const f = e.target.files[0];
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      if (!parsed.vulnerabilities) { setTarError("That file isn't a valid TAR (no vulnerabilities block)."); return; }
      setTar(parsed); setTarName(f.name);
    } catch { setTarError("Couldn't read that file as TAR JSON."); }
  }

  // step validation
  const describeReady = describeTA.trim() && describeObj.trim() && pickedChannels.length > 0;
  const step1ok = (tar || describeReady) && action.trim() && productWhat.trim();
  const objOk = Number(objVal) > 0;
  const inputsOk = Number(audience) > 0 && Number(budgetVal) > 0 && objOk;
  const canBuild = (tar || describeReady) && action.trim() && productWhat.trim() && inputsOk && !busy;

  function buildPayload() {
    const base = {
      product_what: productWhat.trim(),
      action: action.trim(),
      audience_size: Number(audience),
      campaign_type: campaignType,
      budget_usd: { value: Number(budgetVal), unit: budgetUnit },
      campaign_days: durMode === "derive" ? null : { value: Number(durVal), unit: durMode },
      target: { value: Number(objVal), unit: objUnit },
      ...(objUnit === "roas" ? { aov_usd: Number(aov) } : {}),
      reach_threshold_pct: Number(threshold) / 100,
      effective_frequency_k: Number(freqK),
      campaign_code: `MKC-${Date.now().toString(36).toUpperCase()}`,
      ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}),
      ...(forbiddenChannels.length ? { user_forbidden_channels: forbiddenChannels } : {}),
      ...(Object.keys(priceOverrides).length ? { pricing_overrides: priceOverrides } : {}),
    };
    if (tar) {
      return { ...base, tar, ...(company.trim() ? { company: company.trim() } : {}) };
    }
    // Describe path (no TAR): send the description + chosen channels for the lighter plan.
    // company (if given) rides in `describe` so the message generator can use it.
    return {
      ...base,
      tar: {},
      describe: { audience: describeTA.trim(), objective: describeObj.trim(),
                  ...(company.trim() ? { company: company.trim() } : {}) },
      channels: pickedChannels.map((label) => ({ channel: label, reach_quality: 4 })),
    };
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-cream)", position: "relative" }}>
      <BackButton onBack={onBack} onNavy />
      {/* navy header */}
      <div className="mk-navy-band" style={{ padding: "22px 40px 30px" }}>
        <MKLogo size={30} onNavy />
        <div className="mk-eyebrow" style={{ color: "var(--mk-accent)", marginTop: 20 }}>New campaign</div>
        <h1 className="mk-h1" style={{ color: "#F3F6F9", marginTop: 6 }}>Set up your campaign</h1>
        <p className="mk-sub" style={{ marginTop: 6 }}>
          Give MK the audience and your objective — every number takes the unit you think in.
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "34px 24px 90px" }}>
        <Dots step={step} />

        <div className="mk-card">
          <div className="mk-eyebrow">Step {step + 1} of 3</div>
          <h2 className="mk-h2" style={{ marginTop: 4, marginBottom: 20 }}>{STEP_TITLES[step]}</h2>

          {/* ---------- STEP 1: Audience & Objective ---------- */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="mk-seg" style={{ alignSelf: "flex-start" }}>
                <button className={taMode === "upload" ? "on" : ""} onClick={() => setTaMode("upload")}>Upload TAR</button>
                <button className={taMode === "describe" ? "on" : ""} onClick={() => setTaMode("describe")}>Describe</button>
              </div>

              {taMode === "upload" ? (
                <div>
                  {initialTar ? (
                    <div className="mk-hint" style={{ margin: 0, color: "var(--mk-accent-ink)" }}>
                      ✓ Example audience pre-loaded — set your goal below, or <label style={{ textDecoration: "underline", cursor: "pointer" }}>upload your own<input type="file" accept="application/json,.json" onChange={handleFile} style={{ display: "none" }} /></label>.
                    </div>
                  ) : (
                    <input type="file" accept="application/json,.json" onChange={handleFile} />
                  )}
                  {tarError && <p className="mk-hint" style={{ color: "#C0473B" }}>{tarError}</p>}
                  {tarInfo && (
                    <div style={{ marginTop: 14, padding: "14px 16px", background: "var(--mk-accent-tint)",
                                  borderRadius: 10, border: "1px solid rgba(212,175,55,0.3)" }}>
                      <div className="mk-hint" style={{ color: "var(--mk-accent-ink)", margin: 0 }}>✓ {tarName}</div>
                      {tarInfo.audienceName &&
                        <div style={{ marginTop: 8, fontSize: 14 }}><b>Audience:</b> {tarInfo.audienceName}</div>}
                      {tarInfo.objective &&
                        <div style={{ marginTop: 4, fontSize: 14 }}><b>Objective (from TAR):</b> {tarInfo.objective}</div>}
                      <p className="mk-hint" style={{ marginTop: 6 }}>
                        The objective is read from your TAR — no need to re-enter it.
                      </p>
                    </div>
                  )}
                  {!initialTar && <p className="mk-hint">Upload a Target Audience Report from MK Intel.</p>}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="mk-label">Describe your target audience</label>
                    <textarea className="mk-input" rows={2} placeholder="Who are they? e.g. lapsed monthly donors, aged 45-65…"
                      value={describeTA} onChange={(e) => setDescribeTA(e.target.value)} />
                  </div>
                  <div>
                    <label className="mk-label">Objective — what should the Target Audience do?</label>
                    <input className="mk-input" placeholder="e.g. Target Audience renews their subscription"
                      value={describeObj} onChange={(e) => setDescribeObj(e.target.value)} />
                    <p className="mk-hint">Phrase it as an action: “Target Audience <i>renews their subscription</i> / <i>enrolls in coverage</i> / <i>donates monthly</i>.”</p>
                  </div>
                  <div>
                    <label className="mk-label">Which channels can reach them?</label>
                    {["digital", "non_digital"].map((grp) => {
                      const items = allChannels.filter((c) => c.group === grp);
                      if (!items.length) return null;
                      return (
                        <div key={grp} style={{ marginTop: 8 }}>
                          <div className="mk-hint" style={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em", fontSize: 11 }}>
                            {grp === "digital" ? "Digital" : "Non-digital"}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {items.map((c) => {
                              const on = pickedChannels.includes(c.label);
                              return (
                                <button key={c.key} type="button"
                                  onClick={() => setPickedChannels((p) =>
                                    p.includes(c.label) ? p.filter((x) => x !== c.label) : [...p, c.label])}
                                  style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 13,
                                           border: `1.5px solid ${on ? "var(--mk-accent)" : "var(--mk-border)"}`,
                                           background: on ? "var(--mk-accent-tint)" : "#fff",
                                           color: on ? "var(--mk-accent-ink)" : "var(--mk-grey)", fontWeight: on ? 600 : 400 }}>
                                  {on ? "✓ " : ""}{c.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <p className="mk-hint">Pick the channels that can actually reach this audience. MK reach-models only these.</p>
                  </div>
                  <div style={{ padding: "12px 14px", background: "#FBF6E8", borderRadius: 8, border: "1px solid #E8D9A8" }}>
                    <p style={{ fontSize: 13, color: "#8A6D1E", margin: 0, lineHeight: 1.5 }}>
                      Without a Target Audience Report, MK builds the reach, timing and cost plan from your inputs and
                      suggests a message — but the message isn’t drawn from a full behavioral analysis. For that, run your
                      audience through MK Intel first.
                    </p>
                  </div>
                </div>
              )}

              {/* always-asked campaign specifics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="mk-label">Action verb</label>
                  <input className="mk-input" placeholder="enroll · subscribe · donate · renew"
                    value={action} onChange={(e) => setAction(e.target.value)} />
                </div>
                <div>
                  <label className="mk-label">What are you promoting?</label>
                  <input className="mk-input" placeholder="roadside coverage · the premium tier · a recurring gift"
                    value={productWhat} onChange={(e) => setProductWhat(e.target.value)} />
                </div>
              </div>

              {/* optional brand/company context — sharpens message generation */}
              <div>
                <label className="mk-label">Tell us about your brand or company <span style={{ color: "var(--mk-grey)", fontWeight: 400 }}>(optional)</span></label>
                <textarea className="mk-input" rows={2}
                  placeholder="e.g. a budget-friendly national gym chain known for 24/7 access and no-contract plans"
                  value={company} onChange={(e) => setCompany(e.target.value)} />
                <p className="mk-hint">Helps MK tune the message to your brand's voice and positioning. Doesn't change the reach or cost model.</p>
              </div>

              {/* objective measurement */}
              <div style={{ padding: "16px 18px", background: "#FBF9F3", borderRadius: 12, border: "1px solid var(--mk-border)" }}>
                <label className="mk-label">How do you measure the effectiveness?</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <input className="mk-input" type="number" min={1} style={{ width: 120 }} value={objVal}
                    onChange={(e) => setObjVal(e.target.value)} />
                  <div className="mk-seg" style={{ flexWrap: "wrap" }}>
                    {OBJECTIVE_UNITS.map(([u, lbl]) => (
                      <button key={u} className={objUnit === u ? "on" : ""} onClick={() => setObjUnit(u)}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <p className="mk-hint">{OBJECTIVE_UNITS.find(([u]) => u === objUnit)?.[2]}</p>
                {!objOk && (
                  <p className="mk-hint" style={{ color: "#C0473B" }}>
                    Target must be a positive number.
                  </p>
                )}
                {objUnit === "roas" && (
                  <div style={{ marginTop: 10 }}>
                    <label className="mk-label">Average order value (for ROAS → count)</label>
                    <input className="mk-input" type="number" style={{ width: 150 }} value={aov}
                      onChange={(e) => setAov(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- STEP 2: Parameters ---------- */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label className="mk-label">Audience size</label>
                <input className="mk-input" type="number" min={1} value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
              <div>
                <label className="mk-label">Relationship</label>
                <div className="mk-seg">
                  <button className={campaignType === "cold" ? "on" : ""} onClick={() => setCampaignType("cold")}>Cold (new)</button>
                  <button className={campaignType === "warm" ? "on" : ""} onClick={() => setCampaignType("warm")}>Warm (existing)</button>
                </div>
                <p className="mk-hint">Warm narrows the funnel gently; cold narrows hard.</p>
              </div>
              <div>
                <label className="mk-label">Budget</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="mk-input" type="number" min={1} style={{ flex: 1 }} value={budgetVal}
                    onChange={(e) => setBudgetVal(e.target.value)} />
                  <div className="mk-seg">
                    <button className={budgetUnit === "total_usd" ? "on" : ""} onClick={() => setBudgetUnit("total_usd")}>total</button>
                    <button className={budgetUnit === "per_day_usd" ? "on" : ""} onClick={() => setBudgetUnit("per_day_usd")}>/day</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="mk-label">Duration</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="mk-seg">
                    <button className={durMode === "derive" ? "on" : ""} onClick={() => setDurMode("derive")}>Derive</button>
                    <button className={durMode === "days" ? "on" : ""} onClick={() => setDurMode("days")}>Days</button>
                    <button className={durMode === "weeks" ? "on" : ""} onClick={() => setDurMode("weeks")}>Weeks</button>
                  </div>
                  {durMode !== "derive" && (
                    <input className="mk-input" type="number" style={{ width: 80 }} value={durVal}
                      onChange={(e) => setDurVal(e.target.value)} />
                  )}
                </div>
                <p className="mk-hint">Derive = MK finds the length needed to hit reach targets.</p>
              </div>
              {tar && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="mk-label">Exclude channels (optional)</label>
                  {["digital", "non_digital"].map((grp) => {
                    const items = allChannels.filter((c) => c.group === grp);
                    if (!items.length) return null;
                    return (
                      <div key={grp} style={{ marginTop: 8 }}>
                        <div className="mk-hint" style={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em", fontSize: 11 }}>
                          {grp === "digital" ? "Digital" : "Non-digital"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {items.map((c) => {
                            const on = forbiddenChannels.includes(c.key);
                            return (
                              <button key={c.key} type="button"
                                onClick={() => setForbiddenChannels((f) =>
                                  f.includes(c.key) ? f.filter((x) => x !== c.key) : [...f, c.key])}
                                style={{
                                  fontSize: 13, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                                  background: on ? "var(--mk-accent)" : "#fff",
                                  color: on ? "#fff" : "var(--mk-ink)",
                                  border: `1.5px solid ${on ? "var(--mk-accent)" : "var(--mk-border)"}`,
                                }}>
                                {on ? "✕ " : ""}{c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <p className="mk-hint">Channels you don't want to use — excluded even if the TAR allows them.</p>
                </div>
              )}
              <div style={{ gridColumn: "1 / -1" }}>
                <button className="mk-btn mk-btn-ghost-ink" style={{ fontSize: 13, padding: "8px 14px" }}
                  onClick={() => setShowAdv((s) => !s)}>
                  {showAdv ? "− Hide" : "+ Advanced"} reach settings
                </button>
                {showAdv && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
                    <div>
                      <label className="mk-label">Reach threshold (% per stage)</label>
                      <input className="mk-input" type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
                    </div>
                    <div>
                      <label className="mk-label">Effective frequency (K)</label>
                      <input className="mk-input" type="number" value={freqK} onChange={(e) => setFreqK(e.target.value)} />
                    </div>
                    <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                      <button className="mk-btn mk-btn-ghost-ink" style={{ fontSize: 13, padding: "8px 14px" }}
                        onClick={() => setShowPricing((s) => !s)} type="button">
                        {showPricing ? "− Hide" : "+ Adjust"} channel pricing
                      </button>
                      {showPricing && (
                        <div style={{ marginTop: 12 }}>
                          <p className="mk-hint" style={{ marginBottom: 10 }}>
                            Override the default rate for any channel with your real vendor rates. Blank = use the conservative rulebook default. You edit the amount only; the billing basis is fixed per channel.
                          </p>
                          {["digital", "non_digital"].map((grp) => {
                            const rows = allChannels.filter((c) => c.group === grp);
                            if (!rows.length) return null;
                            return (
                              <div key={grp} style={{ marginBottom: 14 }}>
                                <div className="mk-eyebrow" style={{ marginBottom: 8 }}>{grp === "digital" ? "Digital" : "Non-digital"}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px 12px", alignItems: "center" }}>
                                  {rows.map((c) => {
                                    const cost = c.cost || {};
                                    const ov = priceOverrides[c.key];
                                    return (
                                      <React.Fragment key={c.key}>
                                        <div style={{ fontSize: 13 }}>
                                          {c.label}
                                          <span style={{ color: "var(--mk-muted)", marginLeft: 6, fontSize: 12 }}>
                                            {cost.unit_label || ""}{c.coverage_percent ? ` · reaches ~${c.coverage_percent}% per send` : ""}
                                          </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                          <span style={{ color: "var(--mk-muted)", fontSize: 13 }}>$</span>
                                          <input className="mk-input mk-mono" style={{ width: 96, padding: "6px 8px", fontSize: 13 }}
                                            type="number" step="0.01" min="0"
                                            placeholder={String(cost.value ?? 0)}
                                            value={ov ? ov.value : ""}
                                            onChange={(e) => setChannelPrice(c.key, cost.basis || "cpm", e.target.value)} />
                                        </div>
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- STEP 3: Review & Build ---------- */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ padding: "16px 18px", background: "#FBF9F3", borderRadius: 12, border: "1px solid var(--mk-border)" }}>
                <div className="mk-eyebrow" style={{ marginBottom: 10 }}>Summary</div>
                <Row k="Audience" v={tarInfo?.audienceName || describeTA || "—"} />
                <Row k="Objective" v={tarInfo?.objective || describeObj || "—"} />
                <Row k="Action" v={`${action || "—"} · ${productWhat || "—"}`} />
                <Row k="Target" v={`${objVal} ${OBJECTIVE_UNITS.find(([u]) => u === objUnit)?.[1]}`} />
                <Row k="Audience size" v={Number(audience).toLocaleString()} />
                <Row k="Budget" v={`$${Number(budgetVal).toLocaleString()} ${budgetUnit === "per_day_usd" ? "/day" : "total"}`} />
                <Row k="Duration" v={durMode === "derive" ? "derived" : `${durVal} ${durMode}`} />
                <Row k="Relationship" v={campaignType === "warm" ? "warm (existing)" : "cold (new)"} />
              </div>

              {/* BYO key */}
              <div style={{ padding: "16px 18px", border: `1px solid ${needsKey ? "var(--mk-accent)" : "var(--mk-border)"}`,
                            borderRadius: 12, background: needsKey ? "var(--mk-accent-tint)" : "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <b style={{ fontSize: 15 }}>Use your own Anthropic API key</b>
                  <span className="mk-tag">Optional · unlimited runs</span>
                </div>
                {needsKey && (
                  <p style={{ fontSize: 13, color: "var(--mk-accent-ink)", fontWeight: 600, margin: "0 0 6px" }}>
                    You've used your free run — add your key to keep building.
                  </p>
                )}
                <p className="mk-hint" style={{ marginTop: 0 }}>
                  By default you get 1 free run. Enter your own key for unlimited runs — you pay only for what you use (~$0.15–0.20 per run).
                </p>
                <div style={{ position: "relative", marginTop: 6 }}>
                  <input className="mk-input mk-mono" placeholder="sk-ant-…" value={apiKey}
                    type={showKey ? "text" : "password"}
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{ width: "100%", paddingRight: 64, boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setShowKey((v) => !v)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                             background: "none", border: "none", cursor: "pointer", fontSize: 12,
                             color: "var(--mk-accent, #8A6D1E)", fontWeight: 600, padding: 0 }}>
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* data notice */}
              <div style={{ padding: "14px 16px", background: "#FBF6E8", borderRadius: 10, border: "1px solid #E8D9A8" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#8A6D1E" }}>Data notice</div>
                <p style={{ fontSize: 13, color: "#8A6D1E", margin: "4px 0 0", lineHeight: 1.5 }}>
                  Uploaded data is retained privately for platform accuracy. Do not upload data containing
                  sensitive personal information (SSN, passwords, financial account numbers).
                </p>
              </div>

              {!tar && (
                <p className="mk-hint">
                  Building a lighter-weight plan from your description — reach, timing and cost are fully modeled;
                  the message is suggested without a full behavioral analysis.
                </p>
              )}
            </div>
          )}

          {/* nav buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
            <button className="mk-btn mk-btn-ghost-ink"
              onClick={() => (step === 0 ? onExit?.() : setStep((s) => s - 1))}>
              ← {step === 0 ? "Exit" : "Back"}
            </button>
            {step < 2 ? (
              <button className="mk-btn mk-btn-primary" disabled={step === 0 && !step1ok}
                onClick={() => setStep((s) => s + 1)}>Continue →</button>
            ) : (
              <button className="mk-btn mk-btn-primary" disabled={!canBuild}
                onClick={() => onBuild(buildPayload())}>
                {busy ? "Building…" : "Build candidates →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "5px 0", fontSize: 14, borderBottom: "1px solid #EFEADD" }}>
      <span style={{ color: "var(--mk-grey)", minWidth: 120 }}>{k}</span>
      <span style={{ color: "var(--mk-ink)" }}>{v}</span>
    </div>
  );
}
