import { electoralVotes } from "@/data/electoral-votes";
import type { StateProbabilities } from "@/data/state-probabilities";
import type { State } from "@/data/static-state-data";

export type FinalProbability = {
  R: number;
  D: number;
  draw: number;
};

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
