
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/app';

export interface InviteValidationResult {
  isValid: boolean;
  error?: string;
  needsLogout?: boolean;
  invite?: any;
  suggestions?: string[];
  debugInfo?: any;
}

export const validateInviteToken = async (
  token: string,
  currentUserEmail?: string
): Promise<InviteValidationResult> => {
  try {
    console.log("🔍 [VALIDATION] Validando token de convite:", token.substring(0, 8) + "***");

    if (!token) {
      await logValidationAttempt(token, false, "Token de convite não fornecido");
      return {
        isValid: false,
        error: "Token de convite não fornecido"
      };
    }

    // Limpar o token (remover espaços, caracteres especiais)
    const cleanToken = token.trim().replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '');
    
    console.log(`🔍 [VALIDATION] Token limpo: ${cleanToken.substring(0, 8)}*** (comprimento: ${cleanToken.length})`);

    // Usar a nova função SQL melhorada
    const { data: invites, error: inviteError } = await supabase
      .rpc('validate_invite_token_enhanced', { p_token: cleanToken });

    if (inviteError) {
      console.error("❌ [VALIDATION] Erro ao buscar convite:", inviteError);
      await logValidationAttempt(cleanToken, false, `Erro SQL: ${inviteError.message}`);
      return {
        isValid: false,
        error: "Erro ao verificar convite no sistema",
        debugInfo: { sqlError: inviteError.message }
      };
    }

    const invite = invites?.[0];

    if (!invite) {
      console.log("❌ [VALIDATION] Convite não encontrado com função melhorada");
      
      // Fallback: busca manual direta para debug
      const { data: debugInvites, error: debugError } = await supabase
        .from('invites')
        .select('*')
        .or(`token.ilike.%${cleanToken.substring(0, 6)}%,token.ilike.%${token.substring(0, 6)}%`)
        .limit(5);

      const debugInfo = {
        originalToken: token,
        cleanToken: cleanToken,
        tokenLength: cleanToken.length,
        foundSimilar: debugInvites?.length || 0,
        similarTokens: debugInvites?.map(inv => ({
          tokenPreview: inv.token?.substring(0, 8) + '***',
          expired: new Date(inv.expires_at) < new Date(),
          used: !!inv.used_at
        })) || []
      };

      await logValidationAttempt(cleanToken, false, "Convite não encontrado ou inválido");
      
      return {
        isValid: false,
        error: "Convite não encontrado ou inválido",
        suggestions: [
          "Verifique se o link do convite está correto",
          "Certifique-se de que está usando o link completo",
          "Entre em contato com quem enviou o convite"
        ],
        debugInfo
      };
    }

    // Verificar se já foi usado
    if (invite.used_at) {
      console.log("❌ [VALIDATION] Convite já utilizado:", invite.used_at);
      await logValidationAttempt(cleanToken, false, `Convite já utilizado em ${invite.used_at}`);
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
      await logValidationAttempt(cleanToken, false, `Convite expirado em ${invite.expires_at}`);
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
      
      await logValidationAttempt(cleanToken, false, `Conflito de email: usuário logado como ${currentUserEmail}, convite para ${invite.email}`);
      
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
      
      await logValidationAttempt(cleanToken, false, `Perfil já existe para ${invite.email}`);
      
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
    await logValidationAttempt(cleanToken, true, "Convite validado com sucesso");
    
    return {
      isValid: true,
      invite
    };

  } catch (error) {
    console.error("❌ [VALIDATION] Erro inesperado:", error);
    await logValidationAttempt(token, false, `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
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

// Função auxiliar para registrar tentativas de validação
const logValidationAttempt = async (
  token: string,
  success: boolean,
  errorMessage?: string
): Promise<void> => {
  try {
    // Remover temporariamente o log para evitar problemas de constraint
    // await supabase.rpc('log_invite_validation_attempt', {
    //   p_token: token,
    //   p_success: success,
    //   p_error_message: errorMessage
    // });
    console.log(`📊 [VALIDATION-LOG] Token: ${token.substring(0, 4)}***, Success: ${success}, Error: ${errorMessage || 'N/A'}`);
  } catch (error) {
    // Falhar silenciosamente para não quebrar o fluxo principal
    console.warn("⚠️ [VALIDATION] Erro ao registrar log:", error);
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

// Função para gerar URLs de convite padronizadas
export const generateInviteUrl = (token: string): string => {
  if (!token) {
    console.error("❌ [URL-GENERATION] Token vazio");
    return "";
  }
  
  // Limpar o token
  const cleanToken = token.trim().replace(/\s+/g, '');
  
  // Usar sempre o domínio configurado (app.viverdeia.ai em produção)
  const inviteUrl = APP_CONFIG.getAppUrl(`/convite/${encodeURIComponent(cleanToken)}`);
  
  console.log("🔗 [URL-GENERATION] URL gerada:", inviteUrl);
  return inviteUrl;
};
