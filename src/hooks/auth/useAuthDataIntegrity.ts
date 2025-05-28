
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DataIntegrityResult {
  user_id: string;
  profile_exists: boolean;
  quick_onboarding_exists: boolean;
  onboarding_progress_exists: boolean;
  profile_created: boolean;
  user_email: string;
  user_name: string;
}

export const useAuthDataIntegrity = () => {
  const { user, profile, setProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<DataIntegrityResult | null>(null);

  const checkAndFixData = useCallback(async () => {
    if (!user?.id) return null;

    try {
      setIsChecking(true);
      console.log('🔍 Verificando integridade dos dados do usuário...');

      const { data, error } = await supabase.rpc('check_and_fix_onboarding_data', {
        user_id_param: user.id
      });

      if (error) {
        console.error('❌ Erro ao verificar integridade:', error);
        throw error;
      }

      console.log('✅ Resultado da verificação:', data);
      setLastCheck(data);

      // Se o perfil foi criado, atualizar o contexto de auth
      if (data.profile_created && !profile) {
        console.log('📝 Perfil criado automaticamente, atualizando contexto...');
        
        // Buscar o perfil recém-criado
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && newProfile) {
          setProfile(newProfile);
          toast.success('Perfil configurado automaticamente');
        }
      }

      return data;
    } catch (error: any) {
      console.error('❌ Erro na verificação de integridade:', error);
      toast.error('Erro ao verificar dados do usuário');
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, profile, setProfile]);

  // Executar verificação quando o usuário for carregado
  useEffect(() => {
    if (user?.id && !lastCheck) {
      checkAndFixData();
    }
  }, [user?.id, lastCheck, checkAndFixData]);

  return {
    checkAndFixData,
    isChecking,
    lastCheck,
    hasIntegrityIssues: lastCheck && (!lastCheck.profile_exists || (!lastCheck.quick_onboarding_exists && !lastCheck.onboarding_progress_exists))
  };
};
