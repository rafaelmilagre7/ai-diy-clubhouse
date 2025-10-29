import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { ChecklistProgress } from "../content/checklist/ChecklistProgress";
import { KanbanLoading } from "@/components/unified-checklist/kanban/KanbanLoading";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToastModern } from "@/hooks/useToastModern";
import { getChecklistTemplate } from "@/lib/supabase/rpc";
import SimpleKanban from "@/components/unified-checklist/kanban/SimpleKanban";
import { UnifiedChecklistData } from "@/hooks/useUnifiedChecklists";

interface LearningChecklistTabProps {
  solutionId: string;
  onComplete?: () => void;
}

interface ChecklistItemData {
  id: string;
  description: string;
  title?: string;
}

const LearningChecklistTab: React.FC<LearningChecklistTabProps> = ({ 
  solutionId, 
  onComplete 
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastModern();

  const { data: checklistItems, isLoading: loadingChecklist, error: checklistError } = useQuery({
    queryKey: ['learning-checklist-template', solutionId],
    queryFn: async () => {
      const rpcData = await getChecklistTemplate(solutionId, 'implementation');
      
      if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const template = rpcData[0];
        if (template?.checklist_data?.items && Array.isArray(template.checklist_data.items)) {
          return template.checklist_data.items as ChecklistItemData[];
        }
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000, // ✅ 5 minutos - template não muda frequentemente
    gcTime: 10 * 60 * 1000, // ✅ 10 minutos no cache
    refetchOnMount: false, // ✅ NÃO refazer ao montar
    refetchOnWindowFocus: false, // ✅ NÃO refazer ao focar janela
    refetchOnReconnect: false, // ✅ NÃO refazer ao reconectar
  });

  // Buscar checklist pessoal do usuário
  const { data: userChecklist, error: userChecklistError, refetch: refetchUserChecklist } = useQuery({
    queryKey: ['user-checklist', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .eq('is_template', false)
        .maybeSingle();
      
      if (error) throw error;
      
      return data as UnifiedChecklistData | null;
    },
    enabled: !!user?.id && !!checklistItems && checklistItems.length > 0,
    staleTime: 30 * 1000, // ✅ 30 segundos - dados de progresso do usuário
    gcTime: 5 * 60 * 1000, // ✅ 5 minutos no cache
    refetchOnMount: false, // ✅ NÃO refazer toda vez
    refetchOnWindowFocus: false, // ✅ NÃO refazer ao focar
    refetchOnReconnect: false, // ✅ NÃO refazer ao reconectar
  });

  // 🔥 CORREÇÃO: Flag para evitar múltiplas criações do checklist
  const hasCreatedChecklistRef = React.useRef(false);
  
  // 🔥 CORREÇÃO: Hash estável para detectar mudanças reais em checklistItems
  const checklistItemsHashRef = React.useRef<string>('');

  // Criar checklist pessoal se não existir
  useEffect(() => {
    if (!user?.id || !checklistItems || checklistItems.length === 0 || loadingChecklist) {
      return;
    }
    
    if (userChecklist !== null) {
      return; // Já existe checklist - não criar de novo
    }
    
    // 🔥 CORREÇÃO: Verificar se já tentou criar para evitar múltiplas chamadas
    if (hasCreatedChecklistRef.current) {
      console.log('⏭️ [LearningChecklistTab] Checklist já foi criado - pulando');
      return;
    }
    
    // 🔥 CORREÇÃO: Verificar se items REALMENTE mudaram usando hash
    const itemsHash = checklistItems.map(i => i.id).sort().join('|');
    if (checklistItemsHashRef.current === itemsHash && hasCreatedChecklistRef.current) {
      return; // Items não mudaram e já tentamos criar - não fazer nada
    }
    checklistItemsHashRef.current = itemsHash;
    
    const createUserChecklist = async () => {
      console.log('🏗️ [LearningChecklistTab] Criando checklist do usuário...');
      hasCreatedChecklistRef.current = true; // ← MARCAR como "já criado"

      const itemsWithColumns = checklistItems.map(item => ({
        ...item,
        column: 'todo',
        completed: false,
        checked: false,
        notes: ''
      }));
      
      const payload = {
        user_id: user.id,
        solution_id: solutionId,
        checklist_type: 'implementation',
        is_template: false,
        checklist_data: {
          items: itemsWithColumns,
          lastUpdated: new Date().toISOString()
        },
        completed_items: 0,
        total_items: itemsWithColumns.length,
        progress_percentage: 0,
        is_completed: false,
      };

      const { data, error } = await supabase
        .from('unified_checklists')
        .insert(payload)
        .select()
        .single();
      
      if (error) {
        console.error('❌ [LearningChecklistTab] Erro ao criar checklist:', error);
        showError('Erro', `Erro ao criar checklist: ${error.message}`);
        hasCreatedChecklistRef.current = false; // ← RESETAR em caso de erro
      } else {
        console.log('✅ [LearningChecklistTab] Checklist criado com sucesso!');
        // Pequeno delay para garantir que o banco salvou
        setTimeout(() => refetchUserChecklist(), 500);
      }
    };
    
    createUserChecklist();
  }, [user?.id, solutionId, loadingChecklist, userChecklist, checklistItems?.length]);

  // Calcular progresso baseado em items completos
  const completedCount = useMemo(() => {
    if (!userChecklist?.checklist_data?.items) return 0;
    return userChecklist.checklist_data.items.filter(item => item.completed).length;
  }, [userChecklist]);

  // Verificar conclusão total
  useEffect(() => {
    if (!userChecklist?.checklist_data?.items) return;
    
    const allDone = userChecklist.checklist_data.items.every(item => item.completed);
    
    if (allDone && onComplete) {
      onComplete();
      showSuccess("🎉 Parabéns!", "Você completou todas as tarefas!");
    }
  }, [userChecklist, onComplete]);

  if (loadingChecklist) {
    return <KanbanLoading />;
  }

  if (!checklistItems || checklistItems.length === 0) {
    const emptyChecklistData: UnifiedChecklistData = {
      user_id: user?.id || '',
      solution_id: solutionId,
      checklist_type: 'implementation',
      checklist_data: { items: [], lastUpdated: new Date().toISOString() },
      completed_items: 0,
      total_items: 0,
      progress_percentage: 0,
      is_completed: false,
      is_template: false
    };

    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Checklist em branco</h3>
          <p className="text-sm text-muted-foreground">
            Esta solução ainda não possui tarefas configuradas.
            <br />
            Você pode começar a usar assim que o time adicionar as tarefas.
          </p>
        </div>
        
        <SimpleKanban
          checklistItems={[]}
          checklistData={emptyChecklistData}
          solutionId={solutionId}
          checklistType="implementation"
        />
      </div>
    );
  }

  // Mostrar erro se houver
  if (userChecklistError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Checklist</h3>
        <p className="text-muted-foreground mb-4">
          {userChecklistError.message}
        </p>
        <button 
          onClick={() => refetchUserChecklist()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Mostrar loading enquanto cria o checklist pessoal
  if (!userChecklist && user?.id) {
    return <KanbanLoading />;
  }

  // Verificar se o checklist pessoal está vazio (erro de sincronização)
  if (userChecklist && (!userChecklist.checklist_data?.items || userChecklist.checklist_data.items.length === 0)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Checklist Vazio</h3>
        <p className="text-muted-foreground mb-4">
          Seu checklist foi criado, mas está sem itens. Isso pode ser um erro de sincronização.
        </p>
        <button 
          onClick={() => refetchUserChecklist()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recarregar Checklist
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Checklist de Implementação</h3>
        <p className="text-muted-foreground">
          Arraste os cards entre as colunas para organizar suas tarefas.
        </p>
      </div>

      {userChecklist ? (
        <>
          <SimpleKanban
            checklistItems={userChecklist.checklist_data?.items || []}
            checklistData={userChecklist}
            solutionId={solutionId}
            checklistType="implementation"
          />
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Faça login para começar a usar o checklist.
        </div>
      )}
    </div>
  );
};

export default LearningChecklistTab;
