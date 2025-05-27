
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
    
    console.log("📧 Enviando convite nativo para:", data.email);
    
    // Validações robustas
    if (!data.email || !data.roleName) {
      throw new Error("Dados obrigatórios ausentes");
    }

    // Criar cliente do Supabase com service role para usar admin API
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

    // Usar o método nativo inviteUserByEmail do Supabase
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: {
          // Metadados que serão disponíveis no template de email
          role: data.roleName,
          sender_name: data.senderName || 'Viver de IA',
          notes: data.notes || '',
          invite_url: data.inviteUrl,
          expires_at: data.expiresAt
        },
        redirectTo: data.inviteUrl // URL para onde o usuário será redirecionado após aceitar o convite
      }
    );

    if (inviteError) {
      console.error("❌ Erro ao enviar convite nativo:", inviteError);
      throw new Error(`Erro no envio: ${inviteError.message}`);
    }

    console.log("✅ Convite nativo enviado com sucesso:", {
      email: data.email,
      role: data.roleName,
      user_id: inviteData.user?.id
    });

    // Atualizar estatísticas do convite se o ID foi fornecido
    if (data.inviteId) {
      try {
        const { error: statsError } = await supabaseAdmin.rpc('update_invite_send_attempt', {
          invite_id: data.inviteId
        });
        
        if (statsError) {
          console.warn("⚠️ Erro ao atualizar estatísticas:", statsError);
        }
      } catch (statsError) {
        console.warn("⚠️ Erro ao atualizar estatísticas:", statsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso via Supabase",
        user_id: inviteData.user?.id,
        email: data.email
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao enviar convite nativo:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro ao enviar convite",
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
