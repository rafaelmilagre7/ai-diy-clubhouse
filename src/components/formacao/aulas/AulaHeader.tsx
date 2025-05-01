
import { LearningLesson } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  ClipboardEdit, 
  Clock,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AulaHeaderProps {
  aula: LearningLesson;
  onEditar: () => void;
  isAdmin: boolean;
  moduloId: string;
}

export const AulaHeader = ({ aula, onEditar, isAdmin, moduloId }: AulaHeaderProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não definida";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const voltar = () => {
    navigate(`/formacao/modulos/${moduloId}`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          onClick={voltar}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Módulo
        </Button>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              onClick={onEditar} 
              variant="default"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Aula
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{aula.title}</h1>
        
        {aula.description && (
          <p className="text-muted-foreground max-w-3xl">{aula.description}</p>
        )}
        
        <div className="flex flex-wrap gap-4 mt-2">
          {aula.estimated_time_minutes > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{aula.estimated_time_minutes} minutos</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Atualizado em {formatDate(aula.updated_at)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              aula.published 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
            }`}>
              {aula.published ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </div>
      </div>
      
      {aula.cover_image_url && (
        <div className="mt-4">
          <img
            src={aula.cover_image_url}
            alt={`Capa da aula ${aula.title}`}
            className="w-full h-48 md:h-64 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/1200x400?text=Imagem+não+encontrada";
            }}
          />
        </div>
      )}
    </div>
  );
};
