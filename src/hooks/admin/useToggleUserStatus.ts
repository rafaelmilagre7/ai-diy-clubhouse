import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ToggleStatusResult {
  success: boolean;
  message: string;
  newStatus: 'active' | 'inactive';
  userId: string;
  userEmail: string;
}

export const useToggleUserStatus = () => {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleUserStatus = async (userId: string, userEmail: string, currentStatus: string): Promise<boolean> => {
    try {
      setIsToggling(true);
      setError(null);

      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      console.log("🔄 Alterando status do usuário:", { userId, userEmail, currentStatus, newStatus });

      // Atualizar status no profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Erro ao atualizar status: ${updateError.message}`);
      }

      // Log da alteração no audit
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          event_type: 'user_status_change',
          action: newStatus === 'active' ? 'user_activated' : 'user_deactivated',
          details: {
            target_user_email: userEmail,
            previous_status: currentStatus,
            new_status: newStatus,
            changed_by: (await supabase.auth.getUser()).data.user?.email,
            timestamp: new Date().toISOString()
          },
          severity: 'info'
        });

      console.log("✅ Status do usuário alterado com sucesso");

      // Toast de sucesso
      if (newStatus === 'active') {
        toast.success('✅ Usuário reativado', {
          description: `${userEmail} foi reativado e pode acessar a plataforma novamente.`,
          duration: 5000
        });
      } else {
        toast.success('🚫 Usuário desativado', {
          description: `${userEmail} foi desativado e não pode mais acessar a plataforma.`,
          duration: 5000
        });
      }

      return true;
    } catch (err: any) {
      console.error('❌ Erro ao alterar status do usuário:', err);
      setError(err);
      
      toast.error('❌ Erro ao alterar status', {
        description: err.message || 'Não foi possível alterar o status do usuário.',
        duration: 8000
      });
      
      return false;
    } finally {
      setIsToggling(false);
    }
  };

  return {
    toggleUserStatus,
    isToggling,
    error
  };
};