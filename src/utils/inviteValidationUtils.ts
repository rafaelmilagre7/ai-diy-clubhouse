
import { supabase } from '@/lib/supabase';

export interface InviteValidationResult {
  isValid: boolean;
  error?: string;
  needsLogout?: boolean;
  invite?: any;
  suggestions?: string[];
}

export const validateInviteToken = async (
  token: string,
  currentUserEmail?: string
): Promise<InviteValidationResult> => {
  try {
    console.log("🔍 [VALIDATION] Validando token de convite:", token.substring(0, 8) + "***");

    if (!token) {
      return {
        isValid: false,
        error: "Token de convite não fornecido"
      };
    }

    // Buscar convite - corrigir a consulta para evitar array na propriedade role
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select(`
        id,
        email,
        expires_at,
        used_at,
        role_id,
        created_at,
        role:user_roles!role_id(name)
      `)
      .eq('token', token)
      .maybeSingle();

    if (inviteError) {
      console.error("❌ [VALIDATION] Erro ao buscar convite:", inviteError);
      return {
        isValid: false,
        error: "Erro ao verificar convite no sistema"
      };
    }

    if (!invite) {
      console.log("❌ [VALIDATION] Convite não encontrado");
      return {
        isValid: false,
        error: "Convite não encontrado ou inválido",
        suggestions: [
          "Verifique se o link do convite está correto",
          "Entre em contato com quem enviou o convite"
        ]
      };
    }

    // Verificar se já foi usado
    if (invite.used_at) {
      console.log("❌ [VALIDATION] Convite já utilizado:", invite.used_at);
      return {
        isValid: false,
        error: `Este convite já foi utilizado em ${new Date(invite.used_at).toLocaleString('pt-BR')}`,
        suggestions: [
          "Se você já criou uma conta, tente fazer login",
          "Se não foi você quem usou, entre em contato com o administrador"
        ]
      };
    }

    // Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    
    if (expiresAt < now) {
      console.log("❌ [VALIDATION] Convite expirado:", invite.expires_at);
      return {
        isValid: false,
        error: `Este convite expirou em ${expiresAt.toLocaleString('pt-BR')}`,
        suggestions: [
          "Solicite um novo convite ao administrador",
          "Verifique se existe um convite mais recente em seu email"
        ]
      };
    }

    // Verificar conflito de usuário logado
    if (currentUserEmail && currentUserEmail !== invite.email) {
      console.log("⚠️ [VALIDATION] Conflito de email:", {
        usuarioLogado: currentUserEmail,
        convitePara: invite.email
      });
      
      return {
        isValid: false,
        error: `Você está logado como ${currentUserEmail}, mas este convite é para ${invite.email}`,
        needsLogout: true,
        invite,
        suggestions: [
          "Faça logout da conta atual",
          "Use o convite correto para seu email",
          "Entre em contato se recebeu o convite errado"
        ]
      };
    }

    // Verificar se já existe perfil ativo
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, name, created_at')
      .eq('email', invite.email)
      .maybeSingle();

    if (existingProfile) {
      console.log("⚠️ [VALIDATION] Perfil já existe:", existingProfile);
      
      const profileCreatedAt = new Date(existingProfile.created_at);
      const timeDiff = Math.abs(now.getTime() - profileCreatedAt.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return {
        isValid: false,
        error: `Já existe uma conta ativa para ${invite.email} (criada há ${daysDiff} dias)`,
        suggestions: [
          "Tente fazer login com sua senha",
          "Use a opção 'Esqueci minha senha' se necessário",
          "Entre em contato com o suporte se não lembra de ter criado a conta"
        ]
      };
    }

    console.log("✅ [VALIDATION] Convite válido para:", invite.email);
    
    return {
      isValid: true,
      invite
    };

  } catch (error) {
    console.error("❌ [VALIDATION] Erro inesperado:", error);
    return {
      isValid: false,
      error: "Erro interno ao validar convite",
      suggestions: [
        "Tente recarregar a página",
        "Verifique sua conexão com a internet",
        "Entre em contato com o suporte se o problema persistir"
      ]
    };
  }
};

export const preventInviteConflicts = async (
  userEmail: string,
  inviteEmail: string
): Promise<{ shouldProceed: boolean; message?: string }> => {
  if (userEmail === inviteEmail) {
    return { shouldProceed: true };
  }

  return {
    shouldProceed: false,
    message: `Você está logado como ${userEmail}, mas este convite é para ${inviteEmail}. Faça logout primeiro.`
  };
};

export const getInviteSecurityRecommendations = () => {
  return [
    "Sempre faça logout antes de usar um convite para outro email",
    "Verifique se o email do convite está correto",
    "Use navegação privada/incógnita para evitar conflitos de sessão",
    "Não compartilhe links de convite com outras pessoas",
    "Entre em contato com o administrador se encontrar problemas"
  ];
};
