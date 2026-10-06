import type { Metadata } from "next";
import SenateForecast from "@/components/senate/senate-forecast";

export const metadata: Metadata = {
  title: "2026 Senate",
  description: "Estimate each Senate race and see the chance of either party winning a majority.",
};

export default function SenateForecastPage() {
  return <SenateForecast />;
}
