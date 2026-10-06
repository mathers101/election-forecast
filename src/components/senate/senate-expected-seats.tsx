import { useLayoutEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, RenderableText, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { expectedSeats, type SenateSeatPdfs } from "@/lib/calculate-senate-probability";

const SERIES = [
  { key: "D" as const, label: "Democratic caucus", color: "#2563eb" },
  { key: "R" as const, label: "Republican", color: "#dc2626" },
  { key: "I" as const, label: "Independent", color: "#7e22ce" },
];

const chartConfig = {
  seats: { label: "Expected seats", color: "#000000" },
  D: { label: "Democratic caucus", color: "#2563eb" },
  R: { label: "Republican", color: "#dc2626" },
  I: { label: "Independent", color: "#7e22ce" },
} satisfies ChartConfig;

const yTicks = [0, 25, 50];

const TICK_LINES: Record<string, string[]> = {
  D: ["Democratic", "caucus"],
  R: ["Republican"],
  I: ["Independent"],
};

const INDEPENDENT_ICON_SIZE = 14;
const INDEPENDENT_ICON_GAP = 3;

function IndependentLabel({ x, y }: { x: number; y: number }) {
  const textRef = useRef<SVGTextElement>(null);
  const anchorX = x - (INDEPENDENT_ICON_SIZE + INDEPENDENT_ICON_GAP) / 2;
  const [iconPos, setIconPos] = useState({ x: anchorX + 40, y: y + 7 });

  useLayoutEffect(() => {
    const box = textRef.current?.getBBox();
    if (!box) return;
    setIconPos({
      x: box.x + box.width + INDEPENDENT_ICON_GAP,
      y: box.y + (box.height - INDEPENDENT_ICON_SIZE) / 2 - 3,
    });
  }, [anchorX, y]);

  return (
    <g>
      <text ref={textRef} x={anchorX} y={y} dy={21} textAnchor="middle" className="fill-muted-foreground text-xs">
        Independent
      </text>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="translate-y-1">
            <HelpCircle
              x={iconPos.x}
              y={iconPos.y}
              fill="transparent"
              width={INDEPENDENT_ICON_SIZE}
              height={INDEPENDENT_ICON_SIZE}
              role="button"
              aria-label="About independent candidates"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            />
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="block max-w-72 whitespace-normal text-left">
            There are four Independent candidates (in ID, MT, NE, and SD) who claim they do not intend to caucus with
            either party.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </g>
  );
}

function PartyTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value?: string } }) {
  if (payload?.value === "I") return <IndependentLabel x={x} y={y} />;

  const lines = TICK_LINES[payload?.value ?? ""] ?? [payload?.value ?? ""];
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-xs">
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? (lines.length === 1 ? 21 : 14) : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function SeatLabel({
  x = 0,
  y = 0,
  width = 0,
  value,
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: RenderableText;
}) {
  const seats = Number(value);
  if (!Number.isFinite(seats)) return null;
  const inside = seats >= 8;
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={inside ? Number(y) + 16 : Number(y) - 8}
      textAnchor="middle"
      fill={inside ? "#ffffff" : "currentColor"}
      fontSize={12}
      fontWeight={600}
      className={inside ? undefined : "fill-foreground"}
    >
      {seats.toFixed(1)}
    </text>
  );
}

export default function SenateExpectedSeats({ pdfs }: { pdfs: SenateSeatPdfs }) {
  // Sanders and King are the floor of the independent distribution and are already
  // counted in the Democratic caucus. The bar is the seats expected from the
  // other independent candidates.
  const caucusingIndependents = 2;
  const chartData = SERIES.map(({ key }) => ({
    party: key,
    seats: key === "I" ? expectedSeats(pdfs.I) - Math.max(caucusingIndependents, 0) : expectedSeats(pdfs[key]),
    fill: `var(--color-${key})`,
  }));
  const maxSeats = Math.max(56, ...chartData.map((entry) => Math.ceil(entry.seats)));

  return (
    <Card className="min-w-0 w-full overflow-hidden">
      <CardContent className="px-2 py-4 sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Expected seats</h2>
        <p className="mb-3 text-sm text-muted-foreground">Expected number of seats for each party</p>
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full min-w-0 max-w-full sm:h-75">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="party"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={36}
              tick={({ x, y, payload }) => <PartyTick x={+x} y={+y} payload={payload} />}
            />
            <YAxis
              type="number"
              domain={[0, maxSeats]}
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={32}
              allowDataOverflow
            />
            <ReferenceLine y={50} strokeDasharray="4 4" className="stroke-muted-foreground" />
            <Bar dataKey="seats" maxBarSize={56} minPointSize={4}>
              <LabelList dataKey="seats" content={SeatLabel} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
