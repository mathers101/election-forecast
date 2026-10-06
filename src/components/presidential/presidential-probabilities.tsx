import type { FinalProbability } from "@/lib/calculate-presidential-probability";
import ProbabilityCard from "@/components/probability-card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HelpCircle } from "lucide-react";

export default function PresidentialProbabilities({ prob }: { prob: FinalProbability }) {
  return (
    <div className="mt-4 flex w-full max-w-3xl flex-row gap-2 sm:gap-8">
      <ProbabilityCard
        borderClassName="border-blue-500"
        label="Harris Victory"
        labelClassName="text-blue-600 dark:text-blue-400"
        probability={prob.D}
      />
      <ProbabilityCard
        borderClassName="border-gray-400"
        label="Draw"
        labelClassName="text-gray-700 dark:text-gray-300"
        labelAccessory={
          <Popover>
            <PopoverTrigger asChild>
              <HelpCircle className="size-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 translate-y-0.5 cursor-pointer sm:size-4 sm:translate-y-0.75" />
            </PopoverTrigger>
            <PopoverContent side="right" className="max-w-xs text-sm">
              A draw occurs if both candidates receive exactly 269 electoral votes each. In this case, the election is
              decided by the House of Representatives.
            </PopoverContent>
          </Popover>
        }
        probability={prob.draw}
      />
      <ProbabilityCard
        borderClassName="border-red-500"
        label="Trump Victory"
        labelClassName="text-red-600 dark:text-red-400"
        probability={prob.R}
      />
    </div>
  );
}
