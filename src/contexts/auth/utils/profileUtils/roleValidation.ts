
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/supabase/types';

// Função para determinar o papel do usuário com base no email
export const determineRoleFromEmail = (email: string): string => {
  if (!email) return 'user';
  
  if (email.includes('@viverdeia.ai') || 
      email === 'admin@teste.com' ||
      email === 'admin@viverdeia.ai') {
    return 'admin';
  }
  
  // Adicione outras regras de verificação por email aqui
  
  return 'user'; // Papel padrão
};

// Função para verificar se o usuário é um super administrador
export const isSuperAdmin = (email: string): boolean => {
  if (!email) return false;
  
  return email === 'admin@viverdeia.ai' || 
         email === 'admin@teste.com';
};

// Funções adicionais para validação de papéis
