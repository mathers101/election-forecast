import Predictor from "@/components/Predictor";

export default function PresidentialForecastPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-start justify-start gap-5 bg-white py-2 max-sm:gap-4 max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <Predictor election="presidential" />
    </div>
  );
}
