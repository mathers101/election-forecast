"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { initialStateProbabilities, type StateProbabilities, type StateProbability } from "../data/state-probabilities";
import { initialSenateProbabilities, senate2026Incumbents, senate2026Races, senateForecastSources, defaultSenateRaceRatingProbabilities, type SenateForecastSourceId, type SenateRaceRating, type SenateRatingProbabilities } from "../data/senate-2026";
import USAMap, { type CustomizeConfig } from "./USAMap";
import { type State } from "../data/static-state-data";
import { getColorFromProbability } from "@/lib/get-color-from-prob";
import { calculateCdf, calculateProbability, calculateSenateProbability, calculateSenateSeatPdfs } from "@/lib/calculate-probability";
import SenateSeatDistribution from "./SenateSeatDistribution";
import VictoryProbabilities from "./FinalProbabilities";
import VictoryProbabilitiesPlaceholder from "./FinalProbabilitiesPlaceholder";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

const fillFromProbability = (prob: StateProbability | null): string => {
  if (!prob) {
    return "gray";
  } else {
    return getColorFromProbability(prob);
  }
};

const senateStateProbabilities = (
  sourceId: SenateForecastSourceId,
  ratingProbabilities: SenateRatingProbabilities,
): StateProbabilities => {
  const defaults = initialSenateProbabilities(sourceId, ratingProbabilities);
  const entries = Object.fromEntries(Object.keys(senate2026Incumbents).map((state) => [state, defaults[state as State]]));
  return Object.fromEntries(Object.keys(initialStateProbabilities).map((state) => [state, entries[state] ?? null])) as StateProbabilities;
};

const sameProbability = (left: StateProbability | null, right: StateProbability | null) =>
  !!left && !!right
  && left.leftCandidate === right.leftCandidate
  && left.rightCandidate === right.rightCandidate;

export default function Predictor({ election }: { election: "presidential" | "senate" }) {
  const [ratingProbabilities, setRatingProbabilities] = useState(() => defaultSenateRaceRatingProbabilities());
  const [senateSourceId, setSenateSourceId] = useState<SenateForecastSourceId>("consensus");
  const [showRatingProbabilityControls, setShowRatingProbabilityControls] = useState(false);
  const senateRaces = useMemo(() => senate2026Races(), []);
  const [presidentialProbabilities, setPresidentialProbabilities] = useState<StateProbabilities>(initialStateProbabilities);
  const [senateProbabilities, setSenateProbabilities] = useState<StateProbabilities>(() => senateStateProbabilities("consensus", ratingProbabilities));
  const startingSenateProbabilities = useMemo(
    () => senateStateProbabilities(senateSourceId, ratingProbabilities),
    [senateSourceId, ratingProbabilities],
  );
  const previousRatingProbabilities = useRef(ratingProbabilities);

  useEffect(() => {
    const previous = previousRatingProbabilities.current;
    const hasChanged = (Object.keys(ratingProbabilities) as SenateRaceRating[])
      .some((rating) => ratingProbabilities[rating] !== previous[rating]);
    if (!hasChanged) return;
    previousRatingProbabilities.current = ratingProbabilities;
    const previousDefaults = senateStateProbabilities(senateSourceId, previous);
    setSenateProbabilities((current) => {
      const nextDefaults = senateStateProbabilities(senateSourceId, ratingProbabilities);
      const next = { ...current };
      for (const state of Object.keys(nextDefaults) as State[]) {
        if (sameProbability(current[state], previousDefaults[state])) {
          next[state] = nextDefaults[state];
        }
      }
      return next;
    });
  }, [ratingProbabilities, senateSourceId]);
  const stateProbabilities = election === "senate" ? senateProbabilities : presidentialProbabilities;
  const updateProbabilities = election === "senate" ? setSenateProbabilities : setPresidentialProbabilities;
  const states = Object.keys(stateProbabilities) as State[];

  const probability = election === "senate" ? calculateSenateProbability(senateProbabilities) : calculateProbability(presidentialProbabilities);
  const senateSeatPdfs = election === "senate" ? calculateSenateSeatPdfs(senateProbabilities) : null;
  const senateSeatCdfs = senateSeatPdfs && {
    R: calculateCdf(senateSeatPdfs.R),
    D: calculateCdf(senateSeatPdfs.D),
    I: calculateCdf(senateSeatPdfs.I),
  };
  const electionStates = election === "senate" ? new Set(Object.keys(senate2026Incumbents)) : new Set(states);
  const hasSenateMapEdits = Object.keys(senate2026Incumbents).some((state) => {
    const current = senateProbabilities[state as State];
    const starting = startingSenateProbabilities[state as State];
    return current && starting
      ? !sameProbability(current, starting)
      : current !== starting;
  });

  const statesFilling = (): Record<string, CustomizeConfig> => {
    const result: Record<string, CustomizeConfig> = {};

    for (const state of states) {
      result[state] = {
        fill: electionStates.has(state) ? fillFromProbability(stateProbabilities[state]) : "#d1d5db",
      };
    }
    return result;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const customizeStates = useMemo(() => statesFilling(), [stateProbabilities, states]);

  const setStateProbability = (state: State, prob: StateProbability | null) => {
    updateProbabilities((prev) => ({
      ...prev,
      [state]: prob,
    }));
  };

  const updateRatingProbability = (rating: Exclude<SenateRaceRating, "toss-up">, percent: number) => {
    setRatingProbabilities((current) => ({ ...current, [rating]: percent / 100 }));
  };

  const ratingSliderLabels: { rating: Exclude<SenateRaceRating, "toss-up">; label: string; id: string }[] = [
    { rating: "safe", label: "Safe win", id: "safe-race-probability" },
    { rating: "likely", label: "Likely win", id: "likely-race-probability" },
    { rating: "lean", label: "Lean", id: "lean-race-probability" },
    { rating: "tilt", label: "Tilt", id: "tilt-race-probability" },
  ];

  const map = (
    <USAMap
      customize={customizeStates}
      onClick={() => {}}
      stateProbabilities={stateProbabilities}
      setStateProbability={setStateProbability}
      electionStates={electionStates}
      election={election}
      senateRaces={senateRaces}
    />
  );

  return (
    <main className="mx-auto flex w-full max-w-375 flex-col gap-5 px-4 py-6 text-left sm:px-6 lg:px-8">
      <section className="space-y-3" aria-labelledby="election-title">
        <h1 id="election-title" className="text-4xl font-bold text-gray-900">
          {election === "senate" ? "2026 Senate Forecast" : "2024 Presidential Forecast"}
        </h1>
        {election === "senate" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Select a state on the map and use its slider to estimate the probability for each candidate in that Senate race.</p>
            <p>These estimates determine the probability of either party winning a majority in the Senate. States without a 2026 Senate race are gray.</p>
          </div>
        )}
      </section>

      {(election === "presidential" && !probability) && <VictoryProbabilitiesPlaceholder election={election} />}

      {election === "senate" ? (
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8">
          <div className="order-2 min-w-0 lg:order-1">{map}</div>
          <aside className="order-1 min-w-0 space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-4 lg:order-2" aria-label="Starting map settings">
            <div className="space-y-2">
              <label htmlFor="senate-forecast-source" className="text-sm font-semibold text-gray-900">Starting map</label>
              <select
                id="senate-forecast-source"
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm"
                value={senateSourceId}
                onChange={(event) => {
                  const sourceId = event.target.value as SenateForecastSourceId;
                  setSenateSourceId(sourceId);
                  setSenateProbabilities(senateStateProbabilities(sourceId, ratingProbabilities));
                }}
              >
                {Object.entries(senateForecastSources).map(([sourceId, source]) => (
                  <option key={sourceId} value={sourceId}>{source.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                As of {senateForecastSources[senateSourceId].asOf}.{" "}
                <a href={senateForecastSources[senateSourceId].url} target="_blank" rel="noreferrer" className="underline hover:text-gray-900">
                  View source map
                </a>
                .
                </p>
                <p className="text-xs text-muted-foreground">
                  Switching maps resets any edits made to the map.
                </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!hasSenateMapEdits}
                onClick={() => setSenateProbabilities(startingSenateProbabilities)}
              >
                Reset map
              </Button>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <p className="text-xs text-muted-foreground">
                Many of the source maps categorize states in terms of Safe, Likely, Lean, Tilt, and Toss-up. We convert these into probabilities for each candidate.
                </p>
              <p className="text-xs text-muted-foreground">
                 Click{" "}
                <button
                  type="button"
                  className="font-medium text-gray-900 underline underline-offset-2 hover:text-purple-700"
                  aria-expanded={showRatingProbabilityControls}
                  onClick={() => setShowRatingProbabilityControls((show) => !show)}
                >
                  here
                </button>{" "}
                to {showRatingProbabilityControls ? "hide" : "edit"} the values each category takes.
              </p>
              {showRatingProbabilityControls && (
                <div className="space-y-4" aria-label="Rating probability adjustments">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-gray-900">Rating probabilities</h2>
                    <button
                      type="button"
                      className="text-xs font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
                      onClick={() => setRatingProbabilities(defaultSenateRaceRatingProbabilities())}
                    >
                      Reset
                    </button>
                  </div>
                  {ratingSliderLabels.map(({ rating, label, id }) => (
                    <div key={rating} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm text-gray-900">
                        <label htmlFor={id}>{label}</label>
                        <span className="tabular-nums">{Math.round(ratingProbabilities[rating] * 100)}%</span>
                      </div>
                      <Slider
                        id={id}
                        min={50}
                        max={100}
                        step={1}
                        value={[Math.round(ratingProbabilities[rating] * 100)]}
                        onValueChange={([percent]) => updateRatingProbability(rating, percent)}
                        aria-label={`${label} probability`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Toss-up remains 50%. These settings apply to rating-based maps; FiftyPlusOne&apos;s published odds are used directly.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : map}

      {election === "senate" && probability && <VictoryProbabilities prob={probability} election={election} />}
      {election === "senate" && senateSeatPdfs && senateSeatCdfs && <SenateSeatDistribution pdfs={senateSeatPdfs} cdfs={senateSeatCdfs} />}
    </main>
  );
}
