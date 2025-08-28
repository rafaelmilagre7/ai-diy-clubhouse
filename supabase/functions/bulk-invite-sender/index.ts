import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { InviteEmail } from './_templates/invite-email.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkInviteRequest {
  invites: Array<{
    inviteId: string;
    email: string;
    whatsapp_number?: string;
    name: string;
    roleId: string;
  }>;
  expiresIn?: string;
}

interface InviteResult {
  inviteId: string;
  email: string;
  success: boolean;
  error?: string;
  method?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 [BULK-INVITE-SENDER] Processamento iniciado');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const body: BulkInviteRequest = await req.json();
    console.log(`📦 [BULK-INVITE-SENDER] Processando ${body.invites.length} convites`);

    const results: InviteResult[] = [];
    
    // Buscar dados dos convites do banco
    const inviteIds = body.invites.map(inv => inv.inviteId);
    const { data: invitesData, error: invitesError } = await supabase
      .from('invites')
      .select(`
        id,
        token,
        expires_at,
        email,
        whatsapp_number,
        notes,
        role_id,
        user_roles!invites_role_id_fkey(name)
      `)
      .in('id', inviteIds);

    if (invitesError) {
      console.error('❌ [BULK-INVITE-SENDER] Erro ao buscar convites:', invitesError);
      throw invitesError;
    }

    console.log(`✅ [BULK-INVITE-SENDER] ${invitesData.length} convites encontrados no banco`);

    // Processar cada convite sequencialmente (para evitar rate limit)
    for (const inviteRequest of body.invites) {
      const inviteData = invitesData.find(inv => inv.id === inviteRequest.inviteId);
      
      if (!inviteData) {
        results.push({
          inviteId: inviteRequest.inviteId,
          email: inviteRequest.email,
          success: false,
          error: 'Convite não encontrado no banco'
        });
        continue;
      }

      try {
        console.log(`📧 [BULK-INVITE-SENDER] Processando: ${inviteRequest.email}`);

        // Gerar URL do convite
        const inviteUrl = `https://app.viverdeia.ai/convite/${inviteData.token}`;
        
        // Determinar método de envio
        const hasPhone = inviteRequest.whatsapp_number && whatsappToken && whatsappPhoneId;
        const shouldSendWhatsApp = hasPhone;
        
        let emailSent = false;
        let whatsappSent = false;
        let lastError = '';

        // Tentar envio via email
        try {
          const templateData = {
            inviteUrl,
            invitedByName: 'Equipe Viver de IA',
            recipientEmail: inviteRequest.email,
            roleName: inviteData.user_roles?.name || 'membro',
            companyName: 'Viver de IA',
            expiresAt: inviteData.expires_at,
            notes: inviteData.notes || '',
          };

          const emailHtml = await renderAsync(
            React.createElement(InviteEmail, templateData)
          );

          const { data: emailResult, error: emailError } = await resend.emails.send({
            from: 'Viver de IA <convites@viverdeia.ai>',
            to: [inviteRequest.email],
            subject: `🚀 Você foi convidado para a plataforma Viver de IA!`,
            html: emailHtml,
            replyTo: 'suporte@viverdeia.ai',
          });

          if (emailError) {
            console.error(`❌ [BULK-INVITE-SENDER] Erro no email para ${inviteRequest.email}:`, emailError);
            lastError += `Email: ${emailError.message}; `;
          } else {
            emailSent = true;
            console.log(`✅ [BULK-INVITE-SENDER] Email enviado para ${inviteRequest.email}: ${emailResult?.id}`);
            
            // Registrar delivery do email
            await supabase.from('invite_deliveries').insert({
              invite_id: inviteRequest.inviteId,
              channel: 'email',
              status: 'sent',
              provider_id: emailResult?.id,
              sent_at: new Date().toISOString(),
              metadata: {
                resend_id: emailResult?.id,
                recipient: inviteRequest.email,
                template: 'invite-email',
              }
            });
          }
        } catch (emailErr: any) {
          console.error(`❌ [BULK-INVITE-SENDER] Exceção no email para ${inviteRequest.email}:`, emailErr);
          lastError += `Email: ${emailErr.message}; `;
        }

        // Tentar envio via WhatsApp se disponível
        if (shouldSendWhatsApp) {
          try {
            const phoneFormatted = inviteRequest.whatsapp_number!.replace(/\D/g, '');
            
            const whatsappData = {
              messaging_product: "whatsapp",
              to: phoneFormatted,
              type: "template",
              template: {
                name: "convitevia",
                language: { code: "pt_BR" },
                components: [{
                  type: "body",
                  parameters: [
                    { type: "text", text: inviteRequest.name },
                    { type: "text", text: inviteUrl }
                  ]
                }]
              }
            };

            const whatsappResponse = await fetch(
              `https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${whatsappToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(whatsappData),
              }
            );

            const whatsappResult = await whatsappResponse.json();

            if (whatsappResponse.ok && whatsappResult.messages) {
              whatsappSent = true;
              console.log(`✅ [BULK-INVITE-SENDER] WhatsApp enviado para ${phoneFormatted}: ${whatsappResult.messages[0]?.id}`);
              
              // Registrar delivery do WhatsApp
              await supabase.from('invite_deliveries').insert({
                invite_id: inviteRequest.inviteId,
                channel: 'whatsapp',
                status: 'sent',
                provider_id: whatsappResult.messages[0]?.id,
                sent_at: new Date().toISOString(),
                metadata: {
                  whatsapp_id: whatsappResult.messages[0]?.id,
                  recipient: phoneFormatted,
                  template: 'convitevia',
                }
              });
            } else {
              console.error(`❌ [BULK-INVITE-SENDER] Erro no WhatsApp para ${phoneFormatted}:`, whatsappResult);
              lastError += `WhatsApp: ${whatsappResult.error?.message || 'Erro desconhecido'}; `;
            }
          } catch (whatsappErr: any) {
            console.error(`❌ [BULK-INVITE-SENDER] Exceção no WhatsApp:`, whatsappErr);
            lastError += `WhatsApp: ${whatsappErr.message}; `;
          }
        }

        // Atualizar estatísticas do convite
        await supabase
          .from('invites')
          .update({
            send_attempts: 1,
            last_sent_at: new Date().toISOString()
          })
          .eq('id', inviteRequest.inviteId);

        // Determinar resultado
        const success = emailSent || whatsappSent;
        const method = emailSent && whatsappSent ? 'email+whatsapp' : 
                     emailSent ? 'email' : 
                     whatsappSent ? 'whatsapp' : undefined;

        results.push({
          inviteId: inviteRequest.inviteId,
          email: inviteRequest.email,
          success,
          error: success ? undefined : lastError || 'Falha em todos os canais',
          method
        });

        // Rate limiting - pequena pausa entre envios
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (err: any) {
        console.error(`❌ [BULK-INVITE-SENDER] Erro crítico para ${inviteRequest.email}:`, err);
        results.push({
          inviteId: inviteRequest.inviteId,
          email: inviteRequest.email,
          success: false,
          error: err.message || 'Erro desconhecido'
        });
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    console.log(`✅ [BULK-INVITE-SENDER] Processamento concluído:`, summary);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ [BULK-INVITE-SENDER] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha no envio em lote de convites'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);