
import { supabase } from "@/lib/supabase";

export const fixToolsData = async () => {
  try {
    console.log("Iniciando correção de dados das ferramentas...");
    
    // Passo 1: Ferramentas para garantir que existem e têm informações corretas
    const toolsToFix = [
      {
        name: "Claude",
        description: "Assistente de IA da Anthropic com foco em diálogos seguros e úteis",
        official_url: "https://claude.ai/",
        category: "Modelos de IA e Interfaces",
        logo_url: "https://i.ibb.co/wBfQjVH/claude-logo.png",
        status: true
      },
      {
        name: "API da Anthropic",
        description: "Plataforma para desenvolvedores integrarem os modelos Claude em aplicações",
        official_url: "https://console.anthropic.com/dashboard",
        category: "Desenvolvimento e Código",
        logo_url: "https://i.ibb.co/6BDyxhP/anthropic-logo.png",
        status: true
      },
      {
        name: "WordPress",
        description: "Sistema de gerenciamento de conteúdo para criação de sites e blogs",
        official_url: "https://wordpress.com/",
        category: "Gestão de Documentos e Conteúdo",
        logo_url: "https://i.ibb.co/LxQfhWB/wordpress-logo.png",
        status: true
      }
    ];
    
    // Passo 2: Verificar duplicatas e removê-las
    await removeDuplicateTools();
    
    // Passo 3: Garantir que as ferramentas necessárias existam
    for (const tool of toolsToFix) {
      // Verificar se a ferramenta já existe
      const { data: existingTool, error: findError } = await supabase
        .from('tools')
        .select('id, logo_url')
        .ilike('name', tool.name)
        .limit(1);
      
      if (findError) {
        console.error(`Erro ao verificar existência da ferramenta ${tool.name}`, findError);
        continue;
      }
      
      if (existingTool && existingTool.length > 0) {
        // Atualizar a ferramenta existente apenas se não tiver logo
        if (!existingTool[0].logo_url) {
          const { error: updateError } = await supabase
            .from('tools')
            .update({
              description: tool.description,
              official_url: tool.official_url,
              category: tool.category,
              logo_url: tool.logo_url
            })
            .eq('id', existingTool[0].id);
            
          if (updateError) {
            console.error(`Erro ao atualizar ferramenta ${tool.name}`, updateError);
          } else {
            console.log(`Ferramenta ${tool.name} atualizada com sucesso`);
          }
        }
      } else {
        // Inserir a nova ferramenta
        const { error: insertError } = await supabase
          .from('tools')
          .insert(tool);
          
        if (insertError) {
          console.error(`Erro ao inserir ferramenta ${tool.name}`, insertError);
        } else {
          console.log(`Ferramenta ${tool.name} inserida com sucesso`);
        }
      }
    }
    
    console.log("Correção de dados das ferramentas concluída");
    return true;
  } catch (error) {
    console.error("Erro durante a correção de dados das ferramentas", error);
    return false;
  }
};

// Função auxiliar para remover duplicatas baseadas no nome da ferramenta
async function removeDuplicateTools() {
  try {
    console.log("Verificando ferramentas duplicadas...");
    
    // Buscar todas as ferramentas agrupadas por nome para encontrar duplicatas
    const { data: duplicates, error: findError } = await supabase
      .from('tools')
      .select('name, count(*)')
      .group('name')
      .having('count(*) > 1');
    
    if (findError) {
      console.error("Erro ao verificar duplicatas:", findError);
      return;
    }
    
    if (!duplicates || duplicates.length === 0) {
      console.log("Nenhuma ferramenta duplicada encontrada");
      return;
    }
    
    console.log(`Encontradas ${duplicates.length} ferramentas com duplicatas`);
    
    // Para cada nome com duplicatas, manter apenas o registro mais recente
    for (const duplicate of duplicates) {
      const toolName = duplicate.name;
      
      // Buscar todos os IDs dessa ferramenta, ordenados por data de criação
      const { data: entries, error: entriesError } = await supabase
        .from('tools')
        .select('id, created_at')
        .eq('name', toolName)
        .order('created_at', { ascending: false });
      
      if (entriesError || !entries || entries.length <= 1) {
        console.error(`Erro ao buscar duplicatas para ${toolName}:`, entriesError);
        continue;
      }
      
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
