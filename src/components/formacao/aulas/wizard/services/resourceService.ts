
import { supabase } from "@/lib/supabase";

interface ResourceFormValues {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
  order_index?: number;
}

export const fetchLessonResources = async (lessonId: string): Promise<ResourceFormValues[]> => {
  try {
    const { data, error } = await supabase
      .from("learning_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");
        
    if (error) {
      console.error("Erro ao buscar recursos da aula:", error);
      return [];
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
      fileName: resource.file_url.split('/').pop(),
      fileSize: resource.file_size_bytes
    }));
  } catch (error) {
    console.error("Erro ao buscar recursos:", error);
    return [];
  }
};

export const saveResources = async (lessonId: string, resources: ResourceFormValues[]): Promise<{ success: boolean, message: string }> => {
  try {
    if (!resources || resources.length === 0) {
      return { success: true, message: "Nenhum material para salvar" };
    }
    
    console.log("Salvando materiais para a aula:", lessonId);
    console.log("Materiais a salvar:", resources);
    
    // Primeiro removemos todos os recursos existentes desta aula
    console.log("Removendo recursos existentes...");
    const { error: deleteError } = await supabase
      .from('learning_resources')
      .delete()
      .eq('lesson_id', lessonId);
      
    if (deleteError) {
      console.error("Erro ao remover recursos existentes:", deleteError);
      return { 
        success: false, 
        message: `Erro ao remover recursos existentes: ${deleteError.message}`
      };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      if (!resource.url) continue;
      
      const resourceData = {
        lesson_id: lessonId,
        name: resource.title || "Material sem nome",
        description: resource.description || null,
        file_url: resource.url,
        file_type: resource.type || "document",
        order_index: i,
        file_size_bytes: resource.fileSize || null
      };
      
      try {
        // Sempre inserir novos registros
        const { error } = await supabase
          .from('learning_resources')
          .insert([resourceData]);
          
        if (error) {
          console.error(`Erro ao salvar material ${i + 1}:`, error);
          errorCount++;
          continue;
        }
        
        successCount++;
      } catch (err) {
        console.error(`Erro ao salvar material ${i + 1}:`, err);
        errorCount++;
      }
    }
    
    if (errorCount > 0) {
      if (successCount > 0) {
        return { 
          success: true, 
          message: `Nem todos os materiais foram salvos. ${successCount} salvos, ${errorCount} com erro.`
        };
      } else {
        return { 
          success: false, 
          message: "Não foi possível salvar nenhum material."
        };
      }
    }
    
    return { 
      success: true, 
      message: successCount > 0 ? 
        `${successCount} material(is) salvo(s) com sucesso.` : 
        "Nenhum material para salvar."
    };
  } catch (error: any) {
    console.error("Erro ao salvar materiais:", error);
    return { 
      success: false, 
      message: `Erro ao salvar materiais: ${error.message || "Erro desconhecido"}`
    };
  }
};
