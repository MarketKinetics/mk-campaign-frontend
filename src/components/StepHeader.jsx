// Progress header for the campaign flow: Setup · Choose · Plan.
// `current` is one of "setup" | "choose" | "plan". Steps before current = done,
// current = active, after = todo. Rendered on the navy band.

const STEPS = [
  ["setup", "Setup"],
  ["choose", "Choose"],
  ["plan", "Plan"],
];

export default function StepHeader({ current }) {
  const order = STEPS.map(([k]) => k);
  const curIdx = order.indexOf(current);
  return (
    <div className="mk-steps">
      {STEPS.map(([key, label], i) => {
        const state = i < curIdx ? "done" : i === curIdx ? "active" : "todo";
        return (
          <div key={key} style={{ display: "flex", alignItems: "center" }}>
            <div className={`mk-step ${state}`}>
              <span className="num">{i + 1}</span>
              <span className="lbl">{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="mk-step-sep" />}
          </div>
        );
      })}
    </div>
  );
}
