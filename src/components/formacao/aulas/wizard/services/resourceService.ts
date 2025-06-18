
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
    console.log("Buscando materiais para aula:", lessonId);
    
    const { data, error } = await supabase
      .from("learning_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });
      
    if (error) {
      console.error("Erro ao buscar materiais:", error);
      throw new Error(`Erro ao buscar materiais: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log("Nenhum material encontrado para a aula");
      return [];
    }
    
    console.log(`${data.length} materiais encontrados`);
    
    return data.map(resource => ({
      id: resource.id,
      title: resource.name,
      description: resource.description || "",
      url: resource.file_url,
      type: resource.file_type || "document",
      fileName: resource.name,
      fileSize: resource.file_size_bytes || undefined
    }));
  } catch (error) {
    console.error("Erro ao buscar materiais da aula:", error);
    throw error;
  }
}

export async function saveResourcesForLesson(lessonId: string, resources: ResourceFormValues[]): Promise<boolean> {
  try {
    console.log("Salvando materiais para a aula:", lessonId, "Total:", resources.length);
    
    // Validar se lessonId é válido
    if (!lessonId || lessonId.trim() === '') {
      throw new Error("ID da aula é obrigatório");
    }
    
    // Filtrar apenas recursos válidos (com URL e título)
    const validResources = resources.filter(resource => {
      if (!resource.url || !resource.title) {
        console.warn("Material inválido encontrado:", resource);
        return false;
      }
      return true;
    });
    
    console.log(`${validResources.length} materiais válidos de ${resources.length} total`);
    
    if (validResources.length === 0) {
      console.log("Nenhum material válido para salvar, removendo materiais existentes");
      
      // Remover materiais existentes se não há materiais válidos
      const { error: deleteError } = await supabase
        .from('learning_resources')
        .delete()
        .eq('lesson_id', lessonId);
      
      if (deleteError) {
        console.error("Erro ao remover materiais existentes:", deleteError);
        throw new Error(`Erro ao limpar materiais: ${deleteError.message}`);
      }
      
      return true;
    }
    
    // Transação: remover recursos existentes e inserir novos
    const { error: deleteError } = await supabase
      .from('learning_resources')
      .delete()
      .eq('lesson_id', lessonId);
    
    if (deleteError) {
      console.error("Erro ao remover materiais existentes:", deleteError);
      throw new Error(`Erro ao limpar materiais existentes: ${deleteError.message}`);
    }
    
    // Preparar dados para inserção
    const resourcesData = validResources.map((resource, index) => ({
      lesson_id: lessonId,
      name: resource.title!.trim(),
      description: resource.description?.trim() || null,
      file_url: resource.url!,
      order_index: index,
      file_type: resource.type || "document",
      file_size_bytes: resource.fileSize || null
    }));
    
    console.log("Inserindo materiais:", resourcesData);
    
    // Inserir novos materiais
    const { error: insertError } = await supabase
      .from('learning_resources')
      .insert(resourcesData);
      
    if (insertError) {
      console.error("Erro ao inserir materiais:", insertError);
      throw new Error(`Erro ao salvar materiais: ${insertError.message}`);
    }
    
    console.log("Materiais salvos com sucesso!");
    return true;
    
  } catch (error) {
    console.error("Erro ao salvar materiais:", error);
    throw error;
  }
}

// Função auxiliar para validar um recurso individual
export function validateResource(resource: ResourceFormValues): { isValid: boolean; error?: string } {
  if (!resource.title || resource.title.trim() === '') {
    return { isValid: false, error: "Título é obrigatório" };
  }
  
  if (!resource.url || resource.url.trim() === '') {
    return { isValid: false, error: "Arquivo é obrigatório" };
  }
  
  // Validar URL básica
  try {
    new URL(resource.url);
  } catch {
    return { isValid: false, error: "URL do arquivo inválida" };
  }
  
  return { isValid: true };
}

// Função para verificar se um material existe e está acessível
export async function verifyResourceAccess(resourceUrl: string): Promise<boolean> {
  try {
    // Para URLs do Supabase Storage, não precisamos fazer fetch
    // pois elas são sempre acessíveis se a URL estiver correta
    if (resourceUrl.includes('supabase') && resourceUrl.includes('storage')) {
      return true;
    }
    
    // Para outras URLs, tentar fazer um HEAD request
    const response = await fetch(resourceUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn("Não foi possível verificar acesso ao recurso:", error);
    return true; // Assumir que está acessível em caso de erro
  }
}
