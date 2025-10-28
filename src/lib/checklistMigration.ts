import { supabase } from "@/integrations/supabase/client";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";

// Interface para checkpoint legado
interface LegacyCheckpoint {
  id?: string;
  title?: string;
  text?: string;
  description?: string;
  completed?: boolean;
  [key: string]: any;
}

// Interface para checklist_items legado da solução
interface LegacyChecklistItem {
  id?: string;
  title?: string;
  text?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Converte items do formato legado (implementation_checkpoints ou checklist_items)
 * para o formato unificado (UnifiedChecklistItem[])
 */
export const convertLegacyChecklistToUnified = (
  legacyItems: (LegacyCheckpoint | LegacyChecklistItem)[]
): UnifiedChecklistItem[] => {
  if (!Array.isArray(legacyItems)) return [];
  
  return legacyItems.map((item, index) => ({
    id: item.id || `migrated-${Date.now()}-${index}`,
    title: item.title || item.text || `Item ${index + 1}`,
    description: item.description || '',
    completed: false,
    column: 'todo',
    order: index,
    notes: ''
  }));
};

// implementation_checkpoints table does not exist - removed

/**
 * Busca checklist_items da tabela solutions
 */
export const fetchLegacyChecklistItems = async (solutionId: string): Promise<UnifiedChecklistItem[]> => {
  console.log('🔍 Buscando checklist legado em solutions.checklist_items...', { solutionId });
  
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('checklist_items')
      .eq('id', solutionId)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar checklist_items:', error);
      return [];
    }
    
    const checklistItems = (data as any)?.checklist_items;
    
    if (checklistItems && Array.isArray(checklistItems) && checklistItems.length > 0) {
      console.log('✅ Encontrado checklist em solutions.checklist_items:', {
        itemsCount: checklistItems.length
      });
      return convertLegacyChecklistToUnified(checklistItems);
    }
    
    console.log('📭 Nenhum checklist_items encontrado em solutions');
    return [];
  } catch (err) {
    console.error('❌ Erro ao buscar checklist_items:', err);
    return [];
  }
};

/**
 * Busca checklist legado de solutions.checklist_items
 * (implementation_checkpoints não existe no banco)
 */
export const fetchLegacyChecklist = async (solutionId: string): Promise<UnifiedChecklistItem[]> => {
  console.log('🔎 Buscando checklist legado em solutions.checklist_items...', { solutionId });
  
  const solutionItems = await fetchLegacyChecklistItems(solutionId);
  if (solutionItems.length > 0) {
    console.log('✅ Checklist legado encontrado em solutions.checklist_items');
    return solutionItems;
  }
  
  console.log('📭 Nenhum checklist legado encontrado');
  return [];
};
