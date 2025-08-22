import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RefreshProgressButtonProps {
  lessonId?: string;
  courseId?: string;
  className?: string;
}

export const RefreshProgressButton: React.FC<RefreshProgressButtonProps> = ({
  lessonId,
  courseId,
  className = ""
}) => {
  const queryClient = useQueryClient();
  
  const handleRefresh = async () => {
    console.log('[REFRESH-PROGRESS] 🔄 Iniciando refresh manual dos dados');
    
    try {
      // Invalidar e refazer todas as queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ['learning-lesson-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['learning-user-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['learning-completed-lessons'] });
      await queryClient.invalidateQueries({ queryKey: ['course-details'] });
      await queryClient.invalidateQueries({ queryKey: ['learning-courses'] });
      await queryClient.invalidateQueries({ queryKey: ['optimized-lesson-progress'] });
      
      if (lessonId) {
        await queryClient.refetchQueries({ queryKey: ['learning-lesson-progress', lessonId] });
        await queryClient.refetchQueries({ queryKey: ['optimized-lesson-progress', lessonId] });
      }
      
      if (courseId) {
        await queryClient.refetchQueries({ queryKey: ['course-details', courseId] });
      }
      
      toast.success("Dados atualizados com sucesso!");
      console.log('[REFRESH-PROGRESS] ✅ Refresh manual concluído');
      
    } catch (error) {
      console.error('[REFRESH-PROGRESS] ❌ Erro no refresh manual:', error);
      toast.error("Erro ao atualizar dados");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className={`gap-1 ${className}`}
      title="Atualizar dados de progresso"
    >
      <RefreshCw className="h-3 w-3" />
      Atualizar
    </Button>
  );
};

export default RefreshProgressButton;