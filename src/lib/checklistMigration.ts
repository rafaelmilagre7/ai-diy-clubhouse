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

/**
 * Busca checklist legado de implementation_checkpoints
 */
export const fetchLegacyCheckpoints = async (solutionId: string): Promise<UnifiedChecklistItem[]> => {
  console.log('🔍 Buscando checklist legado em implementation_checkpoints...', { solutionId });
  
  try {
    const { data, error } = await supabase
      .from('implementation_checkpoints')
      .select('checkpoint_data')
      .eq('solution_id', solutionId)
      .limit(1)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar implementation_checkpoints:', error);
      return [];
    }
    
    if (data?.checkpoint_data?.items) {
      console.log('✅ Encontrado checklist em implementation_checkpoints:', {
        itemsCount: data.checkpoint_data.items.length
      });
      return convertLegacyChecklistToUnified(data.checkpoint_data.items);
    }
    
    console.log('📭 Nenhum checkpoint encontrado em implementation_checkpoints');
    return [];
  } catch (err) {
    console.error('❌ Erro ao buscar implementation_checkpoints:', err);
    return [];
  }
};

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
 * Busca checklist legado de todas as fontes possíveis
 * e retorna o primeiro que encontrar
 */
export const fetchLegacyChecklist = async (solutionId: string): Promise<UnifiedChecklistItem[]> => {
  console.log('🔎 Iniciando busca de checklist legado...', { solutionId });
  
  // Tentar implementation_checkpoints primeiro
  const checkpointsItems = await fetchLegacyCheckpoints(solutionId);
  if (checkpointsItems.length > 0) {
    console.log('✅ Checklist legado encontrado em implementation_checkpoints');
    return checkpointsItems;
  }
  
  // Tentar solutions.checklist_items
  const solutionItems = await fetchLegacyChecklistItems(solutionId);
  if (solutionItems.length > 0) {
    console.log('✅ Checklist legado encontrado em solutions.checklist_items');
    return solutionItems;
  }
  
  console.log('📭 Nenhum checklist legado encontrado');
  return [];
};
