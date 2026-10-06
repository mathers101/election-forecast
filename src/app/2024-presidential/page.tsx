import type { Metadata } from "next";
import PresidentialForecast from "@/components/presidential/presidential-forecast";

export const metadata: Metadata = {
  title: "2024 Presidential Election",
  description:
    "Estimate each state's presidential win probability and see the chance of a Harris or Trump Electoral College victory.",
};

export default function PresidentialForecastPage() {
  return <PresidentialForecast />;
}
