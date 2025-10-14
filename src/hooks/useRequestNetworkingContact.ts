import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequestContactParams {
  targetUserId: string;
  message?: string;
}

interface ContactData {
  email: string;
  whatsapp_number?: string;
  name: string;
  company_name?: string;
  current_position?: string;
  linkedin_url?: string;
}

interface RequestContactResponse {
  success: boolean;
  contact_data?: ContactData;
  message: string;
}

export const useRequestNetworkingContact = () => {
  const mutation = useMutation({
    mutationFn: async ({ targetUserId, message }: RequestContactParams) => {
      const { data, error } = await supabase.rpc('request_networking_contact', {
        target_user_id: targetUserId,
        requester_message: message || null,
      });

      if (error) throw error;
      return data as RequestContactResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Dados de contato liberados!', {
          description: 'As informações de contato foram reveladas. Esta ação foi registrada para auditoria.',
        });
      } else {
        toast.error('Não foi possível acessar os dados', {
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao solicitar contato', {
        description: error.message || 'Tente novamente mais tarde',
      });
    },
  });

  return mutation;
};
