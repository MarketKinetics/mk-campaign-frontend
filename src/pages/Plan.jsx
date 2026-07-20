import { useState } from "react";
import MKLogo from "../components/MKLogo";
import BackButton from "../components/BackButton";
import StepHeader from "../components/StepHeader";
import { planHtmlUrl, planDownloadUrl, planJsonUrl } from "../api/client";

// Plan — the finished deliverable. The backend renders the full plan as HTML
// (the light/cream document we built). We host it in an iframe so the polished
// deliverable renders exactly as designed, and offer back / open-in-new-tab /
// download (HTML | JSON) / restart in one top-right cluster.
export default function Plan({ campaignCode, onRestart, onBack, staticUrl = null }) {
  const url = staticUrl || (campaignCode ? planHtmlUrl(campaignCode) : null);
  const [dlOpen, setDlOpen] = useState(false);

  const dlItem = {
    display: "block", padding: "10px 18px", textDecoration: "none",
    color: "var(--mk-ink)", fontSize: 14, fontWeight: 500,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-cream)", position: "relative" }}>
      <div className="mk-navy-band" style={{ padding: "22px 40px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <MKLogo size={30} onNavy />
          {/* single top-right cluster — Back sits inline so nothing overlaps */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <BackButton onBack={onBack} inline />
            {url && <a className="mk-btn mk-btn-ghost" href={url} target="_blank" rel="noreferrer"
                       style={{ textDecoration: "none", fontSize: 14, padding: "10px 18px" }}>Open in new tab ↗</a>}
            {campaignCode && (
              <div style={{ position: "relative" }}>
                <button className="mk-btn mk-btn-ghost" onClick={() => setDlOpen((o) => !o)}
                  style={{ fontSize: 14, padding: "10px 18px" }}>Download plan ↓</button>
                {dlOpen && (
                  <>
                    {/* click-outside backdrop: menu stays put while the mouse travels to it */}
                    <div onClick={() => setDlOpen(false)}
                         style={{ position: "fixed", inset: 0, zIndex: 39 }} />
                    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, zIndex: 40,
                                  background: "#fff", borderRadius: 10, border: "1px solid var(--mk-border)",
                                  boxShadow: "0 6px 20px rgba(0,0,0,.16)", overflow: "hidden", minWidth: 120 }}>
                      <a href={planDownloadUrl(campaignCode)} download onClick={() => setDlOpen(false)}
                         style={{ ...dlItem, borderBottom: "1px solid var(--mk-border)" }}>HTML</a>
                      <a href={planJsonUrl(campaignCode)} download onClick={() => setDlOpen(false)}
                         style={dlItem}>JSON</a>
                    </div>
                  </>
                )}
              </div>
            )}
            <button className="mk-btn mk-btn-primary" style={{ fontSize: 14, padding: "10px 18px" }}
              onClick={onRestart}>New campaign</button>
          </div>
        </div>
        <div style={{ marginTop: 22 }}><StepHeader current="plan" /></div>
        <h1 className="mk-h1" style={{ color: "#F3F6F9", marginTop: 22 }}>Your campaign plan</h1>
        <p className="mk-sub" style={{ marginTop: 6 }}>Reach-modeled with sourced, conservative assumptions. Download it as a shareable document or structured data.</p>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px" }}>
        {url ? (
          <iframe title="Campaign plan" src={url}
            style={{ width: "100%", height: "calc(100vh - 220px)", border: "1px solid var(--mk-border)",
                     borderRadius: 14, background: "#fff" }} />
        ) : (
          <div className="mk-card"><p className="mk-hint">No plan to display.</p></div>
        )}
      </div>
    </div>
  );
}
