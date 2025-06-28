
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { LearningCourse } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface CursoHeaderProps {
  curso: LearningCourse;
  onEdit: () => void;
  isAdmin: boolean;
}

export const CursoHeader: React.FC<CursoHeaderProps> = ({
  curso,
  onEdit,
  isAdmin
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/formacao/cursos')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Cursos
        </Button>
      </div>

      <div className="relative h-40 md:h-48 rounded-lg overflow-hidden">
        {/* Removido: cover_image_url não existe no schema LearningCourse */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-700" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{curso.title}</h1>
          {curso.description && (
            <p className="mt-2 line-clamp-2 text-white/80">{curso.description}</p>
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
              Editar Curso
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
