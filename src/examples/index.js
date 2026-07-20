// Guided demo examples. Each launches the wizard in demo mode with fields pre-filled
// and locked, ending on a pre-generated finished plan (static HTML in /public/demos).
//
// Two paths are shown:
//   - "quick"  : the no-TAR Describe path (a lighter plan from a text description)
//   - "full"   : the TAR path (full behavioral analysis with supporting arguments)
import subscriptionRenewals from "./subscription_renewals.json";

export const DEMOS = [
  {
    id: "quick",
    name: "Quick plan",
    tagline: "From a plain-language description",
    description:
      "A public library winning back lapsed members — planned from just a short description of the audience, no data upload.",
    planUrl: "/demos/quick-plan.html",
    prefill: {
      taMode: "describe",
      tar: null,
      describeTA:
        "Adults 30 to 55 in a mid-size city who held a public library card in the past but haven't visited or borrowed anything in two or more years. Busy working parents and professionals who still think of the library as just physical books and don't know it now offers free e-books, audiobooks, and streaming they can access from their phone anytime.",
      describeObj:
        "Get lapsed members to reactivate their library card and borrow their first digital item through the new library app.",
      pickedChannels: ["Email", "Facebook", "Push Notification", "Community/Events"],
      action: "reactivate their card and borrow a first digital title",
      productWhat: "Free digital lending — e-books, audiobooks, and streaming through the library app",
      company: "Riverside Public Library",
      objVal: 250,
      objUnit: "count",
      audience: 18000,
      campaignType: "warm",
      forbiddenChannels: [],
      budgetVal: 15000,
      durMode: "derive",
      threshold: 65,
      freqK: 3,
    },
  },
  {
    id: "full",
    name: "Full plan",
    tagline: "From an MK Intel audience report",
    description:
      "A subscription retailer's renewal push — planned from a full Target Audience Report, with behavioral arguments and message strategy.",
    planUrl: "/demos/full-plan.html",
    prefill: {
      taMode: "upload",
      tar: subscriptionRenewals,
      tarName: "example TAR",
      action: "renew",
      productWhat:
        "Their annual membership renewal — a simple one-tap renewal that keeps their benefits active with no price surprises",
      company: "GlobalCart — an established subscription retailer known for reliability and predictable pricing",
      objVal: 300,
      objUnit: "count",
      audience: 12000,
      campaignType: "warm",
      forbiddenChannels: ["Television (TV)"],
      budgetVal: 18000,
      durMode: "derive",
      threshold: 65,
      freqK: 3,
    },
  },
];

// Back-compat: some code referenced EXAMPLE_TARS. Keep a shim so nothing breaks.
export const EXAMPLE_TARS = DEMOS
  .filter((d) => d.prefill.tar)
  .map((d) => ({ id: d.id, name: d.name, tagline: d.tagline, description: d.description, tar: d.prefill.tar }));
