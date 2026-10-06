import { Card, CardContent } from "@/components/ui/card";

export default function VictoryProbabilitiesPlaceholder({ election }: { election: "presidential" | "senate" }) {
  return (
    <div className="mt-4 w-full max-w-2xl">
      <Card>
        <CardContent className="flex flex-col items-start p-4 text-left">
          <p className="text-xl font-semibold text-muted-foreground">{election === "senate" ? "2026 Senate Forecast" : "2024 Election Forecast"}</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            {election === "senate"
              ? "Enter a probability for each Senate race to see the chance each party wins at least 50 seats."
              : "Once you fill in your predictions for the swing states, this section will show the probability of a Harris victory, Trump victory, or a draw based on your inputs."}
          </p>
          <p className="mt-3 text-purple-700 text-sm">{election === "senate" ? "Select a highlighted state to set your prediction." : "Select the swing states below to get started."}</p>
          {election === "presidential" && <p className="mt-3 text-sm text-muted-foreground max-w-lg">For simplicity, we treat non-swing states as safe for their usual party, but you’re welcome to edit these if you’d like.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
