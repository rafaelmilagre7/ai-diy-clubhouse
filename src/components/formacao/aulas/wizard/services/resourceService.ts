
import { supabase } from "@/lib/supabase";

interface ResourceFormValues {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export async function fetchLessonResources(lessonId: string): Promise<ResourceFormValues[]> {
  try {
    const { data, error } = await supabase
      .from("learning_resources")
      .select("*")
      .eq("lesson_id", lessonId as any)
      .order("order_index", { ascending: true });
      
    if (error) {
      console.error("Erro ao buscar recursos:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map((resource: any) => ({
      id: resource.id,
      title: resource.name,
      description: resource.description || "",
      url: resource.file_url,
      type: resource.file_type || "document",
      fileName: resource.name,
      fileSize: resource.file_size_bytes || undefined
    }));
  } catch (error) {
    console.error("Erro ao buscar recursos da aula:", error);
    return [];
  }
}

export async function saveResourcesForLesson(lessonId: string, resources: ResourceFormValues[]): Promise<boolean> {
  try {
    console.log("Salvando recursos para a aula:", lessonId);
    
    if (!resources || resources.length === 0) {
      console.log("Nenhum recurso para salvar.");
      return true;
    }
    
    // Primeiro, remover todos os recursos existentes
    const { error: deleteError } = await supabase
      .from('learning_resources')
      .delete()
      .eq('lesson_id', lessonId as any);
    
    if (deleteError) {
      console.error("Erro ao remover recursos existentes:", deleteError);
      return false;
    }
    
    // Para cada recurso no formulário
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      // Se o recurso não tiver URL, pular
      if (!resource.url) {
        console.log("Recurso sem URL encontrado, pulando...");
        continue;
      }
      
      const resourceData = {
        lesson_id: lessonId,
        name: resource.title || "Recurso sem título",
        description: resource.description || null,
        file_url: resource.url,
        file_type: resource.type || "document",
        order_index: i,
        file_size_bytes: resource.fileSize || null
      };
      
      // Inserir novo recurso
      const { error } = await supabase
        .from('learning_resources')
        .insert([resourceData as any]);
        
      if (error) {
        console.error(`Erro ao criar recurso ${i + 1}:`, error);
        return false;
      }
    }
    
    console.log("Todos os recursos foram salvos com sucesso.");
    return true;
  } catch (error) {
    console.error("Erro ao salvar recursos:", error);
    return false;
  }
}
