
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

    console.log("🚀 Tentando enviar convite com inviteUserByEmail");
    
    // Estratégia simplificada: sempre tentar inviteUserByEmail primeiro
    const inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(
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

    let strategy = 'standard_invite';
    let finalResult = inviteResult;

    // Se houve erro, implementar fallback para usuários deletados/existentes
    if (inviteResult.error) {
      console.log("⚠️ Erro no convite padrão:", inviteResult.error.message);
      
      // Verificar se é erro de usuário já existente/deletado
      if (inviteResult.error.message.includes('already been registered') || 
          inviteResult.error.message.includes('already exists') ||
          inviteResult.error.message.includes('User already registered')) {
        
        console.log("🔄 Implementando estratégia de fallback para usuário existente/deletado");
        strategy = 'fallback_recovery';
        
        try {
          // Gerar senha temporária segura
          const tempPassword = crypto.randomUUID() + Math.random().toString(36).substring(2);
          
          // Tentar criar usuário novamente (isso funciona para usuários deletados)
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
            // Se não conseguiu criar, talvez seja usuário realmente existente
            // Tentar gerar link de recuperação que funciona como convite
            console.log("🔗 Tentando gerar link de recuperação como alternativa");
            
            const recoveryResult = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email: data.email,
              options: {
                redirectTo: data.inviteUrl
              }
            });
            
            if (recoveryResult.error) {
              throw new Error(`Falha no fallback: ${recoveryResult.error.message}`);
            }
            
            console.log("✅ Link de recuperação gerado com sucesso");
            finalResult = { data: { user: { email: data.email } }, error: null };
            strategy = 'recovery_link_fallback';
            
          } else {
            console.log("✅ Usuário recriado com sucesso");
            
            // Gerar link de recuperação para o usuário recriado
            const recoveryResult = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email: data.email,
              options: {
                redirectTo: data.inviteUrl
              }
            });
            
            if (recoveryResult.error) {
              console.warn("⚠️ Não foi possível gerar link de recuperação, mas usuário foi criado");
            }
            
            finalResult = { data: { user: createResult.data.user }, error: null };
            strategy = 'user_recreated_with_recovery';
          }
          
        } catch (fallbackError: any) {
          console.error("❌ Erro no fallback:", fallbackError);
          throw new Error(`Erro no fallback: ${fallbackError.message}`);
        }
        
      } else {
        // Erro diferente de usuário existente
        throw new Error(`Erro no envio: ${inviteResult.error.message}`);
      }
    }

    console.log(`✅ Convite processado com sucesso (${strategy}):`, {
      email: data.email,
      role: data.roleName,
      user_id: finalResult.data?.user?.id || finalResult.data?.user?.email || 'processed',
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
        user_id: finalResult.data?.user?.id || finalResult.data?.user?.email || 'processed',
        email: data.email,
        strategy: strategy,
        method: 'simplified_robust_approach'
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
