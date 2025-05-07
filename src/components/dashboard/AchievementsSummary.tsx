
import { Trophy } from "lucide-react";

export const AchievementsSummary = () => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-medium">Suas Conquistas</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Complete desafios e ganhe badges. Suas conquistas serão exibidas aqui.
      </p>
    </div>
  );
};
