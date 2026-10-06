import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import ProbabilitySlider from "./probability-slider";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { type StateProbability, type CandidateParty } from "@/data/state-probabilities";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useIsMobile } from "@/hooks/use-is-mobile";

export type StateContest = {
  subtitle: ReactNode;
  leftCandidate: string;
  leftCandidateParty: CandidateParty;
  rightCandidate: string;
  rightCandidateParty: CandidateParty;
};

interface USAStateProps {
  stateName: string;
  dimensions: string;
  state: string;
  fill: string;
  onSelectState: () => void;
  onUnselectState: () => void;
  onClearSelection: () => void;
  probability: StateProbability | null;
  setProbability: (prob: StateProbability | null) => void;
  isOpen: boolean;
  contest?: StateContest;
}

const USAState = ({
  stateName,
  dimensions,
  state,
  fill,
  onSelectState,
  onUnselectState,
  onClearSelection,
  probability,
  setProbability,
  isOpen,
  contest,
}: USAStateProps) => {
  const isMobile = useIsMobile();
  // The slider value always represents the probability of the right-side candidate winning.
  const rightCandidateProbability = probability?.rightCandidate ?? 0.5;
  const initialSliderValue = rightCandidateProbability * 100;
  const [sliderValue, setSliderValue] = useState([initialSliderValue]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSliderValue([(probability?.rightCandidate ?? 0.5) * 100]);
    }
  }, [isOpen, probability, contest?.rightCandidateParty]);

  const onOpenChange = (open: boolean) => {
    if (open) onSelectState();
    else onUnselectState();
  };

  const onClickCancel = () => {
    onUnselectState();
  };

  const onSave = () => {
    if (!contest) return;
    const rightCandidateWin = sliderValue[0] / 100;
    const leftCandidateWin = 1 - rightCandidateWin;
    setProbability({
      leftCandidate: leftCandidateWin,
      rightCandidate: rightCandidateWin,
      leftCandidateParty: contest.leftCandidateParty,
      rightCandidateParty: contest.rightCandidateParty,
    });
    onUnselectState();
  };

  const editor = contest && (
    <div className={cn("flex flex-col w-full space-y-4", !isMobile && "px-4")}>
      <div className="text-center">
        {isMobile ? <DialogTitle>{stateName}</DialogTitle> : <h3 className="text-lg font-semibold">{stateName}</h3>}
        {isMobile ? (
          <DialogDescription>{contest.subtitle}</DialogDescription>
        ) : (
          <p className="text-sm text-muted-foreground">{contest.subtitle}</p>
        )}
      </div>
      <ProbabilitySlider
        sliderValue={sliderValue}
        setSliderValue={setSliderValue}
        leftCandidate={contest.leftCandidate}
        leftCandidateParty={contest.leftCandidateParty}
        rightCandidate={contest.rightCandidate}
        rightCandidateParty={contest.rightCandidateParty}
      />
      <div className="flex ml-auto space-x-2">
        <Button type="button" variant="outline" onClick={onClickCancel} className="hover:cursor-pointer">
          Cancel
        </Button>
        <Button
          type="button"
          variant="default"
          className="bg-purple-700 hover:bg-purple-500 hover:cursor-pointer"
          onClick={onSave}
        >
          Confirm
        </Button>
      </div>
    </div>
  );

  const statePath = (
    <path
      d={dimensions}
      fill={fill}
      data-name={state}
      className={cn("hover:cursor-pointer", "hover:opacity-75")}
    >
      <title>{stateName}</title>
    </path>
  );

  if (!contest) {
    return (
      <path d={dimensions} fill={fill} data-name={state} className="cursor-default" onClick={onClearSelection}>
        <title>{stateName}</title>
      </path>
    );
  }

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {statePath}
        </DialogTrigger>
        <DialogContent className="w-full">
          {editor}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {statePath}
      </PopoverTrigger>
      <PopoverContent side="top" className="w-md" updatePositionStrategy="always">
        {editor}
      </PopoverContent>
    </Popover>
  );
};

export default USAState;
