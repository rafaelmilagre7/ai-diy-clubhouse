import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToastModern } from '@/hooks/useToastModern';
import { useAuth } from '@/contexts/auth';

interface SendTestEmailButtonProps {
  templateType: string;
  templateData: Record<string, any>;
}

export function SendTestEmailButton({ templateType, templateData }: SendTestEmailButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastModern();

  const handleSendTest = async () => {
    if (!user) {
      showError('Erro', 'Você precisa estar logado');
      return;
    }

    setIsSending(true);
    
    try {
      // Criar notificação de teste
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          category: templateData.category || 'system',
          type: templateData.type || 'test',
          title: templateData.title || 'Email de Teste',
          message: templateData.message || 'Este é um email de teste',
          metadata: templateData,
          status: 'unread',
        })
        .select()
        .single();

      if (notifError) throw notifError;

      // Enviar email via edge function
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          notificationId: notification.id,
          userId: user.id,
          category: templateData.category || 'system',
          type: templateData.type || 'test',
          title: templateData.title || 'Email de Teste',
          message: templateData.message || 'Este é um email de teste',
          metadata: templateData,
        },
      });

      if (error) throw error;

      showSuccess('Sucesso', 'Email de teste enviado com sucesso! Verifique sua caixa de entrada.');
      
      // Limpar notificação de teste
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id);
        
    } catch (error: any) {
      console.error('Erro ao enviar email de teste:', error);
      showError('Erro', `Erro ao enviar email: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      onClick={handleSendTest}
      disabled={isSending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isSending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Enviar Email de Teste
        </>
      )}
    </Button>
  );
}
