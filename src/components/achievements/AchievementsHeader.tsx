
import { Trophy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const AchievementsHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex bg-viverblue/10 p-2 rounded-full">
        <Trophy className="h-6 w-6 text-viverblue" />
      </div>
      <div>
        <h1 className={isMobile ? "text-2xl font-bold" : "text-3xl font-bold"}>Suas Conquistas</h1>
        <p className={`text-muted-foreground ${isMobile ? "text-sm mt-1" : "mt-1"}`}>
          Acompanhe seu progresso e conquistas na plataforma
        </p>
      </div>
    </div>
  );
};
