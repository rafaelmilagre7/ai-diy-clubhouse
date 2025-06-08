
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";
import { Text } from "@/components/ui/text";
import { CheckCircle } from "lucide-react";

interface CompletedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const CompletedSolutions: FC<CompletedSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-success/10 rounded-lg">
          <CheckCircle className="h-5 w-5 text-success" />
        </div>
        <div>
          <Text variant="subsection" textColor="primary" className="mb-1">
            Implementações concluídas
          </Text>
          <Text variant="body" textColor="secondary">
            Projetos que você já implementou com sucesso
          </Text>
        </div>
      </div>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
