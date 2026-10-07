import type { State } from "./static-state-data";
import { partyColors, type CandidateParty } from "./state-probabilities";

export type SenateRace = {
  incumbent: "R" | "D" | "I" | null;
  incumbentName?: string;
  formerIncumbentName?: string;
  leftCandidate: string;
  leftCandidateParty: SenateParty;
  rightCandidate: string;
  rightCandidateParty: SenateParty;
};
export type SenateParty = CandidateParty;
export const senatePartyColors = partyColors;

export type SenateRaceRating = "safe" | "likely" | "lean" | "tilt" | "toss-up";
export type SenateForecastSourceId = "consensus" | "cook" | "inside-elections" | "fiftyplusone";
export type SenateRatingMap = Partial<Record<State, { party: SenateParty; rating: SenateRaceRating }>>;
export type SenateRatingProbabilities = Record<SenateRaceRating, number>;
export type SenateProbabilityMap = Partial<Record<State, number>>;
type SenateForecastSource = {
  label: string;
  asOf: string;
  url: string;
} & ({ ratings: SenateRatingMap; probabilities?: never } | { probabilities: SenateProbabilityMap; ratings?: never });

const ratingMap = (groups: Partial<Record<SenateParty, Partial<Record<SenateRaceRating, State[]>>>>): SenateRatingMap =>
  Object.fromEntries(
    Object.entries(groups).flatMap(([party, ratings]) =>
      Object.entries(ratings ?? {}).flatMap(([rating, raceStates]) =>
        (raceStates ?? []).map((state) => [state, { party: party as SenateParty, rating: rating as SenateRaceRating }]),
      ),
    ),
  ) as SenateRatingMap;

// These dated snapshots are based on the source maps linked below. Rating
// categories stay separate from their probability conversion so the defaults
// can be tuned without editing each state's rating.
export const senateForecastSources: Record<SenateForecastSourceId, SenateForecastSource> = {
  consensus: {
    label: "270toWin Consensus",
    asOf: "October 2, 2026",
    url: "https://www.270towin.com/2026-senate-election/consensus-2026-senate-forecast",
    ratings: ratingMap({
      R: {
        safe: ["AL", "AR", "ID", "KY", "LA", "MS", "MT", "OK", "SD", "TN", "WV", "WY"],
        likely: ["FL", "NE", "SC"],
        lean: ["KS"],
        "toss-up": [],
      },
      D: {
        safe: ["CO", "DE", "IL", "MA", "NJ", "NM", "OR", "RI", "VA"],
        likely: ["MI", "MN"],
        lean: ["GA", "NC", "NH"],
        "toss-up": ["AK", "IA", "ME", "OH", "TX"],
      },
    }),
  },
  cook: {
    label: "Cook Political Report",
    asOf: "September 23, 2026",
    url: "https://www.270towin.com/2026-senate-election/cook-political-report-2026-senate",
    ratings: ratingMap({
      R: {
        safe: ["AL", "AR", "FL", "ID", "KY", "LA", "MS", "MT", "OK", "SD", "TN", "WV", "WY"],
        likely: ["NE", "SC"],
        lean: ["KS"],
        "toss-up": ["AK", "IA", "ME", "MI", "NH", "OH", "TX"],
      },
      D: {
        safe: ["CO", "DE", "IL", "MA", "NJ", "NM", "OR", "RI", "VA"],
        likely: ["GA", "MN"],
        lean: ["NC"],
        "toss-up": [],
      },
    }),
  },
  "inside-elections": {
    label: "Inside Elections",
    asOf: "October 1, 2026",
    url: "https://www.270towin.com/2026-senate-election/inside-elections-2026-senate-ratings",
    ratings: ratingMap({
      R: {
        safe: ["AL", "AR", "ID", "KY", "LA", "MS", "MT", "OK", "SD", "TN", "WV", "WY"],
        likely: ["FL", "KS", "SC"],
        lean: ["NE"],
        tilt: ["IA", "MI", "TX"],
        "toss-up": ["AK"],
      },
      D: {
        safe: ["CO", "DE", "IL", "MA", "NJ", "NM", "OR", "RI", "VA"],
        likely: ["NH"],
        lean: ["GA", "ME", "MN", "NC", "OH"],
        tilt: [],
        "toss-up": [],
      },
    }),
  },
  fiftyplusone: {
    label: "FiftyPlusOne",
    asOf: "October 2, 2026",
    url: "https://fiftyplusone.news/forecast/senate",
    // FiftyPlusOne publishes integer "out of 100" win odds. Values displayed
    // as <1% or >99% are represented at the midpoint of their rounding bounds.
    // Montana's Senate race has a third candidate; non-Republican win odds are
    // grouped together because this app models the race with two candidates.
    probabilities: {
      AK: 0.62,
      AL: 0.005,
      AR: 0.02,
      CO: 0.995,
      DE: 0.995,
      FL: 0.23,
      GA: 0.97,
      ID: 0.18,
      IL: 0.995,
      IA: 0.56,
      KS: 0.38,
      KY: 0.005,
      LA: 0.1,
      ME: 0.7,
      MA: 0.995,
      MI: 0.73,
      MN: 0.87,
      MS: 0.02,
      MT: 0.12,
      NE: 0.19,
      NH: 0.9,
      NJ: 0.995,
      NM: 0.995,
      NC: 0.87,
      OH: 0.66,
      OK: 0.005,
      OR: 0.995,
      RI: 0.995,
      SC: 0.38,
      SD: 0.03,
      TN: 0.005,
      TX: 0.61,
      VA: 0.995,
      WV: 0.005,
      WY: 0.005,
    },
  },
};

export const defaultSenateRaceRatingProbabilities = (
  overrides: Partial<SenateRatingProbabilities> = {},
): SenateRatingProbabilities => ({
  safe: 0.99,
  likely: 0.85,
  lean: 0.7,
  tilt: 0.55,
  "toss-up": 0.5,
  ...overrides,
});

// Candidate order follows the names shown for each race on its 2026 map.
// Source rating maps below determine starting probabilities.
export const senate2026Races: Partial<Record<State, SenateRace>> = {
  AK: {
    incumbent: "R",
    incumbentName: "Dan Sullivan",
    leftCandidate: "Mary Peltola",
    leftCandidateParty: "D",
    rightCandidate: "Dan Sullivan",
    rightCandidateParty: "R",
  },
  AL: {
    incumbent: "R",
    incumbentName: "Tommy Tuberville",
    leftCandidate: "Everett Wess",
    leftCandidateParty: "D",
    rightCandidate: "Barry Moore",
    rightCandidateParty: "R",
  },
  AR: {
    incumbent: "R",
    incumbentName: "Tom Cotton",
    leftCandidate: "Hallie Shoffner",
    leftCandidateParty: "D",
    rightCandidate: "Tom Cotton",
    rightCandidateParty: "R",
  },
  CO: {
    incumbent: "D",
    incumbentName: "John Hickenlooper",
    leftCandidate: "John Hickenlooper",
    leftCandidateParty: "D",
    rightCandidate: "Mark Baisley",
    rightCandidateParty: "R",
  },
  DE: {
    incumbent: "D",
    incumbentName: "Chris Coons",
    leftCandidate: "Chris Coons",
    leftCandidateParty: "D",
    rightCandidate: "Michael Katz",
    rightCandidateParty: "R",
  },
  FL: {
    incumbent: "R",
    incumbentName: "Ashley Moody",
    leftCandidate: "Angie Nixon",
    leftCandidateParty: "D",
    rightCandidate: "Ashley Moody",
    rightCandidateParty: "R",
  },
  GA: {
    incumbent: "D",
    incumbentName: "Jon Ossoff",
    leftCandidate: "Jon Ossoff",
    leftCandidateParty: "D",
    rightCandidate: "Mike Collins",
    rightCandidateParty: "R",
  },
  ID: {
    incumbent: "R",
    incumbentName: "Jim Risch",
    leftCandidate: "Todd Achilles",
    leftCandidateParty: "I",
    rightCandidate: "Jim Risch",
    rightCandidateParty: "R",
  },
  IL: {
    incumbent: "D",
    incumbentName: "Dick Durbin",
    leftCandidate: "Juliana Stratton",
    leftCandidateParty: "D",
    rightCandidate: "Don Tracy",
    rightCandidateParty: "R",
  },
  IA: {
    incumbent: "R",
    incumbentName: "Joni Ernst",
    leftCandidate: "Josh Turek",
    leftCandidateParty: "D",
    rightCandidate: "Ashley Hinson",
    rightCandidateParty: "R",
  },
  KS: {
    incumbent: "R",
    incumbentName: "Roger Marshall",
    leftCandidate: "Adam Hamilton",
    leftCandidateParty: "D",
    rightCandidate: "Roger Marshall",
    rightCandidateParty: "R",
  },
  KY: {
    incumbent: "R",
    incumbentName: "Mitch McConnell",
    leftCandidate: "Charles Booker",
    leftCandidateParty: "D",
    rightCandidate: "Andy Barr",
    rightCandidateParty: "R",
  },
  LA: {
    incumbent: "R",
    incumbentName: "Bill Cassidy",
    leftCandidate: "Jamie Davis",
    leftCandidateParty: "D",
    rightCandidate: "Julia Letlow",
    rightCandidateParty: "R",
  },
  ME: {
    incumbent: "R",
    incumbentName: "Susan Collins",
    leftCandidate: "Troy Jackson",
    leftCandidateParty: "D",
    rightCandidate: "Susan Collins",
    rightCandidateParty: "R",
  },
  MA: {
    incumbent: "D",
    incumbentName: "Ed Markey",
    leftCandidate: "Ed Markey",
    leftCandidateParty: "D",
    rightCandidate: "John Deaton",
    rightCandidateParty: "R",
  },
  MI: {
    incumbent: "D",
    incumbentName: "Gary Peters",
    leftCandidate: "Abdul El-Sayed",
    leftCandidateParty: "D",
    rightCandidate: "Mike Rogers",
    rightCandidateParty: "R",
  },
  MN: {
    incumbent: "D",
    incumbentName: "Tina Smith",
    leftCandidate: "Peggy Flanagan",
    leftCandidateParty: "D",
    rightCandidate: "Michele Tafoya",
    rightCandidateParty: "R",
  },
  MS: {
    incumbent: "R",
    incumbentName: "Cindy Hyde-Smith",
    leftCandidate: "Scott Colom",
    leftCandidateParty: "D",
    rightCandidate: "Cindy Hyde-Smith",
    rightCandidateParty: "R",
  },
  MT: {
    incumbent: "R",
    incumbentName: "Steve Daines",
    leftCandidate: "Seth Bodnar",
    leftCandidateParty: "I",
    rightCandidate: "Kurt Alme",
    rightCandidateParty: "R",
  },
  NC: {
    incumbent: "R",
    incumbentName: "Thom Tillis",
    leftCandidate: "Roy Cooper",
    leftCandidateParty: "D",
    rightCandidate: "Michael Whatley",
    rightCandidateParty: "R",
  },
  NE: {
    incumbent: "R",
    incumbentName: "Pete Ricketts",
    leftCandidate: "Dan Osborn",
    leftCandidateParty: "I",
    rightCandidate: "Pete Ricketts",
    rightCandidateParty: "R",
  },
  NH: {
    incumbent: "D",
    incumbentName: "Jeanne Shaheen",
    leftCandidate: "Chris Pappas",
    leftCandidateParty: "D",
    rightCandidate: "John Sununu",
    rightCandidateParty: "R",
  },
  NJ: {
    incumbent: "D",
    incumbentName: "Cory Booker",
    leftCandidate: "Cory Booker",
    leftCandidateParty: "D",
    rightCandidate: "Justin Murphy",
    rightCandidateParty: "R",
  },
  NM: {
    incumbent: "D",
    incumbentName: "Ben Ray Lujan",
    leftCandidate: "Ben Ray Lujan",
    leftCandidateParty: "D",
    rightCandidate: "Larry Marker",
    rightCandidateParty: "R",
  },
  OH: {
    incumbent: "R",
    incumbentName: "Jon Husted",
    leftCandidate: "Sherrod Brown",
    leftCandidateParty: "D",
    rightCandidate: "Jon Husted",
    rightCandidateParty: "R",
  },
  OK: {
    incumbent: "R",
    incumbentName: "Alan Armstrong",
    leftCandidate: "N'Kiyla Thomas",
    leftCandidateParty: "D",
    rightCandidate: "Kevin Hern",
    rightCandidateParty: "R",
  },
  OR: {
    incumbent: "D",
    incumbentName: "Jeff Merkley",
    leftCandidate: "Jeff Merkley",
    leftCandidateParty: "D",
    rightCandidate: "David Smith",
    rightCandidateParty: "R",
  },
  RI: {
    incumbent: "D",
    incumbentName: "Jack Reed",
    leftCandidate: "Jack Reed",
    leftCandidateParty: "D",
    rightCandidate: "Raymond McKay",
    rightCandidateParty: "R",
  },
  SC: {
    incumbent: "R",
    incumbentName: "Darline Graham",
    leftCandidate: "Annie Andrews",
    leftCandidateParty: "D",
    rightCandidate: "Darline Graham",
    rightCandidateParty: "R",
  },
  SD: {
    incumbent: "R",
    incumbentName: "Mike Rounds",
    leftCandidate: "Brian Bengs",
    leftCandidateParty: "I",
    rightCandidate: "Mike Rounds",
    rightCandidateParty: "R",
  },
  TN: {
    incumbent: "R",
    incumbentName: "Bill Hagerty",
    leftCandidate: "Marquita Bradshaw",
    leftCandidateParty: "D",
    rightCandidate: "Bill Hagerty",
    rightCandidateParty: "R",
  },
  TX: {
    incumbent: "R",
    incumbentName: "John Cornyn",
    leftCandidate: "James Talarico",
    leftCandidateParty: "D",
    rightCandidate: "Ken Paxton",
    rightCandidateParty: "R",
  },
  VA: {
    incumbent: "D",
    incumbentName: "Mark Warner",
    leftCandidate: "Mark Warner",
    leftCandidateParty: "D",
    rightCandidate: "Bert Mizusawa",
    rightCandidateParty: "R",
  },
  WV: {
    incumbent: "R",
    incumbentName: "Shelley Moore Capito",
    leftCandidate: "Rachel Fetty Anderson",
    leftCandidateParty: "D",
    rightCandidate: "Shelley Moore Capito",
    rightCandidateParty: "R",
  },
  WY: {
    incumbent: "R",
    incumbentName: "Cynthia Lummis",
    leftCandidate: "James Byrd",
    leftCandidateParty: "D",
    rightCandidate: "Harriet Hageman",
    rightCandidateParty: "R",
  },
};

// Incumbents do not depend on the safe-race probability.
export const senate2026Incumbents = Object.fromEntries(
  Object.entries(senate2026Races).map(([state, race]) => [state, race.incumbent]),
) as Partial<Record<State, "R" | "D" | "I" | null>>;

export const initialSenateProbabilities = (
  sourceId: SenateForecastSourceId = "consensus",
  ratingProbabilities = defaultSenateRaceRatingProbabilities(),
) => {
  return Object.fromEntries(
    Object.entries(senate2026Races).map(([state, race]) => {
      const source = senateForecastSources[sourceId];
      const rating = source.ratings?.[state as State];
      const sourceProbability = source.probabilities?.[state as State];
      const leftCandidate =
        sourceProbability !== undefined
          ? sourceProbability
          : rating
            ? rating.party === race.leftCandidateParty
              ? ratingProbabilities[rating.rating]
              : 1 - ratingProbabilities[rating.rating]
            : 0.5;
      return [
        state,
        {
          leftCandidate,
          rightCandidate: 1 - leftCandidate,
          leftCandidateParty: race.leftCandidateParty,
          rightCandidateParty: race.rightCandidateParty,
        },
      ];
    }),
  ) as Partial<
    Record<
      State,
      {
        leftCandidate: number;
        rightCandidate: number;
        leftCandidateParty: SenateParty;
        rightCandidateParty: SenateParty;
      }
    >
  >;
};
