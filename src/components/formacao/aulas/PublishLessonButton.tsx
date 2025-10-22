
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
  difficulty?: string;
}

export const PublishLessonButton = ({ 
  lessonId, 
  isPublished, 
  onPublishChange,
  showPreview = true,
  difficulty
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
          const moduleData = data.module;
          let extractedCourseId: string | null = null;
          
          // Verifica se é um array e extrai o course_id de forma segura
          if (Array.isArray(moduleData)) {
            if (moduleData.length > 0 && 'course_id' in moduleData[0]) {
              extractedCourseId = moduleData[0].course_id;
            }
          } 
          // Verifica se é um objeto e extrai o course_id de forma segura
          else if (moduleData && typeof moduleData === 'object') {
            if ('course_id' in moduleData) {
              extractedCourseId = (moduleData as {course_id: string}).course_id;
            }
          }
          
          if (extractedCourseId) {
            setCourseId(extractedCourseId);
          } else {
            console.error("Não foi possível extrair o course_id da resposta:", moduleData);
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
      const updateData = { 
        published: !isPublished,
        updated_at: new Date().toISOString()
      };
      
      // Verifica se temos informação de dificuldade e inclui no update se necessário
      if (difficulty && !isPublished) {
        Object.assign(updateData, { difficulty_level: difficulty });
      }
      
      const { data, error } = await supabase
        .from("learning_lessons")
        .update(updateData)
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
