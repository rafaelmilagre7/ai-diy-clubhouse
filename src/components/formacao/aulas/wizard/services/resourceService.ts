
import { supabase } from "@/lib/supabase";

export interface ResourceFormValues {
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
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });
      
    if (error) {
      console.error("Erro ao buscar materiais:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(resource => ({
      id: resource.id,
      title: resource.name,
      description: resource.description || "",
      url: resource.file_url,
      type: resource.file_type || "document",
      fileSize: resource.file_size_bytes || undefined
    }));
  } catch (error) {
    console.error("Erro ao buscar materiais da aula:", error);
    return [];
  }
}

export async function saveResourcesForLesson(lessonId: string, resources: ResourceFormValues[]): Promise<boolean> {
  try {
    if (!resources || resources.length === 0) {
      return true;
    }
    
    // Primeiro, remover todos os recursos existentes
    const { error: deleteError } = await supabase
      .from('learning_resources')
      .delete()
      .eq('lesson_id', lessonId);
    
    if (deleteError) {
      console.error("Erro ao remover materiais existentes:", deleteError);
      return false;
    }
    
    // Para cada material no formulário
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      // Se o material não tiver URL, pular
      if (!resource.url) {
        continue;
      }
      
      const resourceData = {
        lesson_id: lessonId,
        name: resource.title || "Material sem título",
        description: resource.description || null,
        file_url: resource.url,
        order_index: i,
        file_type: resource.type || "document",
        file_size_bytes: resource.fileSize || null
      };
      
      // Inserir novo material
      const { error } = await supabase
        .from('learning_resources')
        .insert([resourceData]);
        
      if (error) {
        console.error(`Erro ao criar material ${i + 1}:`, error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar materiais:", error);
    return false;
  }
}
