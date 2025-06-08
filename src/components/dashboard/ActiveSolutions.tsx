
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";
import { Text } from "@/components/ui/text";
import { PlayCircle } from "lucide-react";

interface ActiveSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const ActiveSolutions: FC<ActiveSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-warning/10 rounded-lg">
          <PlayCircle className="h-5 w-5 text-warning" />
        </div>
        <div>
          <Text variant="subsection" textColor="primary" className="mb-1">
            Projetos em andamento
          </Text>
          <Text variant="body" textColor="secondary">
            Continue implementando esses projetos em seu negócio
          </Text>
        </div>
      </div>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
