/**
 * 🔔 PROCESS EVENT REMINDERS
 * 
 * Edge function para processar lembretes automáticos de eventos:
 * - 24 horas antes do evento
 * - 1 hora antes do evento  
 * - 15 minutos antes (check-in disponível)
 * 
 * Deve ser executada via cron a cada 15 minutos.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderResult {
  reminder_type: string;
  events_processed: number;
  notifications_created: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Process Event Reminders] 🚀 Starting reminder processing...');

  try {
    // Criar cliente Supabase com privilégios de service_role
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

    // Chamar função do banco que processa todos os lembretes
    console.log('[Process Event Reminders] Calling process_event_reminders()...');
    const { data, error } = await supabaseAdmin.rpc('process_event_reminders');

    if (error) {
      console.error('[Process Event Reminders] ❌ Error:', error);
      throw error;
    }

    const results = data as ReminderResult[];
    const totalNotifications = results.reduce((sum, r) => sum + r.notifications_created, 0);
    const totalEvents = results.reduce((sum, r) => sum + r.events_processed, 0);

    const executionTime = Date.now() - startTime;
    
    console.log('[Process Event Reminders] ✅ Processing complete:');
    console.log(`  - Total events processed: ${totalEvents}`);
    console.log(`  - Total notifications created: ${totalNotifications}`);
    console.log(`  - Execution time: ${executionTime}ms`);
    
    results.forEach(result => {
      console.log(`  - ${result.reminder_type}: ${result.events_processed} events, ${result.notifications_created} notifications`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_events: totalEvents,
          total_notifications: totalNotifications,
          execution_time_ms: executionTime
        },
        details: results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Process Event Reminders] 💥 Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
