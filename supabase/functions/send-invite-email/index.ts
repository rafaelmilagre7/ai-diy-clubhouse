
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
    
    // Validações robustas
    if (!data.email || !data.roleName) {
      throw new Error("Dados obrigatórios ausentes (email e roleName são obrigatórios)");
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

    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.getUserById(data.email);
    
    if (checkError && !checkError.message.includes('User not found')) {
      console.error("❌ Erro ao verificar usuário existente:", checkError);
      throw new Error(`Erro ao verificar usuário: ${checkError.message}`);
    }

    let inviteResult;
    
    if (existingUser && existingUser.user) {
      // Usuário já existe - enviar email customizado de convite
      console.log("👤 Usuário já existe, enviando convite personalizado");
      
      // Simular envio de convite personalizado usando o template de recuperação
      inviteResult = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: data.email,
        options: {
          redirectTo: data.inviteUrl,
          data: {
            role: data.roleName,
            sender_name: data.senderName || 'Viver de IA',
            notes: data.notes || '',
            invite_url: data.inviteUrl,
            expires_at: data.expiresAt,
            existing_user: true
          }
        }
      });
      
      if (inviteResult.error) {
        console.error("❌ Erro ao gerar link de convite:", inviteResult.error);
        throw new Error(`Erro ao gerar convite: ${inviteResult.error.message}`);
      }
      
    } else {
      // Usuário não existe - usar o método nativo inviteUserByEmail
      console.log("✨ Novo usuário, enviando convite nativo");
      
      inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            role: data.roleName,
            sender_name: data.senderName || 'Viver de IA',
            notes: data.notes || '',
            invite_url: data.inviteUrl,
            expires_at: data.expiresAt,
            existing_user: false
          },
          redirectTo: data.inviteUrl
        }
      );

      if (inviteResult.error) {
        console.error("❌ Erro ao enviar convite nativo:", inviteResult.error);
        throw new Error(`Erro no envio: ${inviteResult.error.message}`);
      }
    }

    console.log("✅ Convite processado com sucesso:", {
      email: data.email,
      role: data.roleName,
      user_id: inviteResult.data?.user?.id || 'existing_user'
    });

    // Atualizar estatísticas do convite se o ID foi fornecido
    if (data.inviteId) {
      try {
        const { error: statsError } = await supabaseAdmin.rpc('update_invite_send_attempt', {
          invite_id: data.inviteId
        });
        
        if (statsError) {
          console.warn("⚠️ Erro ao atualizar estatísticas:", statsError);
        } else {
          console.log("📊 Estatísticas atualizadas com sucesso");
        }
      } catch (statsError) {
        console.warn("⚠️ Erro ao atualizar estatísticas:", statsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        user_id: inviteResult.data?.user?.id || 'existing_user',
        email: data.email,
        method: existingUser ? 'custom_link' : 'native_invite'
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
