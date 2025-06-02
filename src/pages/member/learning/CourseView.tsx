
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

const CourseView = () => {
  const { courseId } = useParams();

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <GraduationCap className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Curso #{courseId}</h1>
            <p className="text-muted-foreground">
              Detalhes e módulos do curso.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Módulos e aulas do curso serão exibidos aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseView;
