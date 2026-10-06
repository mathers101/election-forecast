import type { State } from "./static-state-data";

export type StateProbability = {
  leftCandidate: number;
  rightCandidate: number;
  leftCandidateParty: CandidateParty;
  rightCandidateParty: CandidateParty;
};

export type CandidateParty = "R" | "D" | "I" | "L";
export const partyColors: Record<CandidateParty, string> = {
  R: "#dc2626",
  D: "#2563eb",
  I: "#7e22ce",
  L: "#eab308",
};

export type StateProbabilities = Record<State, StateProbability | null>;

export const initialStateProbabilities: StateProbabilities = {
  AL: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  AK: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  AZ: null,
  AR: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  CA: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  CO: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  CT: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  DC: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  DE: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  FL: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  GA: null,
  HI: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  ID: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  IL: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  IN: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  IA: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  KS: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  KY: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  LA: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  ME: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  MD: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  MA: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  MI: null,
  MN: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  MS: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  MO: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  MT: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  NE: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  NV: null,
  NH: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  NJ: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  NM: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  NY: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  NC: null,
  ND: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  OH: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  OK: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  OR: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  PA: null,
  RI: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  SC: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  SD: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  TN: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  TX: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  UT: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  VT: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  VA: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  WA: { leftCandidate: 1, rightCandidate: 0, leftCandidateParty: "D", rightCandidateParty: "R" },
  WV: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
  WI: null,
  WY: { leftCandidate: 0, rightCandidate: 1, leftCandidateParty: "D", rightCandidateParty: "R" },
};
