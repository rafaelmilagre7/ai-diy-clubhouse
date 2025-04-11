
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BarChart, ArrowRight } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";

// Helper function to format minutes to time
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
};

interface SolutionCardProps {
  solution: Solution;
  onSelect: (id: string) => void;
}

export const SolutionCard = ({ solution, onSelect }: SolutionCardProps) => {
  return (
    <Card className={cn("solution-card transition-all duration-200 cursor-pointer hover:translate-y-[-4px]", solution.category)}>
      <CardContent className="p-0">
        <div 
          className="h-40 bg-cover bg-center rounded-t-xl"
          style={{ 
            backgroundImage: solution.thumbnail_url 
              ? `url(${solution.thumbnail_url})` 
              : `url('https://placehold.co/600x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
          }}
        />
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={cn("badge-" + solution.category)}>
              {solution.category === "revenue" && "Receita"}
              {solution.category === "operational" && "Operacional"}
              {solution.category === "strategy" && "Estratégia"}
            </Badge>
            <DifficultyBadge difficulty={solution.difficulty} />
          </div>
          <h3 className="font-semibold text-lg line-clamp-2">{solution.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {solution.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{formatTime(solution.estimated_time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground flex items-center">
            <BarChart className="mr-1 h-4 w-4" />
            <span>{solution.success_rate}% sucesso</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onSelect(solution.id)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
