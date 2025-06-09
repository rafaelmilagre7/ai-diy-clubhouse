
import { z } from 'zod';

// Schemas de validação seguros
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo')
  .refine(
    (email) => !email.includes('<') && !email.includes('>'),
    'Email contém caracteres inválidos'
  );

export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(128, 'Senha muito longa')
  .refine(
    (password) => !/[<>'"]/g.test(password),
    'Senha contém caracteres não permitidos'
  );

export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .max(100, 'Nome muito longo')
  .refine(
    (name) => !/[<>'"]/g.test(name),
    'Nome contém caracteres não permitidos'
  );

export const textSchema = z
  .string()
  .max(1000, 'Texto muito longo')
  .refine(
    (text) => !/<script|javascript:|on\w+\s*=/i.test(text),
    'Texto contém conteúdo potencialmente perigoso'
  );

// Função para sanitizar entrada de dados
export const sanitizeInput = (input: string, maxLength: number = 255): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>'"]/g, '') // Remover caracteres perigosos
    .substring(0, maxLength) // Limitar comprimento
    .trim();
};

// Função para validar entrada segura
export const validateSecureInput = (input: string, type: 'email' | 'password' | 'name' | 'text' = 'text') => {
  try {
    switch (type) {
      case 'email':
        emailSchema.parse(input);
        break;
      case 'password':
        passwordSchema.parse(input);
        break;
      case 'name':
        nameSchema.parse(input);
        break;
      case 'text':
        textSchema.parse(input);
        break;
    }
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.errors[0]?.message || 'Entrada inválida' 
      };
    }
    return { isValid: false, error: 'Erro de validação' };
  }
};
