
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseEventAccessControlProps {
  eventId?: string;
}

export const useEventAccessControl = ({ eventId }: UseEventAccessControlProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Carregar papéis de acesso existentes para o evento
  const { data: accessControlData, isLoading } = useQuery({
    queryKey: ['event-access-control', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId);
      
      if (error) throw error;
      return data?.map(item => item.role_id) || [];
    },
    enabled: !!eventId
  });

  // Atualizar estado local quando os dados carregarem
  useEffect(() => {
    if (accessControlData) {
      setSelectedRoles(accessControlData);
    }
  }, [accessControlData]);

  // Mutation para salvar controle de acesso
  const saveAccessControlMutation = useMutation({
    mutationFn: async ({ eventId, roleIds }: { eventId: string; roleIds: string[] }) => {
      // Primeiro, deletar registros existentes
      const { error: deleteError } = await supabase
        .from('event_access_control')
        .delete()
        .eq('event_id', eventId);
      
      if (deleteError) throw deleteError;

      // Se houver papéis selecionados, inserir novos registros
      if (roleIds.length > 0) {
        const insertData = roleIds.map(roleId => ({
          event_id: eventId,
          role_id: roleId
        }));

        const { error: insertError } = await supabase
          .from('event_access_control')
          .insert(insertData);
          
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-access-control'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error("Erro ao salvar controle de acesso:", error);
      toast.error("Erro ao salvar controle de acesso do evento");
    }
  });

  const updateSelectedRoles = (roleIds: string[]) => {
    setSelectedRoles(roleIds);
  };

  const saveAccessControl = async (eventId: string) => {
    await saveAccessControlMutation.mutateAsync({ eventId, roleIds: selectedRoles });
  };

  return {
    selectedRoles,
    updateSelectedRoles,
    saveAccessControl,
    isLoading,
    isSaving: saveAccessControlMutation.isPending
  };
};
