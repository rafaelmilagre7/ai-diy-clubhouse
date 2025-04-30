
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  percentage: number;
}

export const CourseProgress = ({ percentage }: CourseProgressProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Seu progresso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span>Progresso do curso</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {percentage === 0 ? (
              "Comece a estudar para registrar seu progresso"
            ) : percentage < 100 ? (
              "Continue estudando para concluir o curso"
            ) : (
              "Parabéns! Você concluiu este curso"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
