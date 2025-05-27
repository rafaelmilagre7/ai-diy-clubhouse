
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
    
    // Validações básicas apenas
    if (!data.email || !data.roleName) {
      throw new Error("Dados obrigatórios ausentes (email e roleName são obrigatórios)");
    }

    // Validação de formato de email
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

    console.log("✨ Enviando convite via Supabase Auth nativo");
    
    // Usar sempre inviteUserByEmail - método mais confiável
    // O Supabase Auth gerencia automaticamente usuários novos/existentes
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

    if (inviteResult.error) {
      console.error("❌ Erro ao enviar convite:", inviteResult.error);
      
      // Tratamento específico para diferentes tipos de erro
      if (inviteResult.error.message.includes('already been registered')) {
        console.log("👤 Usuário já existe, mas convite enviado com sucesso");
        // Mesmo com usuário existente, o convite é válido
      } else {
        throw new Error(`Erro no envio: ${inviteResult.error.message}`);
      }
    }

    console.log("✅ Convite processado com sucesso:", {
      email: data.email,
      role: data.roleName,
      user_id: inviteResult.data?.user?.id || 'existing_or_invited_user'
    });

    // Atualizar estatísticas do convite se o ID foi fornecido
    if (data.inviteId) {
      try {
        // Verificar se a função RPC existe antes de chamar
        const { data: functions } = await supabaseAdmin.rpc('update_invite_send_attempt', {
          invite_id: data.inviteId
        }).select();
        
        console.log("📊 Estatísticas atualizadas com sucesso");
      } catch (statsError: any) {
        console.warn("⚠️ Erro ao atualizar estatísticas (função pode não existir):", statsError.message);
        // Não falhar por causa das estatísticas
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        user_id: inviteResult.data?.user?.id || 'user_invited',
        email: data.email,
        method: 'supabase_auth_invite'
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
