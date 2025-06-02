
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

const LearningPage = () => {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <GraduationCap className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Aprendizado</h1>
            <p className="text-muted-foreground">
              Acesse cursos e materiais de aprendizado.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lista de cursos disponíveis será exibida aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningPage;
