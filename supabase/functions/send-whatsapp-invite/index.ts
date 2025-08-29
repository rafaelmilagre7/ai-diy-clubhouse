
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppInviteRequest {
  phone: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  email?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const processStartTime = Date.now();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phone, inviteUrl, roleName, expiresAt, senderName, notes, inviteId, email }: WhatsAppInviteRequest = await req.json()

    console.log('🚨 [WHATSAPP-TIMED] Processamento iniciado:', {
      phone: phone?.substring(0, 5) + '***',
      hasInviteUrl: !!inviteUrl,
      roleName,
      timestamp: new Date().toISOString(),
      startTime: processStartTime
    })

    // VALIDAÇÃO RÁPIDA
    if (!phone || !inviteUrl) {
      console.error('❌ [WHATSAPP] Dados obrigatórios faltando:', { phone: !!phone, inviteUrl: !!inviteUrl })
      throw new Error('Telefone e URL do convite são obrigatórios')
    }

    // VERIFICAR CREDENCIAIS - PADRONIZADAS (iguais ao bulk que funciona)
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    console.log('🔑 [ENV-VARS-CHECK] Variáveis de ambiente carregadas:', {
      hasWhatsappToken: !!whatsappToken,
      hasPhoneNumberId: !!phoneNumberId,
      tokenLength: whatsappToken ? whatsappToken.length : 0,
      phoneIdLength: phoneNumberId ? phoneNumberId.length : 0,
      vars_used: 'WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID'
    })

    if (!whatsappToken || !phoneNumberId) {
      console.error('❌ [ENV-VARS-MISSING] Credenciais não configuradas:', {
        WHATSAPP_ACCESS_TOKEN: !!whatsappToken,
        WHATSAPP_PHONE_NUMBER_ID: !!phoneNumberId
      })
      throw new Error('Credenciais WhatsApp não configuradas - verificar WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID')
    }

    // PROCESSAR TELEFONE - FORMATO PADRONIZADO (igual ao bulk que funciona)
    console.log('📱 [PHONE-FORMAT-COMPARISON] Número original recebido:', phone);
    
    // Usar mesma lógica simples do bulk que funciona
    const formattedPhone = phone.replace(/\D/g, '');
    
    console.log('📱 [PHONE-FORMAT-COMPARISON] Número formatado final:', {
      original: phone,
      formatted: formattedPhone,
      length: formattedPhone.length,
      method: 'simple_replace_like_bulk'
    });

    // PREPARAR TEMPLATE
    const userName = email ? email.split('@')[0].replace(/[._-]/g, ' ').trim() : 'Novo Membro'
    
    const templateData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "convitevia",
        language: { code: "pt_BR" },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: userName },
            { type: "text", text: inviteUrl }
          ]
        }]
      }
    }

    console.log('📱 [WHATSAPP-DETAILED] Enviando template:', {
      templateName: 'convitevia',
      templateData: JSON.stringify(templateData, null, 2),
      recipientPhone: formattedPhone,
      phoneNumberId,
      timestamp: new Date().toISOString()
    })

    // ENVIAR COM TIMEOUT OTIMIZADO (10s) + RETRY
    const sendStartTime = Date.now();
    let whatsappResponse;
    let attempt = 0;
    const maxAttempts = 2;
    
    while (attempt < maxAttempts) {
      attempt++;
      const attemptStartTime = Date.now();
      
      console.log(`📱 [WHATSAPP-ATTEMPT-${attempt}] Tentando enviar...`);
      
      const controller = new AbortController();
      const timeout = attempt === 1 ? 10000 : 6000; // 1ª tentativa 10s, 2ª 6s
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        whatsappResponse = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        const attemptDuration = Date.now() - attemptStartTime;
        
        // LOGS DETALHADOS DA RESPOSTA DA API META
        const responseHeaders = {};
        whatsappResponse.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        
        console.log(`📱 [META-API-DETAILED-${attempt}] Resposta completa:`, {
          status: whatsappResponse.status,
          statusText: whatsappResponse.statusText,
          headers: responseHeaders,
          duration: `${attemptDuration}ms`,
          url: whatsappResponse.url,
          templateUsed: 'convitevia'
        });
        
        // Se sucesso, sair do loop
        if (whatsappResponse.ok) {
          break;
        }
        
        // Se erro 4xx, não retry (problema permanente)
        if (whatsappResponse.status >= 400 && whatsappResponse.status < 500) {
          console.log(`❌ [WHATSAPP] Erro 4xx, não fazendo retry: ${whatsappResponse.status}`);
          break;
        }
        
        // Se não é a última tentativa e erro 5xx, continuar
        if (attempt < maxAttempts && whatsappResponse.status >= 500) {
          console.log(`⚠️ [WHATSAPP] Erro 5xx, tentando novamente em 1s: ${whatsappResponse.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const attemptDuration = Date.now() - attemptStartTime;
        
        console.log(`❌ [TIMING-ERROR-${attempt}] Erro na tentativa:`, {
          duration: `${attemptDuration}ms`,
          error: fetchError.message,
          isTimeout: fetchError.name === 'AbortError'
        });
        
        if (fetchError.name === 'AbortError') {
          if (attempt < maxAttempts) {
            console.log(`⏳ [WHATSAPP] Timeout na tentativa ${attempt}, tentando novamente...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            throw new Error(`Timeout na API do WhatsApp após ${maxAttempts} tentativas`);
          }
        }
        
        if (attempt === maxAttempts) {
          throw new Error(`Erro de conectividade após ${maxAttempts} tentativas: ${fetchError.message}`);
        }
        
        // Wait antes do retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const totalSendDuration = Date.now() - sendStartTime;
    console.log(`⏱️ [TIMING-SEND-TOTAL] Envio WhatsApp completo:`, {
      totalDuration: `${totalSendDuration}ms`,
      attempts: attempt,
      success: whatsappResponse?.ok
    });

    const parseStartTime = Date.now();
    const whatsappResult = await whatsappResponse.json();
    const parseDuration = Date.now() - parseStartTime;
    
    // LOGS DETALHADOS DA RESPOSTA JSON
    console.log(`📱 [META-RESPONSE-DETAILED] Resposta JSON completa:`, {
      responseBody: JSON.stringify(whatsappResult, null, 2),
      duration: `${parseDuration}ms`,
      responseOk: whatsappResponse.ok,
      hasMessages: !!whatsappResult.messages,
      hasError: !!whatsappResult.error,
      timestamp: new Date().toISOString()
    });

    if (!whatsappResponse.ok) {
      const errorMsg = `Erro ${whatsappResponse.status}: ${whatsappResult.error?.message || whatsappResult.message || 'Erro desconhecido'}`;
      
      // LOGS CRÍTICOS DE ERRO DA API META
      console.error('🚨 [META-ERROR-CRITICAL] Erro detalhado da API:', {
        httpStatus: whatsappResponse.status,
        httpStatusText: whatsappResponse.statusText,
        errorCode: whatsappResult.error?.code,
        errorSubcode: whatsappResult.error?.error_subcode,
        errorMessage: whatsappResult.error?.message,
        errorType: whatsappResult.error?.type,
        errorDetails: whatsappResult.error?.error_data,
        fullErrorResponse: JSON.stringify(whatsappResult, null, 2),
        templateName: 'convitevia',
        recipientPhone: formattedPhone,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(errorMsg);
    }

    const messageId = whatsappResult.messages?.[0]?.id;
    console.log('✅ [WHATSAPP] Mensagem enviada:', {
      messageId,
      attempts: attempt,
      totalProcessTime: `${Date.now() - processStartTime}ms`
    });

    // ATUALIZAR ESTATÍSTICAS EM BACKGROUND (não aguardar)
    if (inviteId) {
      setTimeout(async () => {
        try {
          await supabase.from('invite_deliveries').insert({
            invite_id: inviteId,
            channel: 'whatsapp',
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_id: messageId,
            metadata: { 
              whatsapp_id: messageId,
              recipient: formattedPhone,
              template: 'convitevia',
              method: 'manual_invite'
            }
          })

          await supabase.rpc('update_invite_send_attempt', {
            invite_id: inviteId
          })

          console.log('✅ [BACKGROUND] Estatísticas atualizadas')
        } catch (statError) {
          console.error('⚠️ [BACKGROUND] Erro ao atualizar:', statError)
        }
      }, 100)
    }

    // RESPOSTA IMEDIATA
    return new Response(JSON.stringify({
      success: true,
      message: 'Convite enviado via WhatsApp com sucesso',
      whatsappId: messageId,
      strategy: 'whatsapp_template',
      method: 'whatsapp_business_api',
      phone: formattedPhone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ [WHATSAPP] Erro:', error)

    return new Response(JSON.stringify({
      success: false,
      message: 'Erro ao enviar convite via WhatsApp',
      error: error.message,
      suggestion: 'Verifique o número de telefone e tente novamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
