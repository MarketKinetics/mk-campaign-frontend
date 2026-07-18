// Bundled example TARs for the Live Demo. Each entry launches a real campaign
// from a pre-loaded Target Audience Report — no upload needed.
//
// To add another example:
//   1. Drop a TAR JSON file in this folder (e.g. ./retired_renters.json)
//   2. import it below and add an entry to EXAMPLE_TARS.
// Each entry: { id, name, tagline, description, tar }
// The `tar` must be a real TAR object (with a vulnerabilities block).

import subscriptionRenewals from "./subscription_renewals.json";

export const EXAMPLE_TARS = [
  {
    id: "subscription-renewals",
    name: "Subscription Renewals",
    tagline: "Subscription · existing customers",
    description: "Moderate-engagement subscribers whose renewal runs on habit. The goal: keep them through the next billing cycle without triggering a re-think.",
    tar: subscriptionRenewals,
  },
];
