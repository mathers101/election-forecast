import { partyColors, type StateProbability } from "../data/state-probabilities";

export const getColorFromProbability = (prob: StateProbability) => {
  const left = partyColors[prob.leftCandidateParty].match(/[\da-f]{2}/gi)!.map((part) => parseInt(part, 16));
  const right = partyColors[prob.rightCandidateParty].match(/[\da-f]{2}/gi)!.map((part) => parseInt(part, 16));
  const rgb = left.map((channel, index) => Math.round(channel * prob.leftCandidate + right[index] * prob.rightCandidate));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};
