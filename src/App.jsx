import { useState } from "react";
import "./styles/mk.css";
import Landing from "./pages/Landing";
import Entry from "./pages/Entry";
import Demo from "./pages/Demo";
import Wizard from "./pages/Wizard";
import Choose from "./pages/Choose";
import Plan from "./pages/Plan";
import { buildCandidates, selectCandidate, finalizePlan } from "./api/client";

// Linear campaign flow with a history stack so every page's top-left Back button
// goes exactly one page back along the path actually taken.
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [seedTar, setSeedTar] = useState(null);
  const [demoObj, setDemoObj] = useState(null);
  const [demoPlanUrl, setDemoPlanUrl] = useState(null);
  const [wizardMode, setWizardMode] = useState("upload");
  const [built, setBuilt] = useState(null);
  const [campaignCode, setCampaignCode] = useState(null);

  function nav(next) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setScreen(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  async function handleBuild(payload) {
    setBusy(true); setError("");
    try {
      const res = await buildCandidates(payload);
      setBuilt({ ...res, campaign_code: payload.campaign_code });
      setCampaignCode(payload.campaign_code);
      nav("choose");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function handleLock(candidateId) {
    setBusy(true); setError("");
    try {
      await selectCandidate(built.msw_id, candidateId);
      await finalizePlan(built.msw_id);
      nav("plan");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const candidates = built?.candidate_sets || built?.candidates || [];
  const canGoBack = history.length > 0;

  return (
    <>
      {error && <div style={banner} onClick={() => setError("")}>{error} <span style={{ opacity: .7 }}>(tap to dismiss)</span></div>}

      {screen === "landing" && (
        <Landing
          onStart={() => { setSeedTar(null); setDemoObj(null); setDemoPlanUrl(null); nav("entry"); }}
          onDemo={() => nav("demo")} />
      )}

      {screen === "entry" && (
        <Entry
          onChoose={(mode) => { setWizardMode(mode); setSeedTar(null); setDemoObj(null); nav("wizard"); }}
          onBack={canGoBack ? goBack : null}
          onExit={() => setScreen("landing")} />
      )}

      {screen === "demo" && (
        <Demo
          onLaunchDemo={(d) => { setDemoObj(d); setDemoPlanUrl(null); nav("wizard"); }}
          onBack={canGoBack ? goBack : null}
          onExit={() => { setDemoObj(null); nav("entry"); }} />
      )}

      {screen === "wizard" && (
        <Wizard initialTar={demoObj ? demoObj.prefill.tar : seedTar} initialMode={wizardMode}
                onBuild={handleBuild} busy={busy}
                demo={demoObj}
                onDemoComplete={(planUrl) => { setDemoPlanUrl(planUrl); nav("plan"); }}
                onBack={canGoBack ? goBack : null}
                onExit={() => { setDemoObj(null); setScreen("landing"); }} />
      )}

      {screen === "choose" && (
        <Choose candidates={candidates} onLock={handleLock} busy={busy}
                onBack={canGoBack ? goBack : () => setScreen("wizard")} />
      )}

      {screen === "plan" && (
        <Plan campaignCode={campaignCode} staticUrl={demoPlanUrl}
              onBack={canGoBack ? goBack : null}
              onRestart={() => { setBuilt(null); setSeedTar(null); setDemoObj(null); setDemoPlanUrl(null); setHistory([]); setScreen("landing"); }} />
      )}
    </>
  );
}

const banner = { background: "#C0473B", color: "#fff", padding: "10px 16px", textAlign: "center",
                 fontSize: 14, cursor: "pointer", position: "sticky", top: 0, zIndex: 100 };
