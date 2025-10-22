import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchSendRequest {
  inviteIds: string[];
  maxRetries?: number;
  parallelBatch?: number;
}

interface InviteResult {
  inviteId: string;
  email: string;
  status: 'success' | 'failed' | 'retrying';
  attempt: number;
  error?: string;
  messageId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 [BATCH-SEND] Iniciando processamento em lote...');

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BatchSendRequest = await req.json();
    const { inviteIds, maxRetries = 3, parallelBatch = 5 } = body;

    console.log(`📊 [BATCH-SEND] Processando ${inviteIds.length} convites em lotes de ${parallelBatch}`);

    const results: InviteResult[] = [];
    const encoder = new TextEncoder();
    
    // Configurar streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Buscar dados dos convites
          const { data: invites, error: fetchError } = await supabase
            .from('invites')
            .select(`
              id,
              email,
              token,
              role_id,
              expires_at,
              notes,
              whatsapp_number,
              preferred_channel,
              user_roles (name)
            `)
            .in('id', inviteIds);

          if (fetchError || !invites) {
            throw new Error('Erro ao buscar convites');
          }

          sendProgress({
            type: 'init',
            total: invites.length,
            timestamp: new Date().toISOString()
          });

          // Processar em lotes paralelos
          for (let i = 0; i < invites.length; i += parallelBatch) {
            const batch = invites.slice(i, i + parallelBatch);
            const batchNumber = Math.floor(i / parallelBatch) + 1;
            const totalBatches = Math.ceil(invites.length / parallelBatch);

            sendProgress({
              type: 'batch_start',
              batch: batchNumber,
              totalBatches,
              size: batch.length,
              timestamp: new Date().toISOString()
            });

            // Processar batch em paralelo com retry
            const batchPromises = batch.map(invite => 
              processInviteWithRetry(supabase, invite, maxRetries, sendProgress)
            );

            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach((result, idx) => {
              if (result.status === 'fulfilled') {
                results.push(result.value);
              } else {
                results.push({
                  inviteId: batch[idx].id,
                  email: batch[idx].email,
                  status: 'failed',
                  attempt: maxRetries,
                  error: result.reason?.message || 'Unknown error'
                });
              }
            });

            sendProgress({
              type: 'batch_complete',
              batch: batchNumber,
              processed: results.length,
              total: invites.length,
              timestamp: new Date().toISOString()
            });
          }

          // Resumo final
          const summary = {
            type: 'complete',
            total: results.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results,
            timestamp: new Date().toISOString()
          };

          sendProgress(summary);
          controller.close();

          console.log('✅ [BATCH-SEND] Processamento concluído:', summary);

        } catch (error: any) {
          console.error('❌ [BATCH-SEND] Erro:', error);
          sendProgress({
            type: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('❌ [BATCH-SEND] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha no processamento em lote'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function processInviteWithRetry(
  supabase: any,
  invite: any,
  maxRetries: number,
  sendProgress: (data: any) => void
): Promise<InviteResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      sendProgress({
        type: 'invite_processing',
        inviteId: invite.id,
        email: invite.email,
        attempt,
        maxRetries,
        timestamp: new Date().toISOString()
      });

      // Chamar process-invite
      const { data, error } = await supabase.functions.invoke('process-invite', {
        body: { inviteId: invite.id }
      });

      if (error) throw error;

      sendProgress({
        type: 'invite_success',
        inviteId: invite.id,
        email: invite.email,
        attempt,
        timestamp: new Date().toISOString()
      });

      return {
        inviteId: invite.id,
        email: invite.email,
        status: 'success',
        attempt,
        messageId: data?.email_id
      };

    } catch (error: any) {
      lastError = error;
      console.error(`❌ [BATCH-SEND] Tentativa ${attempt}/${maxRetries} falhou para ${invite.email}:`, error);

      if (attempt < maxRetries) {
        sendProgress({
          type: 'invite_retry',
          inviteId: invite.id,
          email: invite.email,
          attempt,
          maxRetries,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        // Exponential backoff: 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  sendProgress({
    type: 'invite_failed',
    inviteId: invite.id,
    email: invite.email,
    attempts: maxRetries,
    error: lastError?.message,
    timestamp: new Date().toISOString()
  });

  return {
    inviteId: invite.id,
    email: invite.email,
    status: 'failed',
    attempt: maxRetries,
    error: lastError?.message || 'Unknown error'
  };
}

serve(handler);
