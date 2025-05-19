
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/supabase/types";
import { generateTempId } from "@/utils/stringGenerator";

/**
 * Processa o perfil de um usuário autenticado
 * @param user Usuário autenticado
 * @returns Perfil do usuário
 */
export async function processUserProfile(user: User): Promise<UserProfile | null> {
  if (!user) return null;
  
  try {
    // Buscar perfil existente
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(id, name, description, permissions)')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Erro ao buscar perfil:", profileError);
      throw profileError;
    }
    
    // Se o perfil já existe, retorná-lo
    if (existingProfile) {
      console.log("Perfil existente encontrado:", existingProfile.id);
      return existingProfile as UserProfile;
    }
    
    // Se o perfil não existe, criá-lo com dados básicos
    console.log("Criando novo perfil para usuário:", user.id);
    
    const newProfile = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
      avatar_url: user.user_metadata?.avatar_url,
      role: determineRoleFromEmail(user.email || ''),
      created_at: new Date().toISOString()
    };
    
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select('*')
      .single();
    
    if (createError) {
      console.error("Erro ao criar perfil:", createError);
      throw createError;
    }
    
    return createdProfile as UserProfile;
  } catch (error) {
    console.error("Erro ao processar perfil:", error);
    return null;
  }
}

/**
 * Determina o papel do usuário com base no email
 * @param email Email do usuário
 * @returns Papel do usuário
 */
export function determineRoleFromEmail(email: string): string {
  if (!email) return 'member';
  
  // Verificações específicas de papel
  if (email.includes('@viverdeia.ai') || email === 'admin@teste.com') {
    return 'admin';
  } else if (email.includes('@formacao.viverdeia.ai') || email.includes('formacao@')) {
    return 'formacao';
  }
  
  // Padrão
  return 'member';
}

/**
 * Verifica se o usuário tem autorização para acessar recursos
 * @param userId ID do usuário
 * @param requiredRole Papel requerido (opcional)
 * @returns Se o usuário tem autorização
 */
export async function validateUserAuthorization(userId: string, requiredRole?: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error("Erro ao verificar autorização:", error);
      return false;
    }
    
    // Se não há papel requerido, apenas verifica se o usuário existe
    if (!requiredRole) return true;
    
    // Verificar se o usuário tem o papel requerido
    if (requiredRole === 'admin' && data.role !== 'admin') {
      return false;
    }
    
    // Verificações específicas de papel
    if (requiredRole === 'formacao' && !['admin', 'formacao'].includes(data.role)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao validar autorização:", error);
    return false;
  }
}

/**
 * Obtém o papel do usuário
 * @param userId ID do usuário
 * @returns Papel do usuário
 */
export async function getUserRole(userId: string): Promise<string | null> {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Erro ao obter papel do usuário:", error);
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error("Erro ao obter papel do usuário:", error);
    return null;
  }
}
