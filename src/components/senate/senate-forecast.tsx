"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  initialStateProbabilities,
  type StateProbabilities,
  type StateProbability,
} from "../../data/state-probabilities";
import {
  initialSenateProbabilities,
  senate2026Incumbents,
  senateForecastSources,
  defaultSenateRaceRatingProbabilities,
  type SenateForecastSourceId,
  type SenateRace,
  type SenateRaceRating,
  type SenateRatingProbabilities,
} from "../../data/senate-2026";
import USAMap, { type CustomizeConfig } from "../usa-map";
import { type State } from "../../data/static-state-data";
import { getColorFromProbability } from "@/lib/get-color-from-prob";
import { calculateCdf, calculateSenateProbability, calculateSenateSeatPdfs } from "@/lib/calculate-senate-probability";
import SenateSeatDistribution from "./senate-seat-distribution";
import SenateProbabilities from "./senate-probabilities";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import type { StateContest } from "../usa-state";

const fillFromProbability = (prob: StateProbability | null): string => {
  if (!prob) return "gray";
  return getColorFromProbability(prob);
};

const senateStateProbabilities = (
  sourceId: SenateForecastSourceId,
  ratingProbabilities: SenateRatingProbabilities,
): StateProbabilities => {
  const defaults = initialSenateProbabilities(sourceId, ratingProbabilities);
  const entries = Object.fromEntries(
    Object.keys(senate2026Incumbents).map((state) => [state, defaults[state as State]]),
  );
  return Object.fromEntries(
    Object.keys(initialStateProbabilities).map((state) => [state, entries[state] ?? null]),
  ) as StateProbabilities;
};

const sameProbability = (left: StateProbability | null, right: StateProbability | null) =>
  !!left && !!right && left.leftCandidate === right.leftCandidate && left.rightCandidate === right.rightCandidate;

function SenateRaceSubtitle({ race }: { race: SenateRace }) {
  const incumbentColor =
    race.incumbent === "R" ? "text-red-600" : race.incumbent === "D" ? "text-blue-600" : "text-purple-700";

  return (
    <>
      Incumbent:{" "}
      {race.incumbentName ? (
        <span className={`font-medium ${incumbentColor}`}>
          {race.incumbentName}
          {race.incumbent ? ` (${race.incumbent})` : ""}
        </span>
      ) : (
        <span>Vacant{race.formerIncumbentName ? ` (formerly held by ${race.formerIncumbentName})` : ""}</span>
      )}
    </>
  );
}

export default function SenateForecast({ senateRaces }: { senateRaces: Partial<Record<State, SenateRace>> }) {
  const [ratingProbabilities, setRatingProbabilities] = useState(() => defaultSenateRaceRatingProbabilities());
  const [senateSourceId, setSenateSourceId] = useState<SenateForecastSourceId>("consensus");
  const [showRatingProbabilityControls, setShowRatingProbabilityControls] = useState(false);
  const [probabilities, setProbabilities] = useState<StateProbabilities>(() =>
    senateStateProbabilities("consensus", ratingProbabilities),
  );
  const startingProbabilities = useMemo(
    () => senateStateProbabilities(senateSourceId, ratingProbabilities),
    [senateSourceId, ratingProbabilities],
  );
  const previousRatingProbabilities = useRef(ratingProbabilities);

  useEffect(() => {
    const previous = previousRatingProbabilities.current;
    const hasChanged = (Object.keys(ratingProbabilities) as SenateRaceRating[]).some(
      (rating) => ratingProbabilities[rating] !== previous[rating],
    );
    if (!hasChanged) return;
    previousRatingProbabilities.current = ratingProbabilities;
    const previousDefaults = senateStateProbabilities(senateSourceId, previous);
    setProbabilities((current) => {
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

  const probability = calculateSenateProbability(probabilities);
  const senateSeatPdfs = calculateSenateSeatPdfs(probabilities);
  const senateSeatCdfs = senateSeatPdfs && {
    R: calculateCdf(senateSeatPdfs.R),
    D: calculateCdf(senateSeatPdfs.D),
    I: calculateCdf(senateSeatPdfs.I),
  };
  const raceStates = useMemo(() => new Set(Object.keys(senate2026Incumbents)), []);
  const hasMapEdits = Object.keys(senate2026Incumbents).some((state) => {
    const current = probabilities[state as State];
    const starting = startingProbabilities[state as State];
    return current && starting ? !sameProbability(current, starting) : current !== starting;
  });

  const contests = useMemo(() => {
    const result: Partial<Record<State, StateContest>> = {};
    for (const state of Object.keys(senateRaces) as State[]) {
      const race = senateRaces[state];
      if (!race) continue;
      result[state] = {
        subtitle: <SenateRaceSubtitle race={race} />,
        leftCandidate: race.leftCandidate,
        leftCandidateParty: race.leftCandidateParty,
        rightCandidate: race.rightCandidate,
        rightCandidateParty: race.rightCandidateParty,
      };
    }
    return result;
  }, [senateRaces]);

  const customizeStates = useMemo(() => {
    const result: Partial<Record<State, CustomizeConfig>> = {};
    for (const state of Object.keys(probabilities) as State[]) {
      result[state] = {
        fill: raceStates.has(state) ? fillFromProbability(probabilities[state]) : "#d1d5db",
      };
    }
    return result;
  }, [probabilities, raceStates]);

  const setStateProbability = (state: State, prob: StateProbability | null) => {
    setProbabilities((prev) => ({
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

  return (
    <main className="mx-auto flex w-full max-w-375 flex-col gap-10 px-4 py-6 text-left sm:px-6 lg:px-8">
      <section className="space-y-3" aria-labelledby="election-title">
        <h1 id="election-title" className="text-4xl font-bold text-gray-900">
          2026 Senate Forecast
        </h1>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Select a state on the map and use its slider to estimate the probability for each candidate in that Senate
            race.
          </p>
          <p>
            These estimates determine the probability of either party winning a majority in the Senate. States without a
            2026 Senate race are gray.
          </p>
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8">
        <div className="order-2 min-w-0 lg:order-1">
          <USAMap
            customize={customizeStates}
            onClick={() => {}}
            stateProbabilities={probabilities}
            setStateProbability={setStateProbability}
            contests={contests}
          />
        </div>
        <aside className="order-1 min-w-0 lg:order-2" aria-label="Starting map settings">
          <Card>
            <CardHeader>
              <CardTitle>
                <label htmlFor="senate-forecast-source">Starting map</label>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select
                value={senateSourceId}
                onValueChange={(sourceId) => {
                  const nextSourceId = sourceId as SenateForecastSourceId;
                  setSenateSourceId(nextSourceId);
                  setProbabilities(senateStateProbabilities(nextSourceId, ratingProbabilities));
                }}
              >
                <SelectTrigger id="senate-forecast-source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(senateForecastSources).map(([sourceId, source]) => (
                    <SelectItem key={sourceId} value={sourceId}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CardDescription>
                As of {senateForecastSources[senateSourceId].asOf}.{" "}
                <a
                  href={senateForecastSources[senateSourceId].url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-foreground"
                >
                  View source map
                </a>
                .
              </CardDescription>
              <CardDescription>Switching maps resets any edits made to the map.</CardDescription>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!hasMapEdits}
                onClick={() => setProbabilities(startingProbabilities)}
              >
                Reset map
              </Button>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <CardDescription>
                Many of the source maps categorize states in terms of Safe, Likely, Lean, Tilt, and Toss-up. We convert
                these into probabilities for each candidate.
              </CardDescription>
              <CardDescription>
                Click{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-purple-700"
                  aria-expanded={showRatingProbabilityControls}
                  onClick={() => setShowRatingProbabilityControls((show) => !show)}
                >
                  here
                </button>{" "}
                to {showRatingProbabilityControls ? "hide" : "edit"} the values each category takes.
              </CardDescription>
              {showRatingProbabilityControls && (
                <div className="space-y-4" aria-label="Rating probability adjustments">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-medium text-foreground">Rating probabilities</h2>
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      onClick={() => setRatingProbabilities(defaultSenateRaceRatingProbabilities())}
                    >
                      Reset
                    </button>
                  </div>
                  {ratingSliderLabels.map(({ rating, label, id }) => (
                    <div key={rating} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs text-foreground">
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
                  <CardDescription>
                    Toss-up remains 50%. These settings apply to rating-based maps; FiftyPlusOne&apos;s published odds
                    are used directly.
                  </CardDescription>
                </div>
              )}
            </CardFooter>
          </Card>
        </aside>
      </div>

      {probability && <SenateProbabilities prob={probability} />}
      {senateSeatPdfs && senateSeatCdfs && <SenateSeatDistribution pdfs={senateSeatPdfs} cdfs={senateSeatCdfs} />}
    </main>
  );
}
