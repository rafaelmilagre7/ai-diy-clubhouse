
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PublishLessonButtonProps {
  lessonId: string;
  isPublished: boolean;
  onPublishChange?: (published: boolean) => void;
  showPreview?: boolean;
}

export const PublishLessonButton = ({ 
  lessonId, 
  isPublished, 
  onPublishChange,
  showPreview = true
}: PublishLessonButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  
  // Buscar o ID do curso para o link de visualização
  useEffect(() => {
    const fetchCourseId = async () => {
      if (!lessonId || !showPreview) return;
      
      try {
        // Buscar informações da aula incluindo o módulo e o curso
        const { data, error } = await supabase
          .from("learning_lessons")
          .select(`
            module_id,
            module:learning_modules(
              course_id
            )
          `)
          .eq("id", lessonId)
          .single();
        
        if (error) throw error;
        
        if (data && data.module) {
          // Verificamos se module é um array ou objeto e acessamos course_id corretamente
          const moduleData = data.module;
          if (Array.isArray(moduleData) && moduleData.length > 0) {
            setCourseId(moduleData[0].course_id);
          } else if (typeof moduleData === 'object' && moduleData !== null) {
            setCourseId(moduleData.course_id);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar ID do curso:", err);
      }
    };
    
    fetchCourseId();
  }, [lessonId, showPreview]);
  
  const handlePublishToggle = async () => {
    // Se estiver publicado, mostra confirmação antes de despublicar
    if (isPublished) {
      setShowConfirmDialog(true);
      return;
    }
    
    // Se não estiver publicado, publica diretamente
    await togglePublishStatus();
  };
  
  const togglePublishStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("learning_lessons")
        .update({ 
          published: !isPublished,
          updated_at: new Date().toISOString()
        })
        .eq("id", lessonId)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newStatus = data.published;
        
        toast.success(
          newStatus 
            ? "Aula publicada com sucesso!" 
            : "Aula despublicada com sucesso!"
        );
        
        if (onPublishChange) {
          onPublishChange(newStatus);
        }
      }
    } catch (error) {
      console.error("Erro ao alterar status de publicação:", error);
      toast.error("Erro ao alterar status de publicação");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };
  
  const getPreviewUrl = () => {
    // Se temos o ID do curso, construímos a URL completa para visualização de membro
    if (courseId) {
      return `/formacao/aulas/view/${courseId}/${lessonId}`;
    }
    // URL de fallback se não temos o ID do curso
    return `/formacao/aulas/view/preview/${lessonId}`;
  };
  
  const handlePreviewClick = () => {
    const previewUrl = getPreviewUrl();
    window.open(previewUrl, '_blank');
  };
  
  return (
    <>
      <div className="flex gap-2">
        <Button
          variant={isPublished ? "default" : "outline"}
          onClick={handlePublishToggle}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : isPublished ? (
            <Check className="h-4 w-4 mr-1" />
          ) : null}
          {isPublished ? "Publicada" : "Publicar"}
        </Button>
        
        {showPreview && isPublished && (
          <Button variant="outline" onClick={handlePreviewClick}>
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
        )}
      </div>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Despublicar aula?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao despublicar esta aula, ela não estará mais visível para os membros.
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={togglePublishStatus}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Despublicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
