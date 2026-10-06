// import type { StateProbabilities } from "@/data/state-probabilities";

import { electoralVotes } from "@/data/electoral-votes";
import type { StateProbabilities, StateProbability } from "@/data/state-probabilities";
import type { State } from "@/data/static-state-data";
import { senate2026Incumbents } from "@/data/senate-2026";
// import { defaultSafeStates, safeStateResults } from "@/data/state-probabilities";

export type FinalProbability = {
  R: number;
  D: number;
  draw: number;
};

export type SenateSeatPdfs = { R: number[]; D: number[]; I: number[] };

/** Build seat-count PDFs (indexed by total party seats) from the race probabilities. */
export const calculateSenateSeatPdfs = (
  stateProbabilities: Partial<Record<State, StateProbability | null>>,
): SenateSeatPdfs | null => {
  const races = Object.keys(senate2026Incumbents) as State[];
  if (races.some((state) => !stateProbabilities[state])) return null;

  const fixedRepublicanSeats = 53 - races.filter((state) => senate2026Incumbents[state] === "R").length;
  const fixedDemocraticSeats = 47 - races.filter((state) => senate2026Incumbents[state] !== "R").length;
  const fixedIndependentSeats = 2 - races.filter((state) => senate2026Incumbents[state] === "I").length;
  const pdfs: SenateSeatPdfs = { R: [1], D: [1], I: [1] };
  for (const state of races) {
    const probability = stateProbabilities[state]!;
    const wins: Record<keyof SenateSeatPdfs, number> = {
      R: (probability.leftCandidateParty === "R" ? probability.leftCandidate : 0) + (probability.rightCandidateParty === "R" ? probability.rightCandidate : 0),
      D: (probability.leftCandidateParty === "D" ? probability.leftCandidate : 0) + (probability.rightCandidateParty === "D" ? probability.rightCandidate : 0),
      I: (probability.leftCandidateParty === "I" ? probability.leftCandidate : 0) + (probability.rightCandidateParty === "I" ? probability.rightCandidate : 0),
    };
    for (const party of ["R", "D", "I"] as const) {
      const pdf = pdfs[party];
      const next = Array(pdf.length + 1).fill(0) as number[];
      for (let seats = 0; seats < pdf.length; seats++) {
        next[seats] += pdf[seats] * (1 - wins[party]);
        next[seats + 1] += pdf[seats] * wins[party];
      }
      pdfs[party] = next;
    }
  }

  const totalSeats: SenateSeatPdfs = {
    R: Array(fixedRepublicanSeats).fill(0).concat(pdfs.R),
    D: Array(fixedDemocraticSeats).fill(0).concat(pdfs.D),
    I: Array(fixedIndependentSeats).fill(0).concat(pdfs.I),
  };
  return totalSeats;
};

/** Convert a discrete PDF into a cumulative distribution, preserving its seat index. */
export const calculateCdf = (pdf: number[]): number[] => {
  const cdf: number[] = [];
  for (let index = 0; index < pdf.length; index++) cdf[index] = pdf[index] + (index > 0 ? cdf[index - 1] : 0);
  return cdf;
};

export const expectedSeats = (pdf: number[]): number => pdf.reduce((sum, probability, seats) => sum + probability * seats, 0);

export const calculateProbability = (stateProbabilities: StateProbabilities): FinalProbability | null => {
  const swingStates: string[] = [];
  let safeTrumpVotes = 0;
  let safeHarrisVotes = 0;

  for (const [state, prob] of Object.entries(stateProbabilities)) {
    if (prob === null) {
      return null;
    }
    const republicanProbability = (prob.leftCandidateParty === "R" ? prob.leftCandidate : 0)
      + (prob.rightCandidateParty === "R" ? prob.rightCandidate : 0);
    const democraticProbability = (prob.leftCandidateParty === "D" ? prob.leftCandidate : 0)
      + (prob.rightCandidateParty === "D" ? prob.rightCandidate : 0);
    if (republicanProbability !== 1 && democraticProbability !== 1) {
      swingStates.push(state);
    } else if (republicanProbability === 1) {
      safeTrumpVotes += electoralVotes[state as State];
    } else if (democraticProbability === 1) {
      safeHarrisVotes += electoralVotes[state as State];
    }
  }

  // Generate all possible combinations of 'D' and 'R' for swing states
  const arrangements: Array<Record<string, "D" | "R">> = [];

  const numSwingStates = swingStates.length;
  const totalArrangements = 1 << numSwingStates; // 2^numSwingStates

  // Create a list of every possible swing state outcome arrangement
  for (let i = 0; i < totalArrangements; i++) {
    const arrangement: Record<string, "D" | "R"> = {} as Record<string, "D" | "R">;
    for (let j = 0; j < numSwingStates; j++) {
      const state = swingStates[j];
      arrangement[state] = i & (1 << j) ? "R" : "D";
    }
    arrangements.push(arrangement);
  }

  let harrisProbability = 0;
  let trumpProbability = 0;
  let drawProbability = 0;
  // iterate over all outcomes and calculate winner, probability of it happening
  for (const arrangement of arrangements) {
    const harrisVotes =
      safeHarrisVotes +
      swingStates.reduce((sum, state) => sum + (arrangement[state] === "D" ? electoralVotes[state as State] : 0), 0);
    const trumpVotes =
      safeTrumpVotes +
      swingStates.reduce((sum, state) => sum + (arrangement[state] === "R" ? electoralVotes[state as State] : 0), 0);

    // Calculate the probability of this arrangement
    let arrangementProbability = 1;
    for (const state of swingStates) {
      const prob = stateProbabilities[state as State]!;
      const party = arrangement[state];
      const partyProbability = (prob.leftCandidateParty === party ? prob.leftCandidate : 0)
        + (prob.rightCandidateParty === party ? prob.rightCandidate : 0);
      arrangementProbability *= partyProbability;
    }
    if (harrisVotes >= 270) {
      harrisProbability += arrangementProbability;
    } else if (trumpVotes >= 270) {
      trumpProbability += arrangementProbability;
    } else {
      drawProbability += arrangementProbability;
    }
  }

  return {
    R: trumpProbability,
    D: harrisProbability,
    draw: drawProbability,
  };
};

/** Direct convolution for the Poisson-binomial seat-count distribution. */
export const calculateSenateProbability = (
  stateProbabilities: Partial<Record<State, StateProbability | null>>,
): FinalProbability | null => {
  const pdfs = calculateSenateSeatPdfs(stateProbabilities);
  if (!pdfs) return null;
  const cdfR = calculateCdf(pdfs.R);
  const cdfD = calculateCdf(pdfs.D);
  const republicanVictory = 1 - (cdfR[49] ?? 0);
  const democraticVictory = 1 - (cdfD[50] ?? 0);

  return { R: republicanVictory, D: democraticVictory, draw: 0 };
};
