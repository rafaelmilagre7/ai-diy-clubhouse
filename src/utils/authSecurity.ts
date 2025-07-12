/**
 * Utilitários de segurança para autenticação
 * Implementa práticas de segurança para prevenir ataques e proteger sessões
 */

import { supabase } from '@/lib/supabase';

/**
 * Limpa completamente o estado de autenticação
 * Remove tokens, sessões e dados de localStorage
 */
export const cleanupAuthState = (): void => {
  try {
    // Limpar tokens específicos do Supabase
    const keysToRemove = [
      'supabase.auth.token',
      'sb-auth-token',
      'sb-refresh-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Limpar todas as chaves que começam com supabase.auth ou sb-
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('✅ Estado de autenticação limpo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao limpar estado de autenticação:', error);
  }
};

/**
 * Logout seguro com limpeza completa
 */
export const secureSignOut = async (): Promise<void> => {
  try {
    // Primeiro limpar estado local
    cleanupAuthState();
    
    // Tentar logout global
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (signOutError) {
      console.warn('Aviso: Não foi possível fazer logout global:', signOutError);
      // Continuar mesmo se o logout global falhar
    }
    
    // Forçar atualização da página para estado limpo
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
    
  } catch (error) {
    console.error('❌ Erro no logout seguro:', error);
    // Em caso de erro, pelo menos redirecionar
    window.location.href = '/auth';
  }
};

/**
 * Valida e sanitiza dados de entrada para prevenir ataques
 */
export const sanitizeAuthInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove caracteres potencialmente perigosos
    .substring(0, 500); // Limita tamanho
};

/**
 * Verifica se o email é válido e seguro
 */
export const validateEmailSecurity = (email: string): { valid: boolean; message?: string } => {
  const sanitizedEmail = sanitizeAuthInput(email);
  
  if (!sanitizedEmail) {
    return { valid: false, message: 'Email é obrigatório' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return { valid: false, message: 'Formato de email inválido' };
  }
  
  // Verificar se não é um email suspeito
  const suspiciousDomains = ['tempmail', 'guerrillamail', '10minutemail'];
  if (suspiciousDomains.some(domain => sanitizedEmail.includes(domain))) {
    return { valid: false, message: 'Use um email permanente' };
  }
  
  return { valid: true };
};

/**
 * Valida força da senha
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  score: number;
  issues: string[];
} => {
  const issues: string[] = [];
  let score = 0;
  
  if (!password) {
    return { valid: false, score: 0, issues: ['Senha é obrigatória'] };
  }
  
  if (password.length >= 8) score += 1;
  else issues.push('Mínimo 8 caracteres');
  
  if (/[A-Z]/.test(password)) score += 1;
  else issues.push('Pelo menos 1 letra maiúscula');
  
  if (/[a-z]/.test(password)) score += 1;
  else issues.push('Pelo menos 1 letra minúscula');
  
  if (/[0-9]/.test(password)) score += 1;
  else issues.push('Pelo menos 1 número');
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else issues.push('Pelo menos 1 caractere especial');
  
  // Verificar senhas comuns
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    issues.push('Não use senhas comuns');
    score = Math.max(0, score - 2);
  }
  
  return {
    valid: score >= 4 && issues.length <= 1,
    score,
    issues
  };
};

/**
 * Rate limiting simples para tentativas de login
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkLoginRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const key = `login_${identifier}`;
  const attempt = loginAttempts.get(key);
  
  if (!attempt) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset após 15 minutos
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Máximo 5 tentativas por 15 minutos
  if (attempt.count >= 5) {
    return false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return true;
};

/**
 * Registra tentativa de login suspeita
 */
export const logSuspiciousLogin = async (details: {
  email?: string;
  reason: string;
  userAgent?: string;
  ip?: string;
}): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: null,
      event_type: 'security_event',
      action: 'suspicious_login_attempt',
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        url: window.location.href
      },
      severity: 'medium'
    });
  } catch (error) {
    console.error('Erro ao registrar tentativa suspeita:', error);
  }
};

/**
 * Implementa login seguro com todas as validações
 */
export const secureSignIn = async (email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  needsRedirect?: boolean;
}> => {
  try {
    // 1. Validar e sanitizar entrada
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.message };
    }
    
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid && passwordValidation.score < 3) {
      await logSuspiciousLogin({ 
        email: emailValidation.valid ? email : 'invalid', 
        reason: 'Weak password attempt' 
      });
      return { success: false, error: 'Senha muito fraca para fazer login' };
    }
    
    // 2. Verificar rate limiting
    if (!checkLoginRateLimit(email)) {
      await logSuspiciousLogin({ 
        email, 
        reason: 'Rate limit exceeded' 
      });
      return { 
        success: false, 
        error: 'Muitas tentativas. Tente novamente em 15 minutos.' 
      };
    }
    
    // 3. Limpar estado anterior
    cleanupAuthState();
    
    // 4. Tentar logout global primeiro
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignorar erros de logout
    }
    
    // 5. Fazer login
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeAuthInput(email),
      password
    });
    
    if (error) {
      await logSuspiciousLogin({ 
        email, 
        reason: `Login failed: ${error.message}` 
      });
      return { 
        success: false, 
        error: error.message.includes('Invalid') 
          ? 'Email ou senha incorretos' 
          : error.message 
      };
    }
    
    if (data.user) {
      // Log de login bem-sucedido
      await supabase.from('audit_logs').insert({
        user_id: data.user.id,
        event_type: 'login',
        action: 'user_login_success',
        details: {
          email: data.user.email,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });
      
      return { success: true, needsRedirect: true };
    }
    
    return { success: false, error: 'Erro desconhecido no login' };
    
  } catch (error) {
    console.error('❌ Erro no login seguro:', error);
    return { 
      success: false, 
      error: 'Erro interno. Tente novamente.' 
    };
  }
};

/**
 * Implementa registro seguro
 */
export const secureSignUp = async (email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
}> => {
  try {
    // 1. Validações de segurança
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.message };
    }
    
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return { 
        success: false, 
        error: `Senha insegura: ${passwordValidation.issues.join(', ')}` 
      };
    }
    
    // 2. Limpar estado
    cleanupAuthState();
    
    // 3. Fazer registro
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: sanitizeAuthInput(email),
      password
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message.includes('already registered') 
          ? 'Email já cadastrado. Tente fazer login.' 
          : error.message 
      };
    }
    
    if (data.user) {
      return { 
        success: true, 
        needsConfirmation: !data.session 
      };
    }
    
    return { success: false, error: 'Erro no registro' };
    
  } catch (error) {
    console.error('❌ Erro no registro seguro:', error);
    return { 
      success: false, 
      error: 'Erro interno. Tente novamente.' 
    };
  }
};