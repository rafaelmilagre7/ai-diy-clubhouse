
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export const fixToolsData = async () => {
  const { log, logError } = useLogging();
  
  try {
    log("Iniciando correção de dados das ferramentas...");
    
    // Ferramentas para garantir que existem e têm informações corretas
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
    
    for (const tool of toolsToFix) {
      // Verificar se a ferramenta já existe
      const { data: existingTool, error: findError } = await supabase
        .from('tools')
        .select('id, logo_url')
        .ilike('name', tool.name)
        .single();
      
      if (findError && findError.code !== 'PGRST116') {
        logError(`Erro ao verificar existência da ferramenta ${tool.name}`, findError);
        continue;
      }
      
      if (existingTool) {
        // Atualizar a ferramenta existente apenas se não tiver logo
        if (!existingTool.logo_url) {
          const { error: updateError } = await supabase
            .from('tools')
            .update({
              description: tool.description,
              official_url: tool.official_url,
              category: tool.category,
              logo_url: tool.logo_url
            })
            .eq('id', existingTool.id);
            
          if (updateError) {
            logError(`Erro ao atualizar ferramenta ${tool.name}`, updateError);
          } else {
            log(`Ferramenta ${tool.name} atualizada com sucesso`);
          }
        }
      } else {
        // Inserir a nova ferramenta
        const { error: insertError } = await supabase
          .from('tools')
          .insert(tool);
          
        if (insertError) {
          logError(`Erro ao inserir ferramenta ${tool.name}`, insertError);
        } else {
          log(`Ferramenta ${tool.name} inserida com sucesso`);
        }
      }
    }
    
    log("Correção de dados das ferramentas concluída");
    return true;
  } catch (error) {
    logError("Erro durante a correção de dados das ferramentas", error);
    return false;
  }
};
