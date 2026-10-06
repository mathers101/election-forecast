import type { FinalProbability } from "@/lib/calculate-probability";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HelpCircle } from "lucide-react";

interface ProbabilitiesProps {
  prob: FinalProbability;
  election: "presidential" | "senate";
}

export default function VictoryProbabilities({ prob, election }: ProbabilitiesProps) {
  if (election === "senate") return (
    <div className="flex w-full flex-col gap-2 mt-4">
      <div className="flex w-full flex-row gap-2 sm:gap-8">
      <Card className="min-w-0 flex-1 border-blue-500"><CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
        <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p><p className="text-balance text-center text-xs font-semibold leading-tight text-blue-600 sm:text-xl">Democratic majority</p>
      <p className="w-full text-center text-[10px] leading-tight text-muted-foreground sm:text-xs">(51 seats or more)</p>
        <p className="mt-1 text-xl font-bold sm:text-3xl">{(prob.D * 100).toFixed(2)}%</p>
      </CardContent></Card>
      <Card className="min-w-0 flex-1 border-red-500"><CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
        <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p><p className="text-balance text-center text-xs font-semibold leading-tight text-red-600 sm:text-xl">Republican majority</p>
      <p className="w-full text-center text-[10px] leading-tight text-muted-foreground sm:text-xs">(50 seats or more)</p>
        <p className="mt-1 text-xl font-bold sm:text-3xl">{(prob.R * 100).toFixed(2)}%</p>
      </CardContent></Card>
      <Card className="min-w-0 flex-1 border-gray-400"><CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
        <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p><p className="text-center text-xs font-semibold leading-tight text-gray-600 sm:text-xl">Neither</p>
      <p className="w-full text-center text-[10px] leading-tight text-muted-foreground sm:text-xs">{"\u3164"}</p>
        <p className="mt-1 text-xl font-bold sm:text-3xl">{((1 - prob.D - prob.R) * 100).toFixed(2)}%</p>
      </CardContent></Card>
      </div>
    </div>
  );
  return (
    <div className="mt-4 flex w-full max-w-3xl flex-row gap-2 sm:gap-8">
      <Card className="min-w-0 flex-1 border-blue-500">
        <CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
          <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p>
          <p className="text-balance text-center text-xs font-semibold leading-tight text-blue-600 sm:text-xl dark:text-blue-400">Harris Victory</p>
          <p className="mt-1 text-xl font-bold sm:text-3xl">{(prob.D * 100).toFixed(2)}%</p>
        </CardContent>
      </Card>
      <Card className="min-w-0 flex-1 border-gray-400">
        <CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
          <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p>
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold leading-tight text-gray-700 sm:text-xl dark:text-gray-300">Draw</p>
            <Popover>
              <PopoverTrigger asChild>
                <HelpCircle className="size-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 translate-y-0.5 cursor-pointer sm:size-4 sm:translate-y-0.75" />
              </PopoverTrigger>
              <PopoverContent side="right" className="max-w-xs text-sm">
                A draw occurs if both candidates receive exactly 269 electoral votes each. In this case, the election is
                decided by the House of Representatives.
              </PopoverContent>
            </Popover>
          </div>
          <p className="mt-1 text-xl font-bold sm:text-3xl">{(prob.draw * 100).toFixed(2)}%</p>
        </CardContent>
      </Card>
      <Card className="min-w-0 flex-1 border-red-500">
        <CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
          <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p>
          <p className="text-balance text-center text-xs font-semibold leading-tight text-red-600 sm:text-xl dark:text-red-400">Trump Victory</p>
          <p className="mt-1 text-xl font-bold sm:text-3xl">{(prob.R * 100).toFixed(2)}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
