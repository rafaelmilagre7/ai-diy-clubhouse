
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCommunicationRequest {
  communicationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { communicationId }: SendCommunicationRequest = await req.json();

    // Buscar a comunicação
    const { data: communication, error: commError } = await supabase
      .from('admin_communications')
      .select('*')
      .eq('id', communicationId)
      .single();

    if (commError || !communication) {
      throw new Error('Comunicação não encontrada');
    }

    if (communication.status !== 'draft' && communication.status !== 'scheduled') {
      throw new Error('Comunicação já foi enviada ou cancelada');
    }

    // Buscar usuários dos roles alvo
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        user_roles!inner(name)
      `)
      .in('user_roles.name', communication.target_roles);

    if (usersError) {
      throw new Error('Erro ao buscar usuários: ' + usersError.message);
    }

    const deliveries = [];
    const notifications = [];

    // Processar cada usuário
    for (const user of users) {
      // Verificar preferências de notificação
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Criar notificação in-app se habilitada
      if (communication.delivery_channels.includes('notification') && 
          (!preferences || preferences.admin_communications_inapp !== false)) {
        notifications.push({
          user_id: user.id,
          type: 'admin_communication',
          title: communication.title,
          message: communication.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
          data: {
            communication_id: communication.id,
            template_type: communication.template_type,
            priority: communication.priority
          }
        });

        deliveries.push({
          communication_id: communication.id,
          user_id: user.id,
          delivery_channel: 'notification',
          status: 'delivered'
        });
      }

      // Enviar email se habilitado
      if (communication.delivery_channels.includes('email') && 
          (!preferences || preferences.admin_communications_email !== false)) {
        
        try {
          // Enviar email via função separada
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-communication-email', {
            body: {
              to: user.email,
              name: user.name,
              subject: communication.email_subject || communication.title,
              content: communication.content,
              templateType: communication.template_type,
              priority: communication.priority
            }
          });

          deliveries.push({
            communication_id: communication.id,
            user_id: user.id,
            delivery_channel: 'email',
            status: emailError ? 'failed' : 'delivered',
            error_message: emailError?.message || null
          });

        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
          deliveries.push({
            communication_id: communication.id,
            user_id: user.id,
            delivery_channel: 'email',
            status: 'failed',
            error_message: (emailError as Error).message
          });
        }
      }
    }

    // Inserir notificações in-app
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Erro ao criar notificações:', notifError);
      }
    }

    // Inserir registros de entrega
    if (deliveries.length > 0) {
      const { error: deliveriesError } = await supabase
        .from('communication_deliveries')
        .insert(deliveries);

      if (deliveriesError) {
        console.error('Erro ao registrar entregas:', deliveriesError);
      }
    }

    // Atualizar status da comunicação
    const { error: updateError } = await supabase
      .from('admin_communications')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', communication.id);

    if (updateError) {
      throw new Error('Erro ao atualizar status da comunicação: ' + updateError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Comunicação enviada com sucesso',
        stats: {
          total_users: users.length,
          notifications_sent: notifications.length,
          emails_sent: deliveries.filter(d => d.delivery_channel === 'email' && d.status === 'delivered').length,
          failed_emails: deliveries.filter(d => d.delivery_channel === 'email' && d.status === 'failed').length
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-communication function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
