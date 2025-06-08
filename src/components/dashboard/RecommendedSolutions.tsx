
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";
import { Text } from "@/components/ui/text";
import { Lightbulb } from "lucide-react";

interface RecommendedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const RecommendedSolutions: FC<RecommendedSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Text variant="subsection" textColor="primary" className="mb-1">
            Soluções recomendadas
          </Text>
          <Text variant="body" textColor="secondary">
            Soluções personalizadas baseadas no seu perfil de negócio
          </Text>
        </div>
      </div>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
