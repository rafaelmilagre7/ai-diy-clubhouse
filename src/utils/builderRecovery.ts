import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Recuperar soluções com título undefined e corrigir
 */
export async function recoverBrokenSolutions(userId: string) {
  const { data: brokenSolutions, error } = await supabase
    .from('ai_generated_solutions')
    .select('id, original_idea, title')
    .eq('user_id', userId)
    .or('title.is.null,title.eq.undefined');
  
  if (error) {
    console.error('[RECOVERY] Erro ao buscar soluções:', error);
    return;
  }
  
  if (!brokenSolutions || brokenSolutions.length === 0) {
    return;
  }
  
  console.log(`[RECOVERY] Encontradas ${brokenSolutions.length} soluções com título quebrado`);
  
  // Corrigir cada uma
  for (const solution of brokenSolutions) {
    const fallbackTitle = `Solução: ${solution.original_idea.substring(0, 50)}...`;
    
    await supabase
      .from('ai_generated_solutions')
      .update({ title: fallbackTitle })
      .eq('id', solution.id);
    
    console.log(`[RECOVERY] Corrigido: ${solution.id}`);
  }
  
  toast.success(`${brokenSolutions.length} solução(ões) recuperada(s)!`);
}
