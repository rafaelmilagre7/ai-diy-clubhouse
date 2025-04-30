
import { Progress } from "@/components/ui/progress";

interface LessonHeaderProps {
  title: string;
  moduleTitle: string;
  progress: number;
}

export const LessonHeader = ({ title, moduleTitle, progress }: LessonHeaderProps) => {
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-1">
        Módulo: {moduleTitle}
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progresso da aula</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};
