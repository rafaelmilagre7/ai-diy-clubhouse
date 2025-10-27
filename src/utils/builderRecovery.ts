import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Validar se um título é válido
 */
export function isValidTitle(title: string, originalIdea: string): boolean {
  const invalidTitles = [undefined, null, 'undefined', 'null', ''];
  const titleString = title ? String(title).trim() : '';
  
  // Detectar cópias literais da ideia (primeiros 30 chars)
  const ideaStart = originalIdea.substring(0, 30).toLowerCase().trim();
  const titleLower = titleString.toLowerCase();
  const isLiteralCopy = titleLower.startsWith(ideaStart.substring(0, 20));
  
  // Detectar títulos que começam com verbos de ação proibidos
  const startsWithForbiddenVerb = /^(implementar|criar|fazer|quero|preciso|gostaria|desenvolver)/i.test(titleString);
  
  // Detectar título truncado no meio de palavra
  const endsWithIncompleteWord = titleString.length > 40 && !titleString.match(/[\s\-][\w]{3,}$/);
  
  const titleIsInvalid = 
    invalidTitles.includes(title as any) || 
    titleString === '' ||
    titleString.length < 20 || // Mínimo 20 chars
    titleString.length > 60 || // Máximo 60 chars
    isLiteralCopy ||
    startsWithForbiddenVerb ||
    endsWithIncompleteWord;
  
  return !titleIsInvalid;
}

/**
 * Gerar título inteligente a partir da ideia original
 */
export function generateSmartTitle(idea: string): string {
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
                       'lead', 'cliente', 'atendimento', 'vendas', 'estoque', 'pedido', 'resumo'];
  
  const foundTech = words.filter(w => techKeywords.some(tk => w.includes(tk) || tk.includes(w)));
  const mainWords = foundTech.length > 0 ? foundTech.slice(0, 3) : words.slice(0, 3);
  
  // Construir título profissional
  if (mainWords.length >= 2) {
    const capitalizedWords = mainWords.map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    );
    
    return `Sistema de ${capitalizedWords[0]} + ${capitalizedWords[1]}`;
  }
  
  // Fallback genérico
  return `Solução de Automação Inteligente`;
}

/**
 * Recuperar soluções com título undefined ou inválido e corrigir
 */
export async function recoverBrokenSolutions(userId: string) {
  const { data: solutions, error } = await supabase
    .from('ai_generated_solutions')
    .select('id, original_idea, title')
    .eq('user_id', userId);
  
  if (error) {
    console.error('[RECOVERY] Erro ao buscar soluções:', error);
    return;
  }
  
  if (!solutions || solutions.length === 0) {
    return;
  }
  
  // Filtrar soluções com título inválido
  const brokenSolutions = solutions.filter(s => !isValidTitle(s.title, s.original_idea));
  
  if (brokenSolutions.length === 0) {
    console.log('[RECOVERY] Nenhuma solução com título quebrado encontrada');
    return;
  }
  
  console.log(`[RECOVERY] Encontradas ${brokenSolutions.length} soluções com título quebrado`);
  
  // Corrigir cada uma
  for (const solution of brokenSolutions) {
    const smartTitle = generateSmartTitle(solution.original_idea);
    
    await supabase
      .from('ai_generated_solutions')
      .update({ title: smartTitle })
      .eq('id', solution.id);
    
    console.log(`[RECOVERY] Corrigido: ${solution.id} -> "${smartTitle}"`);
  }
  
  toast.success(`${brokenSolutions.length} solução(ões) recuperada(s)!`);
}
