// snake_case / internal token -> plain English, for reader-facing labels.
// Mirrors the backend renderer's _humanize. Uppercases known acronyms.
const ACR = { sem: "SEM", sms: "SMS", ooh: "OOH", tv: "TV", mms: "MMS", ppc: "PPC", cac: "CAC", roas: "ROAS" };

export function humanize(x) {
  if (x == null) return "";
  let s = String(x).trim();
  if (!s) return "";
  if (s.includes("_") && !s.includes(" ")) s = s.replace(/_/g, " ");
  return s.split(" ").map((w) => ACR[w.toLowerCase()] || w).join(" ");
}
