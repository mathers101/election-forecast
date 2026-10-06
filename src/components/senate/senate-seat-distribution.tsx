import type { SenateSeatPdfs } from "@/lib/calculate-senate-probability";
import SenateExpectedSeats from "./senate-expected-seats";
import SenateProbabilityDistribution from "./senate-probability-distribution";

export default function SenateSeatDistribution({ pdfs, cdfs }: { pdfs: SenateSeatPdfs; cdfs: SenateSeatPdfs }) {
  return (
    <section
      className="mt-4 grid w-full min-w-0 gap-4 lg:grid-cols-[0.85fr_1.15fr]"
      aria-label="Senate seat distribution"
    >
      <SenateExpectedSeats pdfs={pdfs} />
      <SenateProbabilityDistribution pdfs={pdfs} cdfs={cdfs} />
    </section>
  );
}
