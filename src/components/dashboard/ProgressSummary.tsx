
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";

interface ProgressSummaryProps {
  completedCount: number;
  inProgressCount: number;
  progressPercentage: number;
  totalSolutions: number;
}

export const ProgressSummary = ({
  completedCount,
  inProgressCount,
  progressPercentage,
  totalSolutions
}: ProgressSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-aurora-primary/10 p-2">
              <CheckCircle className="h-6 w-6 text-aurora-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Implementações Completas</p>
              <p className="text-2xl font-bold">{completedCount} de {totalSolutions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-aurora-primary/10 p-2">
              <Clock className="h-6 w-6 text-aurora-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{inProgressCount} soluções</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-aurora-primary/10 p-2">
              <TrendingUp className="h-6 w-6 text-aurora-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seu Progresso</p>
              <p className="text-2xl font-bold">{progressPercentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
