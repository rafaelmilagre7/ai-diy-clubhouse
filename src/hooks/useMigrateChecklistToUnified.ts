import { useState, useEffect } from "react";
import { useCreateUnifiedChecklistTemplate } from "@/hooks/useUnifiedChecklists";
import { fetchLegacyChecklist } from "@/lib/checklistMigration";
import { useAuth } from "@/contexts/auth";

interface MigrationResult {
  isLoading: boolean;
  isMigrated: boolean;
  error: Error | null;
  itemsCount: number;
}

/**
 * Hook para migração automática de checklists legados para o sistema unificado
 * 
 * Busca checklist antigo em:
 * 1. implementation_checkpoints
 * 2. solutions.checklist_items
 * 
 * Se encontrar dados legados e NÃO existir template unificado,
 * cria automaticamente o template no novo sistema.
 */
export const useMigrateChecklistToUnified = (
  solutionId: string | null,
  hasTemplate: boolean // Se já existe template, não migra
): MigrationResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrated, setIsMigrated] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [itemsCount, setItemsCount] = useState(0);
  
  const { user } = useAuth();
  const createTemplateMutation = useCreateUnifiedChecklistTemplate();

  useEffect(() => {
    // Se já tem template ou não tem solutionId ou não tem user, não faz nada
    if (hasTemplate || !solutionId || !user) {
      return;
    }

    const migrateChecklist = async () => {
      console.log('🚀 Iniciando migração automática de checklist...', { solutionId });
      setIsLoading(true);
      setError(null);

      try {
        // Buscar checklist legado
        const legacyItems = await fetchLegacyChecklist(solutionId);
        
        if (legacyItems.length === 0) {
          console.log('📭 Nenhum checklist legado encontrado para migrar');
          setIsLoading(false);
          return;
        }

        console.log('📦 Checklist legado encontrado, iniciando migração...', {
          itemsCount: legacyItems.length
        });

        // Criar template no sistema unificado
        await createTemplateMutation.mutateAsync({
          solutionId,
          checklistData: {
            items: legacyItems,
            metadata: {
              version: "1.0",
              migratedFrom: "legacy",
              migratedAt: new Date().toISOString(),
              migratedBy: user.id
            }
          },
          checklistType: 'implementation'
        });

        console.log('✅ Migração concluída com sucesso!', {
          itemsCount: legacyItems.length
        });

        setItemsCount(legacyItems.length);
        setIsMigrated(true);
        
      } catch (err) {
        console.error('❌ Erro durante migração:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    migrateChecklist();
  }, [solutionId, hasTemplate, user]);

  return {
    isLoading,
    isMigrated,
    error,
    itemsCount
  };
};
