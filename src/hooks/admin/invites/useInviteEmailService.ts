
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse } from './types';

interface SendInviteEmailParams {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  retryCount?: number;
}

export function useInviteEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);
  const [emailQueue, setEmailQueue] = useState<SendInviteEmailParams[]>([]);

  // Função para enviar email de convite com retentativas
  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    retryCount = 0,
  }: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      setSendError(null);

      // Validação mais flexível da URL
      if (!inviteUrl || !inviteUrl.includes('/convite/') || inviteUrl.length < 20) {
        console.error("URL inválida gerada para o convite:", inviteUrl);
        setSendError(new Error('URL inválida gerada'));
        return {
          success: false,
          message: 'Erro ao gerar URL do convite',
          error: 'URL inválida gerada'
        };
      }
      
      console.log("Enviando convite por email: ", {
        email,
        inviteUrl,
        roleName,
        retryAttempt: retryCount
      });
      
      // Adicionar timeout para garantir que a solicitação não fique pendente indefinidamente
      const timeoutPromise = new Promise<{ error: string }>((_, reject) => 
        setTimeout(() => reject({ error: 'Tempo limite excedido ao enviar email' }), 30000)
      );
      
      // Chamar a edge function para envio de email
      const resultPromise = supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId
        }
      });
      
      // Usar Promise.race para implementar timeout
      const { data, error } = await Promise.race([
        resultPromise,
        timeoutPromise.then((e) => { throw e; })
      ]) as { data: any, error: Error | null };
      
      if (error) {
        console.error("Erro ao chamar a edge function:", error);
        
        // Verificar se é o caso de adicionar à fila para retentativa
        if (retryCount < 3) {
          console.log(`Adicionando email para ${email} à fila de retentativas (tentativa ${retryCount + 1})`);
          
          const retryParams = {
            email,
            inviteUrl,
            roleName,
            expiresAt,
            senderName,
            notes,
            inviteId,
            retryCount: retryCount + 1
          };
          
          // Adicionar à fila e agendar nova tentativa
          setEmailQueue(prev => [...prev, retryParams]);
          
          // Programar retentativa após um intervalo (aumento exponencial)
          setTimeout(() => {
            sendInviteEmail(retryParams)
              .then(result => {
                if (result.success) {
                  // Remover da fila após sucesso
                  setEmailQueue(prev => prev.filter(item => 
                    item.email !== email || item.inviteId !== inviteId
                  ));
                }
              });
          }, Math.pow(2, retryCount) * 5000); // 5s, 10s, 20s
        }
        
        setSendError(error);
        return {
          success: false,
          message: 'Erro ao enviar e-mail de convite',
          error: error.message || 'Falha na conexão com o servidor'
        };
      }
      
      console.log("Resposta da edge function:", data);
      
      if (!data.success) {
        console.error("Edge function reportou erro:", data.error || data.message);
        setSendError(new Error(data.message || data.error || 'Erro ao enviar e-mail'));
        
        return {
          success: false,
          message: data.message || 'Erro ao enviar e-mail',
          error: data.error
        };
      }
      
      return {
        success: true,
        message: 'Email enviado com sucesso',
        emailId: data.emailId
      };
    } catch (err: any) {
      console.error('Erro ao enviar email de convite:', err);
      setSendError(err);
      
      // Se for um erro de timeout ou conexão, também adicionar à fila de retentativas
      if (retryCount < 3 && (err.message?.includes('Tempo limite') || err.message?.includes('conexão'))) {
        const retryParams = {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          retryCount: retryCount + 1
        };
        
        setEmailQueue(prev => [...prev, retryParams]);
        
        setTimeout(() => {
          sendInviteEmail(retryParams);
        }, Math.pow(2, retryCount) * 5000);
      }
      
      return {
        success: false,
        message: 'Erro ao enviar email de convite',
        error: err.message
      };
    } finally {
      setIsSending(false);
    }
  }, []);

  // Gerar link de convite - Corrigido para usar domínio de produção fixo
  const getInviteLink = useCallback((token: string) => {
    // Verificar se o token existe
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    
    // Limpar o token de espaços e normalizar
    const cleanToken = token.trim().replace(/[\s\n\r\t]+/g, '');
    
    console.log("Gerando link de convite para token:", {
      original: token,
      limpo: cleanToken,
      comprimento: cleanToken.length
    });
    
    // Verificação de integridade do token
    if (!cleanToken.match(/^[A-Z0-9]+$/i)) {
      console.warn("Token contém caracteres não alfanuméricos:", token);
    }
    
    // Usar domínio correto da aplicação em produção
    // Detectar ambiente e usar URL apropriada
    const isProduction = window.location.hostname === 'app.viverdeia.ai' || 
                        window.location.hostname === 'ai-diy-clubhouse.lovable.app';
    
    const baseUrl = isProduction 
      ? 'https://app.viverdeia.ai' 
      : window.location.origin;
    
    const inviteUrl = `${baseUrl}/convite/${encodeURIComponent(cleanToken)}`;
    
    console.log("URL do convite gerado:", inviteUrl);
    console.log("Ambiente detectado:", isProduction ? 'produção' : 'desenvolvimento');
    
    return inviteUrl;
  }, []);

  // Limpar a fila de emails pendentes
  const clearEmailQueue = useCallback(() => {
    setEmailQueue([]);
  }, []);

  // Tentar reenviar todos os emails pendentes
  const retryAllPendingEmails = useCallback(() => {
    const pendingEmails = [...emailQueue];
    clearEmailQueue();
    
    pendingEmails.forEach(params => {
      sendInviteEmail(params)
        .then(result => {
          if (result.success) {
            toast.success(`Email para ${params.email} reenviado com sucesso`);
          } else {
            toast.error(`Falha ao reenviar email para ${params.email}`);
          }
        });
    });
  }, [emailQueue, clearEmailQueue, sendInviteEmail]);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    pendingEmails: emailQueue.length,
    retryAllPendingEmails,
    clearEmailQueue
  };
}
