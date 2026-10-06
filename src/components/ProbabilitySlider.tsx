"use client";

// import { getColorFromProbability } from "@/lib/get-color-from-prob";
import { partyColors as defaultPartyColors } from "@/data/state-probabilities";
import * as Slider from "@radix-ui/react-slider";
import type { SenateParty } from "@/data/senate-2026";

interface ProbabilitySliderProps {
  sliderValue: number[];
  setSliderValue: (value: number[]) => void;
  election: "presidential" | "senate";
  leftCandidate: string;
  leftCandidateParty: SenateParty;
  rightCandidate: string;
  rightCandidateParty: SenateParty;
  partyColors?: Record<SenateParty, string>;
}

export default function ProbabilitySlider({
  sliderValue: value,
  setSliderValue: setValue,
  election,
  leftCandidate,
  leftCandidateParty,
  rightCandidate,
  rightCandidateParty,
  partyColors = defaultPartyColors,
}: ProbabilitySliderProps) {
  const rightPercent = Math.round(value[0]);
  const leftPercent = Math.round(100 - rightPercent);
  const leftParty = election === "senate" ? leftCandidateParty ?? "D" : "D";
  const rightParty = election === "senate" ? rightCandidateParty ?? "R" : "R";
  const leftColor = partyColors[leftParty];
  const rightColor = partyColors[rightParty];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative w-full h-8">
        {/* Gradient Track Background */}
        <div
          className="absolute w-full rounded-full pointer-events-none inset-y-1"
          style={{ background: `linear-gradient(to right, ${leftColor}, ${rightColor})` }}
        />
        <Slider.Root
          className="relative flex items-center w-full h-8 select-none touch-none"
          min={0}
          max={100}
          step={1}
          value={value}
          onValueChange={setValue}
        >
          <Slider.Track className="relative w-full h-2 bg-transparent rounded-full">
            <Slider.Range className="absolute h-2 bg-transparent rounded-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 transition-colors border border-white rounded-full shadow cursor-pointer bg-transparent"
            aria-label="Probability"
          />
        </Slider.Root>
      </div>
      <div className="flex justify-between w-full text-sm">
        <span style={{ color: leftColor }}>{leftCandidate}: {leftPercent}%</span>
        <span style={{ color: rightColor }}>{rightCandidate}: {rightPercent}%</span>
      </div>
    </div>
  );
}

