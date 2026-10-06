import type { StateProbability } from "@/data/state-probabilities";
import type { State } from "@/data/static-state-data";
import { senate2026Incumbents } from "@/data/senate-2026";

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
