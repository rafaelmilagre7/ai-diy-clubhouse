
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { PlayCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      {/* Modern section header */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-2xl">
              <PlayCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Text variant="subsection" textColor="primary" className="font-semibold">
                  Projetos em andamento
                </Text>
                <Badge variant="warning" size="sm">
                  {solutions.length} ativo{solutions.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Text variant="body" textColor="secondary">
                Continue implementando esses projetos em seu negócio
              </Text>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-warning">
            <TrendingUp className="h-5 w-5" />
            <Text variant="caption" textColor="secondary" className="font-medium">
              Em progresso
            </Text>
          </div>
        </div>
      </Card>

      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
