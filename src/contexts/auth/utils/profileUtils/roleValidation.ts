
import { UserProfile } from '@/lib/supabase/types';

// Função para validar o papel do usuário com base no perfil e no email
export const validateUserRole = (profile: UserProfile | null, email: string | null): string => {
  // Se não temos perfil ou email, retornar "member" como padrão
  if (!profile || !email) return 'member';
  
  // Verificar se o email tem domínio específico
  const validatedRole = determineRoleFromEmail(email);
  
  // Se o papel determinado pelo email for diferente do papel no perfil, o email tem precedência
  if (validatedRole !== profile.role) {
    return validatedRole;
  }
  
  // Retornar o papel do perfil
  return profile.role || 'member';
};

// Função para determinar o papel com base no email
export const determineRoleFromEmail = (email: string): string => {
  // Emails de admin
  if (email.includes('@viverdeia.ai') || 
      email === 'admin@teste.com' || 
      email === 'admin@viverdeia.ai') {
    return 'admin';
  }
  
  // Emails de formação
  if (email.includes('@formacao.viverdeia.ai') || 
      email.includes('formacao@viverdeia')) {
    return 'formacao';
  }
  
  // Emails de usuários normais
  return 'member';
};

// Função para verificar se é super admin
export const isSuperAdmin = (email: string | null): boolean => {
  if (!email) return false;
  
  // Lista de super admins
  return email === 'admin@viverdeia.ai' || 
         email === 'admin@teste.com';
};
