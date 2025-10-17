
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { LearningModule } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface ModuloHeaderProps {
  modulo: LearningModule & {
    learning_courses?: {
      id: string;
      title: string;
    } | null;
  };
  onEdit: () => void;
  isAdmin: boolean;
}

export const ModuloHeader: React.FC<ModuloHeaderProps> = ({
  modulo,
  onEdit,
  isAdmin
}) => {
  const navigate = useNavigate();
  const courseId = modulo.course_id;
  const courseTitle = modulo.learning_courses?.title || 'Curso';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/formacao/cursos/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para {courseTitle}
        </Button>
      </div>

      <div className="relative h-40 md:h-48 rounded-lg overflow-hidden">
        {modulo.cover_image_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${modulo.cover_image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-background to-surface-base" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{modulo.title}</h1>
          {modulo.description && (
            <p className="mt-2 line-clamp-2 text-white/80">{modulo.description}</p>
          )}
        </div>

        {isAdmin && (
          <div className="absolute top-4 right-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Módulo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
