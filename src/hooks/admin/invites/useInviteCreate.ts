
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
      
      console.log("🎯 [INVITE-CREATE] Criando convite:", {
        email: params.email,
        channels: params.channels,
        whatsappNumber: params.whatsappNumber,
        userName: params.userName
      });

      // Definir canais padrão se não especificado
      const channels = params.channels || ['email'];
      
      // Validações específicas para WhatsApp
      if (channels.includes('whatsapp')) {
        if (!params.userName || params.userName.trim() === '') {
          console.error("❌ [INVITE-CREATE] Nome obrigatório para WhatsApp");
          toast.error("Nome da pessoa é obrigatório para envio via WhatsApp");
          return {
            status: 'error',
            message: "Nome da pessoa é obrigatório para envio via WhatsApp"
          };
        }

        if (!params.whatsappNumber || params.whatsappNumber.trim() === '') {
          console.error("❌ [INVITE-CREATE] Número WhatsApp obrigatório");
          toast.error("Número do WhatsApp é obrigatório");
          return {
            status: 'error',
            message: "Número do WhatsApp é obrigatório"
          };
        }
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
      console.log("📧 [INVITE-CREATE] Criando convite no banco...");
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: params.email,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes || null
      });

      if (error) {
        console.error("❌ [INVITE-CREATE] Erro ao criar convite:", error);
        throw error;
      }

      console.log("✅ [INVITE-CREATE] Convite criado no banco:", data);

      if (data?.status === 'success') {
        // Preparar dados para o orquestrador com validação
        const orchestratorData = {
          inviteId: data.invite_id,
          email: params.email,
          roleId: params.roleId,
          token: data.token,
          channels, // Garantir que channels seja sempre enviado
          notes: params.notes || null,
          // Campos específicos para WhatsApp (só enviar se WhatsApp estiver nos canais)
          ...(channels.includes('whatsapp') && {
            whatsappNumber: params.whatsappNumber,
            userName: params.userName?.trim()
          })
        };

        console.log("🎯 [INVITE-CREATE] Enviando para orquestrador:", orchestratorData);

        // Agora enviar via orquestrador
        const orchestratorResponse = await supabase.functions.invoke('invite-orchestrator', {
          body: orchestratorData
        });

        if (orchestratorResponse.error) {
          console.error("❌ [INVITE-CREATE] Erro no orquestrador:", orchestratorResponse.error);
          toast.error("Convite criado mas falha no envio: " + orchestratorResponse.error.message);
          return {
            status: 'error',
            message: "Convite criado mas falha no envio: " + orchestratorResponse.error.message
          };
        }

        const orchestratorResult = orchestratorResponse.data;
        
        console.log("🎯 [INVITE-CREATE] Resultado do orquestrador:", orchestratorResult);
        
        if (orchestratorResult?.success) {
          const channelNames = channels.map(c => c === 'email' ? 'E-mail' : 'WhatsApp').join(' e ');
          toast.success(`Convite criado e enviado via ${channelNames}!`);
          return {
            status: 'success',
            message: orchestratorResult.message || `Convite enviado via ${channelNames}`,
            invite_id: data.invite_id,
            token: data.token
          };
        } else {
          console.error("❌ [INVITE-CREATE] Falha no orquestrador:", orchestratorResult);
          toast.error(orchestratorResult?.message || "Erro ao enviar convite");
          return {
            status: 'error',
            message: orchestratorResult?.message || "Erro ao enviar convite"
          };
        }
      } else {
        console.error("❌ [INVITE-CREATE] Falha ao criar convite:", data);
        toast.error(data?.message || "Erro ao criar convite");
        return {
          status: 'error',
          message: data?.message || "Erro ao criar convite"
        };
      }
    } catch (error: any) {
      console.error("❌ [INVITE-CREATE] Erro crítico:", error);
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
