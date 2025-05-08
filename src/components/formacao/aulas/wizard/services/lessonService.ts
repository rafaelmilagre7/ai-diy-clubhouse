
import { supabase } from "@/lib/supabase";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { saveVideos, calculateTotalDuration } from "./videoService";
import { saveResources } from "./resourceService";

export interface SaveLessonResult {
  success: boolean;
  lessonId?: string;
  message?: string;
  error?: any;
}

export const saveLesson = async (
  values: AulaFormValues,
  lessonId?: string,
  setCurrentSaveStep?: (step: string) => void
): Promise<SaveLessonResult> => {
  try {
    if (setCurrentSaveStep) setCurrentSaveStep("Iniciando salvamento...");
    console.log("Iniciando processo de salvamento da aula");
    
    // Calcular o tempo estimado com base nos vídeos
    const totalDurationMinutes = calculateTotalDuration(values.videos);
    console.log("Tempo total calculado dos vídeos (minutos):", totalDurationMinutes);
    
    // Preparar os dados da aula
    const lessonData = {
      title: values.title,
      description: values.description || null,
      module_id: values.moduleId,
      cover_image_url: values.coverImageUrl || null,
      estimated_time_minutes: totalDurationMinutes,
      ai_assistant_enabled: values.aiAssistantEnabled,
      ai_assistant_id: values.aiAssistantId || null,
      published: values.published,
      difficulty_level: values.difficultyLevel
    };
    
    console.log("Dados completos a serem salvos:", lessonData);
    if (setCurrentSaveStep) setCurrentSaveStep("Salvando dados básicos da aula...");
    
    let newLessonId = lessonId;
    
    if (lessonId) {
      // Atualizar aula existente
      console.log(`Atualizando aula existente (ID: ${lessonId})...`);
      const { data, error } = await supabase
        .from("learning_lessons")
        .update(lessonData)
        .eq("id", lessonId)
        .select();
        
      if (error) {
        console.error("Erro ao atualizar aula:", error);
        return {
          success: false,
          error: error,
          message: `Erro ao atualizar aula: ${error.message}`
        };
      }
      
      console.log("Aula atualizada com sucesso!", data);
    } else {
      // Criar nova aula
      console.log("Criando nova aula...");
      const { data, error } = await supabase
        .from("learning_lessons")
        .insert([lessonData])
        .select("*")
        .single();
        
      if (error) {
        console.error("Erro ao criar aula:", error);
        return {
          success: false,
          error: error,
          message: `Erro ao criar aula: ${error.message}`
        };
      }
      
      newLessonId = data.id;
      console.log("Aula criada com sucesso:", data);
    }
    
    if (!newLessonId) {
      return {
        success: false,
        message: "ID da aula não encontrado após salvamento"
      };
    }
    
    // Salvar vídeos
    if (setCurrentSaveStep) setCurrentSaveStep("Processando vídeos...");
    const videoResult = await saveVideos(newLessonId, values.videos || []);
    
    // Salvar recursos (materiais)
    if (setCurrentSaveStep) setCurrentSaveStep("Processando materiais...");
    const materiaisResult = await saveResources(newLessonId, values.resources || []);
    
    if (!videoResult.success || !materiaisResult.success) {
      return {
        success: true, // A aula foi salva, então consideramos sucesso parcial
        lessonId: newLessonId,
        message: `Aula salva, mas houve problemas: ${
          !videoResult.success ? videoResult.message : ""
        } ${!materiaisResult.success ? materiaisResult.message : ""}`
      };
    }
    
    return {
      success: true,
      lessonId: newLessonId,
      message: lessonId ? "Aula atualizada com sucesso!" : "Aula criada com sucesso!"
    };
  } catch (error: any) {
    console.error("Erro ao salvar aula:", error);
    return {
      success: false,
      error: error,
      message: `Erro ao salvar aula: ${error.message || "Ocorreu um erro ao tentar salvar."}`
    };
  }
};
