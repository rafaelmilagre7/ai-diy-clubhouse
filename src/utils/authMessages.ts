/**
 * Sistema centralizado de mensagens de autenticação
 * 
 * Este arquivo contém todas as mensagens de erro e sucesso relacionadas à autenticação,
 * garantindo consistência e clareza nas mensagens exibidas aos usuários.
 * 
 * @see https://supabase.com/docs/reference/javascript/auth-error
 */

interface AuthErrorResponse {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

/**
 * Mapeia erros do Supabase para mensagens claras e contextuais em português
 * 
 * @param error - Objeto de erro retornado pelo Supabase
 * @returns Objeto com título, mensagem e tipo do erro
 * 
 * @example
 * ```typescript
 * const errorInfo = getAuthErrorMessage(error);
 * showError(errorInfo.title, errorInfo.message);
 * ```
 */
export const getAuthErrorMessage = (error: any): AuthErrorResponse => {
  const errorMessage = error?.message || '';
  const errorStatus = error?.status;
  
  // Credenciais inválidas
  if (errorMessage.includes('Invalid login credentials') || 
      errorMessage.includes('Invalid credentials')) {
    return {
      title: 'Credenciais inválidas',
      message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
      type: 'error'
    };
  }
  
  // Usuário não encontrado
  if (errorMessage.includes('User not found') || 
      errorMessage.includes('user_not_found')) {
    return {
      title: 'Usuário não encontrado',
      message: 'Não encontramos uma conta com este email. Verifique o email ou cadastre-se.',
      type: 'warning'
    };
  }
  
  // Email não confirmado
  if (errorMessage.includes('Email not confirmed') || 
      errorMessage.includes('email_not_confirmed')) {
    return {
      title: 'Email não confirmado',
      message: 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.',
      type: 'warning'
    };
  }
  
  // Muitas tentativas
  if (errorMessage.includes('Too many requests') || 
      errorMessage.includes('rate_limit') ||
      errorStatus === 429) {
    return {
      title: 'Muitas tentativas',
      message: 'Você fez muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
      type: 'warning'
    };
  }
  
  // Email inválido
  if (errorMessage.includes('Invalid email') || 
      errorMessage.includes('invalid_email')) {
    return {
      title: 'Email inválido',
      message: 'O formato do email está incorreto. Verifique e tente novamente.',
      type: 'error'
    };
  }
  
  // Senha fraca
  if (errorMessage.includes('Weak password') || 
      errorMessage.includes('password_too_weak')) {
    return {
      title: 'Senha muito fraca',
      message: 'Escolha uma senha mais forte com letras, números e caracteres especiais.',
      type: 'warning'
    };
  }
  
  // Erro de rede
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') ||
      errorMessage.includes('NetworkError')) {
    return {
      title: 'Erro de conexão',
      message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
      type: 'error'
    };
  }
  
  // Timeout
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('timed out')) {
    return {
      title: 'Tempo esgotado',
      message: 'A conexão demorou muito. Verifique sua internet e tente novamente.',
      type: 'error'
    };
  }
  
  // Erro genérico
  return {
    title: 'Erro ao fazer login',
    message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    type: 'error'
  };
};

/**
 * Mensagens de sucesso padronizadas para operações de autenticação
 */
export const AUTH_SUCCESS_MESSAGES = {
  LOGIN: {
    title: 'Login realizado',
    message: 'Bem-vindo de volta!',
  },
  LOGOUT: {
    title: 'Logout realizado',
    message: 'Você foi desconectado com sucesso.',
  },
  SIGNUP: {
    title: 'Cadastro realizado',
    message: 'Conta criada com sucesso! Verifique seu email.',
  },
  PASSWORD_RESET: {
    title: 'Email enviado',
    message: 'Enviamos um link de recuperação para seu email.',
  },
} as const;
