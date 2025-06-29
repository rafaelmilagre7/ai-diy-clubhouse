
import { LearningCourse } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Clock, FileText, BarChart } from "lucide-react";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

interface CursoHeaderProps {
  curso: LearningCourse;
  onNovoModulo: () => void;
  onEditarCurso: () => void;
  isAdmin: boolean;
}

export const CursoHeader: React.FC<CursoHeaderProps> = ({
  curso,
  onNovoModulo,
  onEditarCurso,
  isAdmin
}) => {
  const coverImage = curso.cover_image_url || '/placeholder-course.jpg';
  
  return (
    <div className="space-y-6">
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{curso.title}</h1>
          <p className="mt-2 line-clamp-2 text-white/80">{curso.description}</p>
        </div>

        {isAdmin && (
          <div className="absolute top-4 right-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onEditarCurso}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Curso
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span className="flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          {new Date(curso.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div className="flex flex-wrap justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Módulos do Curso</h2>
          <p className="text-muted-foreground">
            Explore os módulos deste curso e acesse as aulas disponíveis.
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              onClick={onNovoModulo}
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Novo Módulo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
