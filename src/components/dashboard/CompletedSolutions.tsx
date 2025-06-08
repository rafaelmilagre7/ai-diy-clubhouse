
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { CheckCircle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      {/* Modern section header */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-2xl">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Text variant="subsection" textColor="primary" className="font-semibold">
                  Implementações concluídas
                </Text>
                <Badge variant="success" size="sm">
                  {solutions.length} concluída{solutions.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Text variant="body" textColor="secondary">
                Projetos que você já implementou com sucesso
              </Text>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-success">
            <Award className="h-5 w-5" />
            <Text variant="caption" textColor="secondary" className="font-medium">
              Finalizadas
            </Text>
          </div>
        </div>
      </Card>

      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
