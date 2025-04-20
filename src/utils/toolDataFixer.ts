
import { supabase } from "@/lib/supabase";

export const fixToolsData = async () => {
  try {
    console.log("Iniciando limpeza de dados de ferramentas duplicadas...");
    
    // Remover duplicatas de ferramentas
    await removeDuplicateTools();
    
    console.log("Limpeza de dados das ferramentas concluída");
    return true;
  } catch (error) {
    console.error("Erro durante a limpeza de dados das ferramentas", error);
    return false;
  }
};

// Função auxiliar para remover duplicatas baseadas no nome da ferramenta
async function removeDuplicateTools() {
  try {
    console.log("Verificando ferramentas duplicadas...");
    
    // Buscar todas as ferramentas para encontrar duplicatas manualmente
    const { data: allTools, error: fetchError } = await supabase
      .from('tools')
      .select('id, name, created_at');
    
    if (fetchError) {
      console.error("Erro ao buscar ferramentas:", fetchError);
      return;
    }
    
    if (!allTools || allTools.length === 0) {
      console.log("Nenhuma ferramenta encontrada");
      return;
    }
    
    // Identificar nomes duplicados
    const toolsByName = new Map();
    
    allTools.forEach(tool => {
      if (!toolsByName.has(tool.name)) {
        toolsByName.set(tool.name, []);
      }
      toolsByName.get(tool.name).push(tool);
    });
    
    // Identificar quais ferramentas têm duplicatas
    const duplicates = [];
    toolsByName.forEach((tools, name) => {
      if (tools.length > 1) {
        duplicates.push({ name, tools });
      }
    });
    
    if (duplicates.length === 0) {
      console.log("Nenhuma ferramenta duplicada encontrada");
      return;
    }
    
    console.log(`Encontradas ${duplicates.length} ferramentas com duplicatas`);
    
    // Para cada nome com duplicatas, manter apenas o registro mais recente
    for (const duplicate of duplicates) {
      const toolName = duplicate.name;
      const entries = duplicate.tools;
      
      // Ordenar por data de criação (mais recente primeiro)
      entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Manter o primeiro (mais recente) e excluir os demais
      const idsToRemove = entries.slice(1).map(e => e.id);
      
      console.log(`Removendo ${idsToRemove.length} duplicatas para "${toolName}"`);
      
      const { error: deleteError } = await supabase
        .from('tools')
        .delete()
        .in('id', idsToRemove);
      
      if (deleteError) {
        console.error(`Erro ao remover duplicatas de ${toolName}:`, deleteError);
      } else {
        console.log(`Duplicatas de "${toolName}" removidas com sucesso`);
      }
    }
    
    console.log("Processo de remoção de duplicatas concluído");
  } catch (error) {
    console.error("Erro ao remover ferramentas duplicadas:", error);
  }
}
