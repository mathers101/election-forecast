import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SenateSeatPdfs } from "@/lib/calculate-senate-probability";

const chartConfig = {
  D: { label: "Democratic caucus", color: "#2563eb" },
  R: { label: "Republican", color: "#dc2626" },
} satisfies ChartConfig;

const atLeastSeats = (cdf: number[], seats: number) => 1 - (seats > 0 ? (cdf[seats - 1] ?? 0) : 0);

const minSeats = 44;
const maxSeats = 56;

export default function SenateProbabilityDistribution({ pdfs, cdfs }: { pdfs: SenateSeatPdfs; cdfs: SenateSeatPdfs }) {
  const chartData = Array.from({ length: maxSeats - minSeats + 1 }, (_, index) => {
    const seats = minSeats + index;
    return { seats, D: pdfs.D[seats] ?? 0, R: pdfs.R[seats] ?? 0 };
  });

  return (
    <Card className="min-w-0 w-full overflow-hidden">
      <CardContent className="px-2 py-4 sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Probability distribution</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Probability of each party’s total seat count under these predictions.
        </p>
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full min-w-0 max-w-full sm:h-75">
          <AreaChart accessibilityLayer data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="seats"
              type="number"
              domain={[minSeats, maxSeats]}
              ticks={[44, 47, 50, 53, 56]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDataOverflow
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
              width={36}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  className="min-w-55 rounded-md border-border/70 bg-background/98 px-3 py-2.5 shadow-lg"
                  labelFormatter={() => null}
                  formatter={(value, name, item) => {
                    const key = String(name) as keyof typeof chartConfig;
                    const series = chartConfig[key];
                    const seats = Number((item.payload as { seats?: number }).seats);
                    const atLeast = atLeastSeats(cdfs[key], seats);
                    return (
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: series.color }} />
                          <span className="text-muted-foreground">{series.label}</span>
                        </div>
                        <div className="flex justify-between gap-4 pl-5">
                          <span className="text-muted-foreground">Exactly {seats} seats</span>
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {(Number(value) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 pl-5">
                          <span className="text-muted-foreground">At least {seats} seats</span>
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {(atLeast * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Area dataKey="D" type="linear" fill="var(--color-D)" fillOpacity={0.2} stroke="var(--color-D)" />
            <Area dataKey="R" type="linear" fill="var(--color-R)" fillOpacity={0.2} stroke="var(--color-R)" />
            <ChartLegend
              itemSorter={null}
              content={<ChartLegendContent className="justify-center text-xs sm:text-sm" />}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
