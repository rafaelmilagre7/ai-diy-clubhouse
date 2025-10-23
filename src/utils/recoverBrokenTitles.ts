import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Recupera soluções com títulos quebrados no banco de dados
 * Títulos considerados "quebrados":
 * - undefined, null, vazio
 * - Menor que 10 caracteres
 * - Padrão de palavras isoladas (ex: "Inteligência Artificial Crm. Quero")
 */
export async function recoverBrokenTitles(userId: string): Promise<number> {
  try {
    console.log('[RECOVERY] 🔍 Buscando soluções com títulos quebrados...');

    // Buscar todas as soluções do usuário
    const { data: allSolutions, error: fetchError } = await supabase
      .from('ai_generated_solutions')
      .select('id, title, original_idea')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('[RECOVERY] ❌ Erro ao buscar soluções:', fetchError);
      return 0;
    }

    if (!allSolutions || allSolutions.length === 0) {
      console.log('[RECOVERY] ℹ️ Nenhuma solução encontrada para este usuário');
      return 0;
    }

    // Filtrar soluções com título quebrado
    const brokenSolutions = allSolutions.filter(solution => {
      const title = solution.title ? String(solution.title).trim() : '';
      const idea = solution.original_idea ? String(solution.original_idea).toLowerCase().trim() : '';
      const ideaStart = idea.substring(0, 50);
      const titleLower = title.toLowerCase();
      
      // Detectar cópia literal da ideia
      const isLiteralCopy = titleLower.startsWith(ideaStart.substring(0, 30));
      
      // Detectar verbos proibidos
      const startsWithForbiddenVerb = /^(implementar|criar|fazer|quero|preciso|gostaria|desenvolver)/i.test(title);
      
      // Detectar truncamento no meio de palavra
      const endsWithIncompleteWord = title.length > 40 && !title.match(/[\s\-][\w]{3,}$/);
      
      return (
        !title || 
        title === 'undefined' || 
        title === 'null' ||
        title.length < 10 ||
        /^[A-Z][a-z]*(\s[A-Z][a-z]*){0,3}\..*$/.test(title) || // Padrão: "Palavra Palavra. Resto"
        isLiteralCopy ||
        startsWithForbiddenVerb ||
        endsWithIncompleteWord
      );
    });

    if (brokenSolutions.length === 0) {
      console.log('[RECOVERY] ✅ Nenhuma solução com título quebrado encontrada');
      return 0;
    }

    console.log(`[RECOVERY] 📋 Encontradas ${brokenSolutions.length} solução(ões) com título quebrado`);

    // Corrigir cada solução
    let correctedCount = 0;
    for (const solution of brokenSolutions) {
      try {
        // 🧠 FALLBACK INTELIGENTE: Extrair palavras-chave e sintetizar
        const idea = solution.original_idea || '';
        
        // Remover palavras comuns (stopwords)
        const stopwords = ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 
                           'para', 'com', 'por', 'que', 'e', 'um', 'uma', 'eu', 'meu', 'minha',
                           'quero', 'preciso', 'gostaria', 'criar', 'fazer', 'implementar', 'desenvolver'];
        
        // Extrair palavras significativas
        const words = idea
          .toLowerCase()
          .replace(/[^\w\sáéíóúâêôãõç]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3 && !stopwords.includes(w));
        
        // Identificar tecnologias/palavras-chave importantes
        const techKeywords = ['whatsapp', 'crm', 'email', 'chatbot', 'dashboard', 'ia', 'inteligencia', 'artificial',
                             'automatico', 'automacao', 'sistema', 'relatorio', 'notificacao', 'analise', 'dados',
                             'lead', 'cliente', 'atendimento', 'vendas', 'estoque', 'pedido'];
        
        const foundTech = words.filter(w => techKeywords.some(tk => w.includes(tk) || tk.includes(w)));
        const mainWords = foundTech.length > 0 ? foundTech.slice(0, 3) : words.slice(0, 3);
        
        // Construir título profissional
        let newTitle = '';
        
        if (mainWords.length >= 2) {
          // Capitalizar palavras
          const capitalizedWords = mainWords.map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          );
          
          // Formato: "Sistema de [palavra1] + [palavra2]"
          newTitle = `Sistema de ${capitalizedWords[0]}`;
          if (capitalizedWords[1]) {
            newTitle += ` + ${capitalizedWords[1]}`;
          }
        } else if (mainWords.length === 1) {
          // Apenas uma palavra-chave
          const word = mainWords[0].charAt(0).toUpperCase() + mainWords[0].slice(1);
          newTitle = `Sistema de ${word}`;
        } else {
          // Fallback: extrair primeira frase e limpar
          const firstSentence = idea.split(/[.!?]/)[0].trim();
          newTitle = firstSentence
            .substring(0, 60)
            .replace(/^(eu\s+quero|quero|preciso|gostaria|implementar|criar|fazer)\s+/gi, '')
            .trim();
          
          if (newTitle.length > 10) {
            newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
          } else {
            // Último recurso: ID único
            newTitle = `Solução de Automação ${solution.id.substring(0, 6).toUpperCase()}`;
          }
        }
        
        // Limitar a 80 caracteres
        const finalTitle = newTitle.length > 80 
          ? newTitle.substring(0, 77) + '...'
          : newTitle;

        // Atualizar no banco
        const { error: updateError } = await supabase
          .from('ai_generated_solutions')
          .update({ title: finalTitle })
          .eq('id', solution.id);

        if (updateError) {
          console.error(`[RECOVERY] ❌ Erro ao atualizar solução ${solution.id}:`, updateError);
        } else {
          console.log(`[RECOVERY] ✅ Corrigido: "${solution.title}" → "${finalTitle}"`);
          correctedCount++;
        }
      } catch (error) {
        console.error(`[RECOVERY] ❌ Erro ao processar solução ${solution.id}:`, error);
      }
    }

    if (correctedCount > 0) {
      toast.success(`${correctedCount} título(s) recuperado(s) com sucesso!`);
    }

    return correctedCount;
  } catch (error) {
    console.error('[RECOVERY] ❌ Erro geral:', error);
    toast.error('Erro ao recuperar títulos quebrados');
    return 0;
  }
}

/**
 * Hook para executar recuperação automática ao carregar a lista de soluções
 * Pode ser chamado uma vez por sessão do usuário
 */
export async function autoRecoverOnLoad(userId: string): Promise<void> {
  // Verificar se já rodou nesta sessão
  const hasRun = sessionStorage.getItem('title-recovery-run');
  if (hasRun) {
    return;
  }

  const count = await recoverBrokenTitles(userId);
  
  if (count > 0) {
    console.log(`[RECOVERY] ✅ Auto-recuperação executada: ${count} título(s) corrigido(s)`);
  }

  // Marcar como executado nesta sessão
  sessionStorage.setItem('title-recovery-run', 'true');
}
