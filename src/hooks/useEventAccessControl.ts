
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseEventAccessControlProps {
  eventId?: string;
}

export const useEventAccessControl = ({ eventId }: UseEventAccessControlProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const queryClient = useQueryClient();

  console.log("useEventAccessControl - Hook initialized with eventId:", eventId);

  // Carregar papéis de acesso existentes para o evento
  const { data: accessControlData, isLoading, error } = useQuery({
    queryKey: ['event-access-control', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.log("useEventAccessControl - No eventId provided, returning empty array");
        return [];
      }
      
      console.log("useEventAccessControl - Fetching access control data for event:", eventId);
      
      const { data, error } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId);
      
      if (error) {
        console.error("useEventAccessControl - Error fetching access control data:", error);
        return [];
      }
      
      const roleIds = data?.map(item => item.role_id) || [];
      console.log("useEventAccessControl - Fetched role IDs:", roleIds);
      return roleIds;
    },
    enabled: !!eventId,
    retry: 1,
    staleTime: 30000
  });

  // Usar useCallback para estabilizar a função de atualização
  const updateSelectedRoles = useCallback((roleIds: string[]) => {
    console.log("useEventAccessControl - Updating selected roles:", roleIds);
    setSelectedRoles(roleIds);
  }, []);

  // Sincronizar apenas uma vez quando os dados chegam
  useEffect(() => {
    if (accessControlData !== undefined) {
      setSelectedRoles(accessControlData);
    }
  }, [accessControlData]);

  // Mutation para salvar controle de acesso
  const saveAccessControlMutation = useMutation({
    mutationFn: async ({ eventId, roleIds }: { eventId: string; roleIds: string[] }) => {
      console.log("useEventAccessControl - Saving access control:", {
        eventId,
        roleIds,
        roleCount: roleIds.length
      });

      try {
        // Primeiro, deletar registros existentes
        console.log("useEventAccessControl - Deleting existing access control records");
        const { error: deleteError } = await supabase
          .from('event_access_control')
          .delete()
          .eq('event_id', eventId);
        
        if (deleteError) {
          console.error("useEventAccessControl - Error deleting existing records:", deleteError);
          throw deleteError;
        }

        // Se houver papéis selecionados, inserir novos registros
        if (roleIds.length > 0) {
          const insertData = roleIds.map(roleId => ({
            event_id: eventId,
            role_id: roleId
          }));

          console.log("useEventAccessControl - Inserting new access control records:", insertData);

          const { error: insertError } = await supabase
            .from('event_access_control')
            .insert(insertData);
            
          if (insertError) {
            console.error("useEventAccessControl - Error inserting new records:", insertError);
            throw insertError;
          }

          console.log("useEventAccessControl - Successfully inserted", insertData.length, "records");
        } else {
          console.log("useEventAccessControl - No roles selected, event will be public");
        }
      } catch (error) {
        console.error("useEventAccessControl - Error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log("useEventAccessControl - Access control saved successfully");
      
      // Feedback visual de sucesso
      const roleCount = variables.roleIds.length;
      if (roleCount === 0) {
        console.log("✅ Evento público - todos os usuários têm acesso");
      } else {
        console.log(`✅ Acesso restrito a ${roleCount} papel(is)`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['event-access-control'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error("useEventAccessControl - Error saving access control:", error);
      toast.error("Erro ao salvar controle de acesso do evento");
    }
  });

  const saveAccessControl = async (eventId: string) => {
    console.log("useEventAccessControl - Starting save access control for event:", eventId, "with roles:", selectedRoles);
    try {
      await saveAccessControlMutation.mutateAsync({ eventId, roleIds: selectedRoles });
      console.log("useEventAccessControl - Access control save completed");
    } catch (error) {
      console.error("useEventAccessControl - Error in saveAccessControl:", error);
      throw error;
    }
  };

  return {
    selectedRoles,
    updateSelectedRoles,
    saveAccessControl,
    isLoading: isLoading && !!eventId,
    isSaving: saveAccessControlMutation.isPending
  };
};
