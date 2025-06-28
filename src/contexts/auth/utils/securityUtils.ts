
import { supabase } from '@/lib/supabase';

export const checkUserSecurity = async (userId: string) => {
  try {
    // Verificar se o usuário existe e está ativo
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role_id, user_roles(name)')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return { isValid: false, isAdmin: false };
    }

    const isAdmin = profile.user_roles?.name === 'admin';

    return {
      isValid: true,
      isAdmin,
      profile
    };
  } catch (error) {
    console.error('Erro ao verificar segurança do usuário:', error);
    return { isValid: false, isAdmin: false };
  }
};

export const logSecurityEvent = async (eventType: string, details: any = {}) => {
  try {
    // Log direto na tabela audit_logs ao invés de usar RPC
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: 'security_event',
        action: eventType,
        user_id: (await supabase.auth.getUser()).data.user?.id || null,
        details: details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
  }
};

export const validateUserAccess = async (userId: string, resource: string) => {
  try {
    const security = await checkUserSecurity(userId);
    
    if (!security.isValid) {
      await logSecurityEvent('unauthorized_access_attempt', {
        userId,
        resource,
        reason: 'invalid_user'
      });
      return false;
    }

    // Log de acesso autorizado
    await logSecurityEvent('authorized_access', {
      userId,
      resource,
      isAdmin: security.isAdmin
    });

    return true;
  } catch (error) {
    console.error('Erro ao validar acesso:', error);
    return false;
  }
};
