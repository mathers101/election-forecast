import type { FinalProbability } from "@/lib/calculate-senate-probability";
import ProbabilityCard from "@/components/probability-card";

export default function SenateProbabilities({ prob }: { prob: FinalProbability }) {
  return (
    <div className="flex w-full flex-col gap-2 mt-4">
      <div className="flex w-full flex-row gap-2 sm:gap-8">
        <ProbabilityCard
          borderClassName="ring-blue-500/50"
          label="Democratic majority"
          labelClassName="text-blue-600"
          detail="(51 seats or more)"
          probability={prob.D}
        />
        <ProbabilityCard
          borderClassName="ring-red-500/50"
          label="Republican majority"
          labelClassName="text-red-600"
          detail="(50 seats or more)"
          probability={prob.R}
        />
        <ProbabilityCard
          borderClassName="ring-gray-500/50"
          label="Neither"
          labelClassName="text-gray-600"
          detail={"\u3164"}
          probability={1 - prob.D - prob.R}
        />
      </div>
    </div>
  );
}
