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
      
      return (
        !title || 
        title === 'undefined' || 
        title === 'null' ||
        title.length < 10 ||
        /^[A-Z][a-z]*(\s[A-Z][a-z]*){0,3}\..*$/.test(title) // Padrão: "Palavra Palavra. Resto"
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
        // Criar título profissional baseado na ideia original
        const idea = solution.original_idea || '';
        const firstSentence = idea.split(/[.!?]/)[0].trim();
        const cleanedIdea = firstSentence
          .substring(0, 80)
          .replace(/^(eu\s+quero|quero|preciso|gostaria)\s+/gi, '')
          .trim();
        
        // Capitalizar primeira letra
        const newTitle = cleanedIdea.charAt(0).toUpperCase() + cleanedIdea.slice(1);
        
        // Truncar se necessário
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
