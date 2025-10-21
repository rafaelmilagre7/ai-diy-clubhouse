import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkInviteRequest {
  invites: Array<{
    inviteId: string;
    email: string;
    whatsapp_number?: string;
    roleId: string;
    channel?: 'email' | 'whatsapp' | 'both';
    expiresIn?: string;
    notes?: string;
  }>;
  senderName?: string;
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
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        
        // Determinar método de envio baseado no channel do convite
        const channel = inviteRequest.channel || 'email';
        const hasPhone = inviteRequest.whatsapp_number && whatsappToken && whatsappPhoneId;
        const shouldSendEmail = channel === 'email' || channel === 'both';
        const shouldSendWhatsApp = (channel === 'whatsapp' || channel === 'both') && hasPhone;
        
        let emailSent = false;
        let whatsappSent = false;
        let lastError = '';

        // Tentar envio via Email se configurado  
        if (shouldSendEmail) {
          try {
            console.log(`📧 [BULK-INVITE-SENDER] Enviando email para: ${inviteRequest.email}`);
            
            // Invocar a função send-invite-email (mesma que o envio individual usa)
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invite-email', {
              body: {
                email: inviteRequest.email,
                inviteUrl,
                roleName: inviteData.user_roles?.name || 'membro',
                expiresAt: inviteData.expires_at,
                senderName: inviteRequest.email.split('@')[0],
                notes: inviteRequest.notes,
                inviteId: inviteRequest.inviteId
              }
            });

            // Verificar se houve erro na chamada da função
            if (emailError) {
              console.error(`❌ [BULK-INVITE-SENDER] Erro ao invocar função para ${inviteRequest.email}:`, emailError);
              lastError += `Email: ${emailError.message}; `;
            } 
            // Verificar se a resposta indica sucesso
            else if (emailData?.success) {
              emailSent = true;
              console.log(`✅ [BULK-INVITE-SENDER] Email enviado com sucesso para ${inviteRequest.email} (ID: ${emailData.messageId})`);
              
              // NÃO registrar delivery aqui - send-invite-email já faz isso em background
            } 
            // Resposta sem sucesso
            else {
              console.error(`❌ [BULK-INVITE-SENDER] Falha no envio para ${inviteRequest.email}:`, emailData);
              lastError += `Email: ${emailData?.error || 'Erro desconhecido'}; `;
            }
          } catch (emailException: any) {
            console.error(`❌ [BULK-INVITE-SENDER] Exceção ao enviar email:`, emailException);
            lastError += `Email: ${emailException.message || 'Exceção desconhecida'}; `;
          }
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
                    { type: "text", text: inviteRequest.email.split('@')[0] },
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