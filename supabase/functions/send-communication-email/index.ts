
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  name: string;
  subject: string;
  content: string;
  templateType: string;
  priority: string;
}

const getEmailTemplate = (content: string, templateType: string, priority: string) => {
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
        <title>Comunicado - Viver de IA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Viver de IA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Comunicado da Plataforma</p>
          </div>
          
          <!-- Priority Badge -->
          <div style="padding: 15px 20px; background-color: ${priorityColor}; color: white; text-align: center;">
            <span style="font-size: 16px;">${icon}</span>
            <span style="font-weight: bold; margin-left: 8px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              ${priority === 'urgent' ? 'URGENTE' : 
                priority === 'high' ? 'ALTA PRIORIDADE' : 
                priority === 'normal' ? 'COMUNICADO' : 'INFORMATIVO'}
            </span>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              Este é um comunicado oficial da plataforma Viver de IA.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
              Se você não deseja mais receber estes comunicados, 
              <a href="#" style="color: #667eea; text-decoration: none;">clique aqui para alterar suas preferências</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, subject, content, templateType, priority }: EmailRequest = await req.json();

    const emailHtml = getEmailTemplate(content, templateType, priority);

    const emailResponse = await resend.emails.send({
      from: "Viver de IA <comunicados@viverdeia.ai>",
      to: [to],
      subject: subject,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'admin_communication' },
        { name: 'template_type', value: templateType },
        { name: 'priority', value: priority },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: "Email enviado com sucesso" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-communication-email function:", error);
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
