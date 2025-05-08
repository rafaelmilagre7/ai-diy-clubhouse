
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AulaFormValues } from "@/components/formacao/aulas/wizard/AulaStepWizard";

interface CreateAulaOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useCreateAula = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (aulaData: AulaFormValues, options?: CreateAulaOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar dados da aula
      if (!aulaData.title) {
        throw new Error("O título da aula é obrigatório");
      }

      console.log("Iniciando criação de aula com dados:", aulaData);
      
      // Criar objeto da aula para salvar no banco
      const aulaToSave = {
        title: aulaData.title,
        description: aulaData.description || '',
        course_id: aulaData.formacao_id, // Usar formacao_id em vez de courseId
        module_id: aulaData.modulo_id, // Usar modulo_id como está definido em AulaFormValues
        content: aulaData.content || {},
        cover_image_url: aulaData.coverImageUrl || null,
        estimated_time_minutes: aulaData.order_index || 0, // Usar um valor padrão para estimated_time
        published: aulaData.published !== false, // default true
        order_index: aulaData.order_index || 0, // Usar order_index como está definido
        ai_assistant_enabled: aulaData.aiAssistantEnabled !== false, // default true
        ai_assistant_prompt: aulaData.aiAssistantPrompt || ''
      };
      
      // Inserir a aula no Supabase
      const { data: aulaCreated, error: aulaError } = await supabase
        .from('learning_lessons')
        .insert(aulaToSave)
        .select()
        .single();
      
      if (aulaError) throw aulaError;
      
      if (!aulaCreated) {
        throw new Error("Erro ao criar aula: nenhum dado retornado");
      }
      
      console.log("Aula criada com sucesso:", aulaCreated);
      
      // Se houver vídeos, criar registros de vídeo
      if (aulaData.videos && aulaData.videos.length > 0) {
        console.log(`Processando ${aulaData.videos.length} vídeos para a aula`);
        
        // Mapear vídeos para o formato do banco
        const videosToSave = aulaData.videos.map((video, index) => ({
          lesson_id: aulaCreated.id,
          title: video.title || `Vídeo ${index + 1}`,
          description: video.description || '',
          url: video.url || '',
          video_type: video.type || 'youtube',
          order_index: index,
          thumbnail_url: video.thumbnail_url || null,
          duration_seconds: video.duration_seconds || 0,
          video_file_path: video.filePath || null,
          video_file_name: video.fileName || null,
          file_size_bytes: video.fileSize || null
        }));
        
        // Inserir vídeos no banco
        const { error: videosError } = await supabase
          .from('learning_lesson_videos')
          .insert(videosToSave);
        
        if (videosError) {
          console.error("Erro ao salvar vídeos:", videosError);
          // Não interromper o fluxo, apenas logar o erro
          toast.error("Aula criada, mas houve um problema ao salvar alguns vídeos.");
        } else {
          console.log("Vídeos salvos com sucesso");
        }
      }
      
      // Se houver recursos, criar registros de recursos
      if (aulaData.resources && aulaData.resources.length > 0) {
        console.log(`Processando ${aulaData.resources.length} recursos para a aula`);
        
        // Mapear recursos para o formato do banco
        const resourcesToSave = aulaData.resources.map((resource, index) => ({
          lesson_id: aulaCreated.id,
          name: resource.name || `Recurso ${index + 1}`,
          description: resource.description || '',
          file_url: resource.url || '',
          file_type: resource.type || 'document',
          order_index: index,
          file_size_bytes: resource.fileSize || null
        }));
        
        // Inserir recursos no banco
        const { error: resourcesError } = await supabase
          .from('learning_resources')
          .insert(resourcesToSave);
        
        if (resourcesError) {
          console.error("Erro ao salvar recursos:", resourcesError);
          // Não interromper o fluxo, apenas logar o erro
          toast.error("Aula criada, mas houve um problema ao salvar alguns recursos.");
        } else {
          console.log("Recursos salvos com sucesso");
        }
      }
      
      // Chamar callback de sucesso
      if (options?.onSuccess) {
        options.onSuccess({
          ...aulaCreated,
          videos: aulaData.videos,
          resources: aulaData.resources
        });
      }
      
      toast.success("A aula foi criada com sucesso!");
      
      setIsLoading(false);
      return aulaCreated;
    } catch (err: any) {
      console.error("Erro ao criar aula:", err);
      setError(err);
      
      toast.error(err.message || "Ocorreu um erro ao tentar criar a aula.");
      
      // Chamar callback de erro
      if (options?.onError) {
        options.onError(err);
      }
      
      setIsLoading(false);
      throw err;
    }
  };

  return {
    mutate,
    isLoading,
    error
  };
};
