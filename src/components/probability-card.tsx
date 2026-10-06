import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProbabilityCardProps = {
  borderClassName: string;
  label: string;
  labelClassName: string;
  detail?: ReactNode;
  labelAccessory?: ReactNode;
  probability: number;
};

export default function ProbabilityCard({
  borderClassName,
  label,
  labelClassName,
  detail,
  labelAccessory,
  probability,
}: ProbabilityCardProps) {
  const labelText = (
    <p className={cn("text-balance text-center text-xs font-semibold leading-tight sm:text-xl", labelClassName)}>
      {label}
    </p>
  );

  return (
    <Card className={cn("min-w-0 flex-1", borderClassName)}>
      <CardContent className="flex flex-col items-center justify-center p-2 sm:p-4">
        <p className="text-center text-[10px] leading-tight text-muted-foreground sm:text-sm">Probability of</p>
        {labelAccessory ? (
          <div className="flex items-center gap-1">
            {labelText}
            {labelAccessory}
          </div>
        ) : (
          labelText
        )}
        {detail !== undefined && (
          <p className="w-full text-center text-[10px] leading-tight text-muted-foreground sm:text-xs">{detail}</p>
        )}
        <p className="mt-1 text-xl font-bold sm:text-3xl">{(probability * 100).toFixed(2)}%</p>
      </CardContent>
    </Card>
  );
}
