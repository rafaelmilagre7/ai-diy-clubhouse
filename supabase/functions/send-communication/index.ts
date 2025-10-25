
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCommunicationRequest {
  communicationId: string;
}

// Helper para gerar template de email
const getEmailTemplate = (content: string, templateType: string, priority: string, title: string) => {
  const priorityColors = {
    urgent: '#dc2626',
    high: '#ea580c',
    normal: '#2563eb',
    low: '#6b7280'
  };

  const templateTypeIcons = {
    announcement: '📢',
    maintenance: '🔧',
    event: '📅',
    educational: '📚',
    urgent: '🚨'
  };

  const priorityColor = priorityColors[priority as keyof typeof priorityColors] || '#2563eb';
  const icon = templateTypeIcons[templateType as keyof typeof templateTypeIcons] || '📢';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Viver de IA</h1>
          </div>
          <div style="padding: 15px 20px; background-color: ${priorityColor}; color: white; text-align: center;">
            <span style="font-size: 16px;">${icon}</span>
            <span style="font-weight: bold; margin-left: 8px; text-transform: uppercase; font-size: 12px;">
              ${priority === 'urgent' ? 'URGENTE' : priority === 'high' ? 'ALTA PRIORIDADE' : 'COMUNICADO'}
            </span>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-top: 0;">${title}</h2>
            ${content}
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">Comunicado oficial - Viver de IA</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Helper para retry com exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[SEND-COMM] ⚠️ Tentativa ${attempt}/${maxRetries} falhou, aguardando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

const handler = async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  console.log(`[SEND-COMM][${requestId}] 🚀 Iniciando execução`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Timeout de 30s
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: Operação excedeu 30 segundos')), 30000);
  });

  const executionPromise = (async () => {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { communicationId }: SendCommunicationRequest = await req.json();
      
      console.log(`[SEND-COMM][${requestId}] 📬 Processing communication: ${communicationId}`);

      // Buscar a comunicação
      const { data: communication, error: commError } = await supabase
        .from('admin_communications')
        .select('*')
        .eq('id', communicationId)
        .single();

      if (commError || !communication) {
        console.error(`[SEND-COMM][${requestId}] ❌ Comunicação não encontrada: ${commError?.message}`);
        throw new Error('Comunicação não encontrada');
      }

      if (communication.status !== 'draft' && communication.status !== 'scheduled') {
        console.warn(`[SEND-COMM][${requestId}] ⚠️ Status inválido: ${communication.status}`);
        throw new Error('Comunicação já foi enviada ou cancelada');
      }

      console.log(`[SEND-COMM][${requestId}] 📊 Target roles: ${communication.target_roles.join(', ')}`);

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
        console.error(`[SEND-COMM][${requestId}] ❌ Erro ao buscar usuários: ${usersError.message}`);
        throw new Error('Erro ao buscar usuários: ' + usersError.message);
      }
      
      console.log(`[SEND-COMM][${requestId}] 👥 Encontrados ${users.length} usuários`);

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
            // Inicializar Resend
            const resendApiKey = Deno.env.get("RESEND_API_KEY");
            if (!resendApiKey) {
              throw new Error("RESEND_API_KEY não configurada");
            }
            
            const resend = new Resend(resendApiKey);
            const emailHtml = getEmailTemplate(
              communication.content,
              communication.template_type,
              communication.priority,
              communication.title
            );

            // Enviar email com retry automático
            const emailResult = await retryWithBackoff(async () => {
              const response = await resend.emails.send({
                from: "Viver de IA <onboarding@resend.dev>",
                to: [user.email],
                subject: communication.email_subject || communication.title,
                html: emailHtml,
              });
              
              if (response.error) {
                throw new Error(response.error.message);
              }
              
              return response;
            }, 3, 1000);

            console.log(`[SEND-COMM][${requestId}] ✅ Email enviado para: ${user.email}`);

            deliveries.push({
              communication_id: communication.id,
              user_id: user.id,
              delivery_channel: 'email',
              status: 'delivered',
              error_message: null
            });

          } catch (emailError) {
            console.error(`[SEND-COMM][${requestId}] ❌ Falha ao enviar email para ${user.email}:`, emailError);
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
          console.error(`[SEND-COMM][${requestId}] ❌ Erro ao criar notificações:`, notifError);
        } else {
          console.log(`[SEND-COMM][${requestId}] 📲 ${notifications.length} notificações criadas`);
        }
      }

      // Inserir registros de entrega
      if (deliveries.length > 0) {
        const { error: deliveriesError } = await supabase
          .from('communication_deliveries')
          .insert(deliveries);

        if (deliveriesError) {
          console.error(`[SEND-COMM][${requestId}] ❌ Erro ao registrar entregas:`, deliveriesError);
        } else {
          console.log(`[SEND-COMM][${requestId}] 📝 ${deliveries.length} entregas registradas`);
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
        console.error(`[SEND-COMM][${requestId}] ❌ Erro ao atualizar status:`, updateError);
        throw new Error('Erro ao atualizar status da comunicação: ' + updateError.message);
      }

      const executionTime = Date.now() - startTime;
      const stats = {
        total_users: users.length,
        notifications_sent: notifications.length,
        emails_sent: deliveries.filter(d => d.delivery_channel === 'email' && d.status === 'delivered').length,
        failed_emails: deliveries.filter(d => d.delivery_channel === 'email' && d.status === 'failed').length,
        execution_time_ms: executionTime
      };

      console.log(`[SEND-COMM][${requestId}] ✅ Concluído em ${executionTime}ms - Stats:`, stats);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Comunicação enviada com sucesso',
          stats
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`[SEND-COMM][${requestId}] ❌ Erro após ${executionTime}ms:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return new Response(
        JSON.stringify({ 
          error: error.message,
          request_id: requestId,
          execution_time_ms: executionTime
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  })();

  try {
    return await Promise.race([executionPromise, timeoutPromise]);
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error(`[SEND-COMM][${requestId}] 💥 Fatal error após ${executionTime}ms:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        request_id: requestId,
        execution_time_ms: executionTime
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
