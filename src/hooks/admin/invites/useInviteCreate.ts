import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseEmailPattern, findRelatedEmails, canCoexist } from "@/utils/emailUtils";
import type { CreateInviteParams, InviteCreateResult } from "./types";

export const useInviteCreate = () => {
  const [loading, setLoading] = useState(false);

  const validateUniqueEmail = async (email: string): Promise<{ isValid: boolean; message?: string; relatedEmails?: string[] }> => {
    try {
      const { baseLocalPart, domain } = parseEmailPattern(email);
      
      // Buscar apenas emails do mesmo domínio para verificar conflitos reais
      const domainPattern = `%${domain}`;
      const basePattern = `${baseLocalPart}%${domain}`;
      
      // Buscar emails relacionados em profiles (mesmo domínio)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', domainPattern)
        .ilike('email', basePattern);
      
      // Buscar emails relacionados em invites (mesmo domínio)
      const { data: invites } = await supabase
        .from('invites')
        .select('email')
        .ilike('email', domainPattern)
        .ilike('email', basePattern);
      
      const allEmails = [
        ...(profiles?.map(p => p.email) || []),
        ...(invites?.map(i => i.email) || [])
      ].filter(Boolean);
      
      // Verificar se há conflitos reais usando a nova lógica
      const conflictingEmails = allEmails.filter(existingEmail => 
        !canCoexist(email, existingEmail)
      );
      
      if (conflictingEmails.length > 0) {
        return {
          isValid: false,
          message: `Email já existe no sistema com ${conflictingEmails.length} variação(ões) no mesmo domínio`,
          relatedEmails: conflictingEmails
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar email:', error);
      return { isValid: true }; // Em caso de erro, permitir criação
    }
  };

  const createInvite = async (params: CreateInviteParams): Promise<InviteCreateResult | null> => {
    try {
      setLoading(true);
      
      console.log("🎯 Criando convite:", params);

      // Validar se userName é obrigatório quando WhatsApp está incluído
      if (params.channels?.includes('whatsapp') && (!params.userName || params.userName.trim() === '')) {
        toast.error("Nome da pessoa é obrigatório para envio via WhatsApp");
        return {
          status: 'error',
          message: "Nome da pessoa é obrigatório para envio via WhatsApp"
        };
      }

      // Validar email único com nova lógica
      const emailValidation = await validateUniqueEmail(params.email);
      if (!emailValidation.isValid) {
        const errorMessage = `${emailValidation.message}\nEmails encontrados: ${emailValidation.relatedEmails?.join(', ')}`;
        toast.error("Email já existe no sistema", {
          description: errorMessage,
          duration: 8000
        });
        return {
          status: 'error',
          message: errorMessage
        };
      }

      // Criar convite via função do Supabase
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: params.email,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes || null
      });

      if (error) {
        console.error("❌ Erro ao criar convite:", error);
        throw error;
      }

      console.log("✅ Convite criado:", data);

      if (data?.status === 'success') {
        // Agora enviar via orquestrador
        const orchestratorResponse = await supabase.functions.invoke('invite-orchestrator', {
          body: {
            inviteId: data.invite_id,
            email: params.email,
            whatsappNumber: params.whatsappNumber,
            roleId: params.roleId,
            token: data.token,
            channels: params.channels || ['email'],
            userName: params.userName || null,
            notes: params.notes
          }
        });

        if (orchestratorResponse.error) {
          console.error("❌ Erro no orquestrador:", orchestratorResponse.error);
          toast.error("Convite criado mas falha no envio: " + orchestratorResponse.error.message);
          return {
            status: 'error',
            message: "Convite criado mas falha no envio: " + orchestratorResponse.error.message
          };
        }

        const orchestratorData = orchestratorResponse.data;
        
        if (orchestratorData?.success) {
          toast.success("Convite criado e enviado com sucesso!");
          return {
            status: 'success',
            message: orchestratorData.message,
            invite_id: data.invite_id,
            token: data.token
          };
        } else {
          toast.error(orchestratorData?.message || "Erro ao enviar convite");
          return {
            status: 'error',
            message: orchestratorData?.message || "Erro ao enviar convite"
          };
        }
      } else {
        toast.error(data?.message || "Erro ao criar convite");
        return {
          status: 'error',
          message: data?.message || "Erro ao criar convite"
        };
      }
    } catch (error: any) {
      console.error("❌ Erro no useInviteCreate:", error);
      toast.error(error.message || "Erro ao criar convite");
      return {
        status: 'error',
        message: error.message || "Erro ao criar convite"
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvite,
    loading
  };
};
