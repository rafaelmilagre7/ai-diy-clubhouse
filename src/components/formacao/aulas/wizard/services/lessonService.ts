
import { supabase } from "@/lib/supabase";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { saveVideosForLesson } from "./videoService";
import { saveResourcesForLesson } from "./resourceService";
import { saveTagsForLesson } from "./tagService";

interface SaveResult {
  success: boolean;
  message?: string;
  lessonId?: string;
}

export async function saveLesson(
  values: AulaFormValues, 
  lessonId?: string,
  setCurrentSaveStep?: (step: string) => void
): Promise<SaveResult> {
  try {
    setCurrentSaveStep?.("Preparando dados da aula...");

    // Calcular o tempo estimado com base nos vídeos
    const totalDurationMinutes = calculateTotalDuration(values.videos);
    
    // Preparar os dados completos da lição
    const completeLessonData = {
      title: values.title,
      description: values.description || null,
      module_id: values.moduleId,
      cover_image_url: values.coverImageUrl || null,
      estimated_time_minutes: totalDurationMinutes, 
      ai_assistant_enabled: values.aiAssistantEnabled,
      ai_assistant_id: values.aiAssistantId || null,
      difficulty_level: values.difficultyLevel,
      published: values.published,
      updated_at: new Date()
    };
    
    let resultId: string;
    
    if (lessonId) {
      // Atualizar aula existente
      setCurrentSaveStep?.("Atualizando informações básicas da aula...");
      
      const { error: updateError } = await supabase
        .from('learning_lessons')
        .update(completeLessonData)
        .eq('id', lessonId);
        
      if (updateError) {
        throw updateError;
      }
      
      resultId = lessonId;
    } else {
      // Criar nova aula
      setCurrentSaveStep?.("Criando nova aula...");
      
      // Verificar se o bucket de vídeos existe
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'learning_videos');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('learning_videos', {
            public: true,
            fileSizeLimit: 104857600, // 100MB
          });
        }
      } catch (err) {
        // Silent fail
      }
      
      const { data, error } = await supabase
        .from('learning_lessons')
        .insert([completeLessonData])
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      resultId = data.id;
    }
    
    // Salvar vídeos da aula
    setCurrentSaveStep?.("Salvando vídeos da aula...");
    const videosResult = await saveVideosForLesson(resultId, values.videos);
    
    // Salvar materiais da aula
    setCurrentSaveStep?.("Salvando materiais de apoio...");
    const resourcesResult = await saveResourcesForLesson(resultId, values.resources);
    
    // Salvar tags da aula
    setCurrentSaveStep?.("Salvando tags da aula...");
    const tagsResult = await saveTagsForLesson(resultId, values.tags || []);
    
    // Determinar mensagem de retorno com base nos resultados
    let message: string;
    
    if (videosResult && resourcesResult && tagsResult) {
      message = lessonId 
        ? "Aula atualizada com sucesso!" 
        : "Aula criada com sucesso!";
    } else {
      message = "Aula salva, mas houve problemas com vídeos, materiais ou tags.";
    }
    
    return {
      success: true,
      message,
      lessonId: resultId
    };
    
  } catch (error: any) {
    console.error("Erro ao salvar aula:", error);
    return {
      success: false,
      message: error.message || "Erro ao salvar aula."
    };
  }
}

// Função auxiliar para calcular o tempo total dos vídeos em minutos
function calculateTotalDuration(videos: any[]): number {
  if (!videos || videos.length === 0) return 0;
  
  let totalDuration = 0;
  for (const video of videos) {
    if (video.duration_seconds) {
      totalDuration += video.duration_seconds;
    }
  }
  
  // Converter segundos para minutos e arredondar para cima
  return Math.ceil(totalDuration / 60);
}
