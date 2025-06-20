
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📬 [QUEUE-${requestId}] Processando fila de emails...`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const resend = new Resend(apiKey);

    // Buscar emails pendentes na fila
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('retry_after', new Date().toISOString())
      .lt('attempts', 5) // Máximo 5 tentativas
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10); // Processar 10 por vez

    if (fetchError) {
      throw new Error(`Erro ao buscar fila: ${fetchError.message}`);
    }

    if (!queuedEmails || queuedEmails.length === 0) {
      console.log(`📭 [QUEUE-${requestId}] Nenhum email na fila para processar`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhum email na fila para processar",
          processed: 0,
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`📨 [QUEUE-${requestId}] Encontrados ${queuedEmails.length} emails para processar`);

    // Processar cada email
    for (const queuedEmail of queuedEmails) {
      processedCount++;
      const emailId = queuedEmail.id;
      const attemptNumber = queuedEmail.attempts + 1;
      
      console.log(`📧 [QUEUE-${requestId}] Processando email ${emailId} (tentativa ${attemptNumber})`);

      try {
        // Marcar como processando
        await supabase
          .from('email_queue')
          .update({
            status: 'processing',
            attempts: attemptNumber,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', emailId);

        // Tentar enviar o email
        const emailResponse = await resend.emails.send({
          from: "Viver de IA <convites@viverdeia.ai>",
          to: [queuedEmail.email],
          subject: queuedEmail.subject,
          html: queuedEmail.html_content,
          tags: [
            { name: 'type', value: 'queue_retry' },
            { name: 'attempt', value: attemptNumber.toString() },
          ],
        });

        // Marcar como enviado com sucesso
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            external_id: emailResponse.data?.id,
            last_error: null
          })
          .eq('id', emailId);

        // Atualizar convite se tiver invite_id
        if (queuedEmail.invite_id) {
          await supabase.rpc('update_invite_send_attempt', {
            invite_id: queuedEmail.invite_id
          });
        }

        successCount++;
        console.log(`✅ [QUEUE-${requestId}] Email ${emailId} enviado com sucesso`);

      } catch (emailError: any) {
        errorCount++;
        console.error(`❌ [QUEUE-${requestId}] Erro ao enviar email ${emailId}:`, emailError.message);

        // Calcular próximo retry com backoff exponencial
        const nextRetryDelay = Math.min(
          Math.pow(2, attemptNumber) * 60 * 1000, // Exponencial em minutos
          24 * 60 * 60 * 1000 // Máximo 24 horas
        );
        const nextRetry = new Date(Date.now() + nextRetryDelay);

        // Atualizar com erro
        if (attemptNumber >= 5) {
          // Máximo de tentativas atingido
          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              last_error: emailError.message,
              failed_at: new Date().toISOString()
            })
            .eq('id', emailId);
        } else {
          // Reagendar para nova tentativa
          await supabase
            .from('email_queue')
            .update({
              status: 'pending',
              last_error: emailError.message,
              retry_after: nextRetry.toISOString()
            })
            .eq('id', emailId);
        }
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`🏁 [QUEUE-${requestId}] Processamento concluído:`, {
      processed: processedCount,
      success: successCount,
      errors: errorCount,
      responseTime
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processamento concluído: ${successCount} enviados, ${errorCount} erros`,
        processed: processedCount,
        successful: successCount,
        errors: errorCount,
        responseTime,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [QUEUE-${requestId}] Erro crítico no processamento:`, error);
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        processed: processedCount,
        successful: successCount,
        errors: errorCount,
        responseTime,
        requestId
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📬 [EMAIL-QUEUE] Worker de processamento carregado!");
serve(handler);
