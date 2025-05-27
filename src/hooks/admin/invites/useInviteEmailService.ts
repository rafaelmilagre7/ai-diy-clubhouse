
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

  // Função para enviar email de convite com retentativas robustas
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

      console.log("🚀 Iniciando envio de convite:", {
        email,
        inviteUrl: inviteUrl ? 'URL presente' : 'URL ausente',
        roleName,
        retryAttempt: retryCount,
        inviteId
      });

      // Validações robustas
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido fornecido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      // Verificar se a URL está bem formada
      try {
        const url = new URL(inviteUrl);
        if (!url.pathname.includes('/convite/')) {
          console.warn("URL do convite pode estar mal formada:", inviteUrl);
        }
      } catch (urlError) {
        console.error("URL inválida detectada:", inviteUrl);
        throw new Error('URL do convite é inválida');
      }
      
      console.log("✅ Validações passaram, chamando edge function...");
      
      // Configurar timeout mais generoso
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos
      
      try {
        // Chamar a edge function para envio de email
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email,
            inviteUrl,
            roleName,
            expiresAt,
            senderName,
            notes,
            inviteId
          },
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log("📨 Resposta da edge function:", {
          success: !error && data?.success,
          hasData: !!data,
          hasError: !!error,
          errorMessage: error?.message
        });
        
        if (error) {
          console.error("❌ Erro da edge function:", error);
          throw new Error(`Erro da edge function: ${error.message}`);
        }
        
        if (!data?.success) {
          console.error("❌ Edge function reportou falha:", data);
          throw new Error(data?.message || data?.error || 'Falha desconhecida no envio');
        }
        
        console.log("✅ Email enviado com sucesso!");
        
        // Remover da fila se estava em retry
        if (retryCount > 0) {
          setEmailQueue(prev => prev.filter(item => 
            item.email !== email || item.inviteId !== inviteId
          ));
        }
        
        return {
          success: true,
          message: 'Email enviado com sucesso',
          emailId: data.emailId,
          duration: data.duration
        };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        console.error("❌ Erro na chamada da edge function:", fetchError);
        
        // Verificar se é um erro de timeout ou conexão
        const isNetworkError = fetchError.name === 'AbortError' || 
                              fetchError.message?.includes('timeout') ||
                              fetchError.message?.includes('network') ||
                              fetchError.message?.includes('fetch');
        
        // Sistema de retry robusto
        if (retryCount < 3 && (isNetworkError || fetchError.status >= 500)) {
          console.log(`🔄 Programando retry ${retryCount + 1}/3 para ${email}...`);
          
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
          
          // Adicionar à fila para retry
          setEmailQueue(prev => {
            // Verificar se já não está na fila
            const exists = prev.some(item => 
              item.email === email && item.inviteId === inviteId
            );
            
            if (!exists) {
              return [...prev, retryParams];
            }
            return prev;
          });
          
          // Programar retry com backoff exponencial
          const retryDelay = Math.min(Math.pow(2, retryCount) * 3000, 30000); // Max 30s
          console.log(`⏰ Retry em ${retryDelay}ms`);
          
          setTimeout(() => {
            console.log(`🔄 Executando retry ${retryCount + 1} para ${email}`);
            sendInviteEmail(retryParams)
              .then(result => {
                if (result.success) {
                  console.log(`✅ Retry bem-sucedido para ${email}`);
                  toast.success(`Email para ${email} enviado após retry`);
                }
              })
              .catch(retryError => {
                console.error(`❌ Retry falhou para ${email}:`, retryError);
              });
          }, retryDelay);
          
          return {
            success: false,
            message: `Erro no envio, tentativa ${retryCount + 1}/3 programada`,
            error: fetchError.message,
            willRetry: true
          };
        }
        
        throw fetchError;
      }
      
    } catch (err: any) {
      console.error('❌ Erro geral no envio de email:', err);
      setSendError(err);
      
      return {
        success: false,
        message: 'Erro ao enviar email de convite',
        error: err.message || 'Erro desconhecido'
      };
    } finally {
      setIsSending(false);
    }
  }, []);

  // Gerar link de convite com validação robusta
  const getInviteLink = useCallback((token: string) => {
    if (!token) {
      console.error("❌ Token vazio fornecido para gerar link");
      return "";
    }
    
    // Limpar e validar o token
    const cleanToken = token.trim().replace(/[\s\n\r\t]+/g, '');
    
    if (cleanToken.length < 8) {
      console.error("❌ Token muito curto:", cleanToken.length);
      return "";
    }
    
    if (!cleanToken.match(/^[A-Z0-9]+$/i)) {
      console.warn("⚠️ Token contém caracteres não alfanuméricos:", cleanToken);
    }
    
    // Construir URL absoluta
    const baseUrl = `${window.location.origin}/convite/${encodeURIComponent(cleanToken)}`;
    
    console.log("🔗 Link gerado:", {
      token: cleanToken,
      url: baseUrl,
      tokenLength: cleanToken.length
    });
    
    return baseUrl;
  }, []);

  // Limpar a fila de emails pendentes
  const clearEmailQueue = useCallback(() => {
    console.log("🧹 Limpando fila de emails pendentes");
    setEmailQueue([]);
  }, []);

  // Tentar reenviar todos os emails pendentes
  const retryAllPendingEmails = useCallback(async () => {
    const pendingEmails = [...emailQueue];
    console.log(`🔄 Tentando reenviar ${pendingEmails.length} emails pendentes`);
    
    if (pendingEmails.length === 0) {
      toast.info("Nenhum email pendente para reenviar");
      return;
    }
    
    clearEmailQueue();
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const params of pendingEmails) {
      try {
        const result = await sendInviteEmail(params);
        if (result.success) {
          successCount++;
          toast.success(`Email para ${params.email} reenviado com sucesso`);
        } else {
          failureCount++;
          toast.error(`Falha ao reenviar email para ${params.email}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`Erro ao reenviar para ${params.email}:`, error);
        toast.error(`Erro ao reenviar email para ${params.email}`);
      }
      
      // Pequena pausa entre envios para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📊 Resultado do reenvio: ${successCount} sucessos, ${failureCount} falhas`);
    
    if (successCount > 0) {
      toast.success(`${successCount} email(s) reenviado(s) com sucesso`);
    }
    
    if (failureCount > 0) {
      toast.error(`${failureCount} email(s) falharam no reenvio`);
    }
  }, [emailQueue, clearEmailQueue, sendInviteEmail]);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    pendingEmails: emailQueue.length,
    retryAllPendingEmails,
    clearEmailQueue,
    emailQueue // Expor a fila para debugging
  };
}
