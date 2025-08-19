import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useModuleDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteModule = async (moduleId: string, moduleTitle?: string) => {
    if (isDeleting) return false;

    setIsDeleting(true);
    
    try {
      console.log('🗑️ [DELETE-MODULE] Iniciando exclusão do módulo:', moduleId);
      
      const { data, error } = await supabase.functions.invoke('delete-module', {
        body: { moduleId }
      });

      if (error) {
        console.error('❌ [DELETE-MODULE] Erro na função:', error);
        throw new Error(error.message || 'Erro ao excluir módulo');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido ao excluir módulo');
      }

      console.log('✅ [DELETE-MODULE] Módulo excluído com sucesso:', data);
      
      toast.success(
        data.message || `Módulo ${moduleTitle ? `"${moduleTitle}"` : ''} excluído com sucesso!`
      );
      
      return true;

    } catch (error: any) {
      console.error('❌ [DELETE-MODULE] Erro:', error);
      
      toast.error(
        error.message || 'Não foi possível excluir o módulo. Tente novamente.'
      );
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteModule,
    isDeleting
  };
};