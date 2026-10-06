"use client";

import { useMemo, useState } from "react";
import { initialStateProbabilities, type StateProbabilities, type StateProbability } from "../../data/state-probabilities";
import USAMap, { type CustomizeConfig } from "../usa-map";
import { stateData, type State } from "../../data/static-state-data";
import { getColorFromProbability } from "@/lib/get-color-from-prob";
import { calculateProbability } from "@/lib/calculate-presidential-probability";
import PresidentialProbabilities from "./presidential-probabilities";
import PresidentialProbabilitiesPlaceholder from "./presidential-probabilities-placeholder";
import type { StateContest } from "../usa-state";

const fillFromProbability = (prob: StateProbability | null): string => {
  if (!prob) return "gray";
  return getColorFromProbability(prob);
};

export default function PresidentialForecast() {
  const [probabilities, setProbabilities] = useState<StateProbabilities>(initialStateProbabilities);
  const probability = calculateProbability(probabilities);

  const contests = useMemo(() => {
    const result: Partial<Record<State, StateContest>> = {};
    for (const state of Object.keys(initialStateProbabilities) as State[]) {
      const votes = stateData[state]?.electoralVotes ?? 0;
      result[state] = {
        subtitle: <>{votes} electoral votes</>,
        leftCandidate: "Harris",
        leftCandidateParty: "D",
        rightCandidate: "Trump",
        rightCandidateParty: "R",
      };
    }
    return result;
  }, []);

  const customizeStates = useMemo(() => {
    const result: Partial<Record<State, CustomizeConfig>> = {};
    for (const state of Object.keys(probabilities) as State[]) {
      result[state] = { fill: fillFromProbability(probabilities[state]) };
    }
    return result;
  }, [probabilities]);

  const setStateProbability = (state: State, prob: StateProbability | null) => {
    setProbabilities((prev) => ({
      ...prev,
      [state]: prob,
    }));
  };

  return (
    <main className="mx-auto flex w-full max-w-375 flex-col gap-5 px-4 py-6 text-left sm:px-6 lg:px-8">
      <section className="space-y-3" aria-labelledby="election-title">
        <h1 id="election-title" className="text-4xl font-bold text-gray-900">
          2024 Presidential Forecast
        </h1>
      </section>

      {probability ? <PresidentialProbabilities prob={probability} /> : <PresidentialProbabilitiesPlaceholder />}

      <USAMap
        customize={customizeStates}
        onClick={() => {}}
        stateProbabilities={probabilities}
        setStateProbability={setStateProbability}
        contests={contests}
      />
    </main>
  );
}
