
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseEventAccessControlProps {
  eventId?: string;
}

export const useEventAccessControl = ({ eventId }: UseEventAccessControlProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const isInitializedRef = useRef(false);
  const queryClient = useQueryClient();

  console.log("🎯 [EVENT-ACCESS-CONTROL] Hook initialized", { eventId, selectedRoles: selectedRoles.length });

  // Carregar papéis de acesso existentes
  const { data: accessControlData, isLoading, error } = useQuery({
    queryKey: ['event-access-control', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.log("🎯 [EVENT-ACCESS-CONTROL] No eventId provided");
        return [];
      }
      
      console.log("🎯 [EVENT-ACCESS-CONTROL] Fetching access control for event:", eventId);
      
      const { data, error } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId);
      
      if (error) {
        console.error("❌ [EVENT-ACCESS-CONTROL] Error fetching data:", error);
        throw error;
      }
      
      const roleIds = data?.map(item => item.role_id) || [];
      console.log("✅ [EVENT-ACCESS-CONTROL] Fetched role IDs:", roleIds);
      return roleIds;
    },
    enabled: !!eventId,
    retry: 1,
    staleTime: 30000
  });

  // Memoizar os dados para estabilizar a referência
  const memoizedAccessControlData = useMemo(() => {
    return accessControlData || [];
  }, [accessControlData]);

  // Sincronizar estado local com dados carregados - usando useRef para controlar inicialização
  useEffect(() => {
    if (!isLoading && memoizedAccessControlData && !isInitializedRef.current) {
      console.log("🔄 [EVENT-ACCESS-CONTROL] Initializing selectedRoles with:", memoizedAccessControlData);
      setSelectedRoles(memoizedAccessControlData);
      isInitializedRef.current = true;
    }
  }, [memoizedAccessControlData, isLoading]);

  // Reset initialization flag when eventId changes
  useEffect(() => {
    console.log("🔄 [EVENT-ACCESS-CONTROL] EventId changed, resetting initialization");
    isInitializedRef.current = false;
    setSelectedRoles([]);
  }, [eventId]);

  // Mutation para salvar controle de acesso
  const saveAccessControlMutation = useMutation({
    mutationFn: async ({ eventId, roleIds }: { eventId: string; roleIds: string[] }) => {
      console.log("💾 [EVENT-ACCESS-CONTROL] Starting save operation", { eventId, roleIds });

      // Primeiro, deletar registros existentes
      const { error: deleteError } = await supabase
        .from('event_access_control')
        .delete()
        .eq('event_id', eventId);
      
      if (deleteError) {
        console.error("❌ [EVENT-ACCESS-CONTROL] Delete error:", deleteError);
        throw deleteError;
      }

      console.log("🗑️ [EVENT-ACCESS-CONTROL] Existing records deleted");

      // Se houver papéis selecionados, inserir novos registros
      if (roleIds.length > 0) {
        const insertData = roleIds.map(roleId => ({
          event_id: eventId,
          role_id: roleId
        }));

        console.log("📝 [EVENT-ACCESS-CONTROL] Inserting new records:", insertData);

        const { error: insertError } = await supabase
          .from('event_access_control')
          .insert(insertData);
          
        if (insertError) {
          console.error("❌ [EVENT-ACCESS-CONTROL] Insert error:", insertError);
          throw insertError;
        }

        console.log("✅ [EVENT-ACCESS-CONTROL] Successfully inserted records");
      } else {
        console.log("🌐 [EVENT-ACCESS-CONTROL] No roles selected - event will be public");
      }

      return { eventId, roleIds };
    },
    onSuccess: (data) => {
      console.log("🎉 [EVENT-ACCESS-CONTROL] Save successful:", data);
      queryClient.invalidateQueries({ queryKey: ['event-access-control'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Controle de acesso salvo com sucesso!");
    },
    onError: (error) => {
      console.error("💥 [EVENT-ACCESS-CONTROL] Save failed:", error);
      toast.error("Erro ao salvar controle de acesso do evento");
    }
  });

  // Usar useCallback para estabilizar as funções
  const updateSelectedRoles = useCallback((roleIds: string[]) => {
    console.log("🔄 [EVENT-ACCESS-CONTROL] Updating selected roles:", roleIds);
    setSelectedRoles(roleIds);
  }, []);

  const saveAccessControl = useCallback(async (eventId: string) => {
    console.log("💾 [EVENT-ACCESS-CONTROL] Save requested for event:", eventId, "with roles:", selectedRoles);
    
    try {
      await saveAccessControlMutation.mutateAsync({ eventId, roleIds: selectedRoles });
      console.log("✅ [EVENT-ACCESS-CONTROL] Save completed successfully");
    } catch (error) {
      console.error("❌ [EVENT-ACCESS-CONTROL] Save failed:", error);
      throw error;
    }
  }, [selectedRoles, saveAccessControlMutation]);

  return {
    selectedRoles,
    updateSelectedRoles,
    saveAccessControl,
    isLoading: isLoading && !!eventId,
    isSaving: saveAccessControlMutation.isPending,
    isInitialized: isInitializedRef.current,
    error: error || saveAccessControlMutation.error
  };
};
