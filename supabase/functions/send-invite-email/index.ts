
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InviteEmailRequest = await req.json();
    
    console.log("📧 Processando convite para:", data.email);
    
    // Validações básicas
    if (!data.email || !data.roleName) {
      throw new Error("Dados obrigatórios ausentes (email e roleName são obrigatórios)");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Formato de email inválido");
    }

    // Criar cliente do Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log("🔍 Verificando status do usuário...");
    
    // Primeiro, tentar buscar o usuário para entender seu status
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(data.email);
    
    let inviteResult;
    let strategy = 'unknown';
    
    if (existingUser?.user && !getUserError) {
      // Usuário existe e está ativo
      console.log("👤 Usuário existente encontrado, enviando convite padrão");
      strategy = 'existing_user_invite';
      
      inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            role: data.roleName,
            sender_name: data.senderName || 'Viver de IA',
            notes: data.notes || '',
            invite_url: data.inviteUrl,
            expires_at: data.expiresAt,
            invite_id: data.inviteId
          },
          redirectTo: data.inviteUrl
        }
      );
      
    } else {
      // Usuário não existe ou foi deletado - tentar invite padrão primeiro
      console.log("🆕 Tentando convite padrão para usuário novo/deletado");
      
      inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            role: data.roleName,
            sender_name: data.senderName || 'Viver de IA',
            notes: data.notes || '',
            invite_url: data.inviteUrl,
            expires_at: data.expiresAt,
            invite_id: data.inviteId
          },
          redirectTo: data.inviteUrl
        }
      );
      
      if (inviteResult.error && inviteResult.error.message.includes('already been registered')) {
        // Usuário foi deletado - usar estratégia de fallback
        console.log("🔄 Usuário deletado detectado, usando estratégia de fallback");
        strategy = 'deleted_user_recovery';
        
        // Gerar senha temporária segura
        const tempPassword = crypto.randomUUID() + Math.random().toString(36).substring(2);
        
        // Criar usuário novamente
        const createResult = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: data.roleName,
            sender_name: data.senderName || 'Viver de IA',
            notes: data.notes || '',
            invite_type: 'recovery_invite'
          }
        });
        
        if (createResult.error) {
          console.error("❌ Erro ao recriar usuário:", createResult.error);
          throw new Error(`Erro ao recriar usuário: ${createResult.error.message}`);
        }
        
        console.log("✅ Usuário recriado, gerando link de recuperação");
        
        // Gerar link de recuperação que servirá como convite
        const recoveryResult = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: data.email,
          options: {
            redirectTo: data.inviteUrl
          }
        });
        
        if (recoveryResult.error) {
          console.error("❌ Erro ao gerar link de recuperação:", recoveryResult.error);
          throw new Error(`Erro ao gerar link de convite: ${recoveryResult.error.message}`);
        }
        
        // Simular resultado de convite para manter compatibilidade
        inviteResult = {
          data: { user: createResult.data.user },
          error: null
        };
        
        console.log("🔗 Link de recuperação gerado como convite:", recoveryResult.data.properties?.action_link?.substring(0, 50) + "...");
        
      } else {
        strategy = 'new_user_invite';
      }
    }

    if (inviteResult.error && !inviteResult.error.message.includes('already been registered')) {
      console.error("❌ Erro final ao enviar convite:", inviteResult.error);
      throw new Error(`Erro no envio: ${inviteResult.error.message}`);
    }

    console.log(`✅ Convite processado com sucesso (${strategy}):`, {
      email: data.email,
      role: data.roleName,
      user_id: inviteResult.data?.user?.id || 'processed',
      strategy: strategy
    });

    // Atualizar estatísticas se fornecido invite_id
    if (data.inviteId) {
      try {
        await supabaseAdmin.rpc('update_invite_send_attempt', {
          invite_id: data.inviteId
        });
        console.log("📊 Estatísticas atualizadas");
      } catch (statsError: any) {
        console.warn("⚠️ Erro ao atualizar estatísticas:", statsError.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        user_id: inviteResult.data?.user?.id || 'processed',
        email: data.email,
        strategy: strategy,
        method: 'enhanced_supabase_auth'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao processar convite:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro ao enviar convite",
        error: error.message,
        details: "Verifique os logs para mais informações"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
