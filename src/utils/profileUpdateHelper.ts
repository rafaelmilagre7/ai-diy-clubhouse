import { supabase } from '@/integrations/supabase/client';

/**
 * Helper seguro para atualização de perfis
 * Previne Mass Assignment bloqueando alterações diretas de campos sensíveis
 */

// Campos que podem ser editados diretamente pelo usuário
const SAFE_FIELDS = [
  'name',
  'avatar_url',
  'company_name',
  'current_position',
  'linkedin_url',
  'whatsapp_number',
  'industry',
  'company_size',
  'bio',
  'location'
];

// Campos que requerem Edge Function (admin only)
const RESTRICTED_FIELDS = [
  'role_id',
  'role',
  'organization_id',
  'is_master_user',
  'status',
  'onboarding_completed',
  'email',
  'id'
];

export async function safeUpdateProfile(
  userId: string,
  updates: Record<string, any>
) {
  const updateKeys = Object.keys(updates);
  
  // Verificar se há tentativa de modificar campos restritos
  const hasRestrictedField = updateKeys.some(key => 
    RESTRICTED_FIELDS.includes(key)
  );

  if (hasRestrictedField) {
    console.log('[PROFILE-UPDATE] Campos restritos detectados, usando Edge Function');
    
    // Usar Edge Function (apenas admin pode fazer isso)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await supabase.functions.invoke('admin-update-profile', {
      body: {
        targetUserId: userId,
        updates
      }
    });

    if (response.error) {
      console.error('[PROFILE-UPDATE] Edge Function error:', response.error);
      throw new Error(response.error.message || 'Erro ao atualizar perfil');
    }

    return response.data;
  } else {
    console.log('[PROFILE-UPDATE] Campos seguros, update direto');
    
    // Update direto (campos seguros)
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[PROFILE-UPDATE] Direct update error:', error);
      throw error;
    }

    return { success: true, data };
  }
}

/**
 * Valida se um campo pode ser editado diretamente
 */
export function isFieldSafe(fieldName: string): boolean {
  return SAFE_FIELDS.includes(fieldName);
}

/**
 * Valida se um campo é restrito (admin only)
 */
export function isFieldRestricted(fieldName: string): boolean {
  return RESTRICTED_FIELDS.includes(fieldName);
}

/**
 * Filtra updates para manter apenas campos seguros
 */
export function filterSafeUpdates(updates: Record<string, any>): Record<string, any> {
  const safeUpdates: Record<string, any> = {};
  
  Object.keys(updates).forEach(key => {
    if (SAFE_FIELDS.includes(key)) {
      safeUpdates[key] = updates[key];
    }
  });
  
  return safeUpdates;
}
