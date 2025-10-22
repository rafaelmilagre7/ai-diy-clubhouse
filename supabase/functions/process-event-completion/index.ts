/**
 * 🎓 PROCESS EVENT COMPLETION
 * 
 * Edge function para processar pós-evento:
 * - Marcar eventos como completos
 * - Gerar certificados (se aplicável)
 * - Enviar pesquisa de satisfação
 * - Recomendar próximos eventos
 * 
 * Deve ser executada via cron a cada hora para eventos que já terminaram.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Event {
  id: string;
  title: string;
  end_time: string;
  certificate_template_id: string | null;
}

interface Registration {
  user_id: string;
  event_id: string;
  check_in_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Process Event Completion] 🎓 Starting post-event processing...');

  try {
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

    // 1️⃣ Buscar eventos que terminaram nas últimas 2 horas e ainda não foram processados
    const { data: completedEvents, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('id, title, end_time, certificate_template_id')
      .eq('status', 'scheduled')
      .lt('end_time', new Date().toISOString())
      .gt('end_time', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    if (eventsError) throw eventsError;

    if (!completedEvents || completedEvents.length === 0) {
      console.log('[Process Event Completion] ℹ️ No events to process');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No events to process',
          events_processed: 0,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Process Event Completion] Found ${completedEvents.length} events to process`);

    let totalNotifications = 0;
    let certificatesGenerated = 0;

    for (const event of completedEvents as Event[]) {
      console.log(`[Process Event Completion] Processing event: ${event.title}`);

      // 2️⃣ Marcar evento como completo
      await supabaseAdmin
        .from('events')
        .update({ status: 'completed' })
        .eq('id', event.id);

      // 3️⃣ Buscar participantes que fizeram check-in
      const { data: attendees, error: attendeesError } = await supabaseAdmin
        .from('event_registrations')
        .select('user_id, event_id, check_in_at')
        .eq('event_id', event.id)
        .not('check_in_at', 'is', null);

      if (attendeesError) {
        console.error(`[Process Event Completion] Error fetching attendees: ${attendeesError.message}`);
        continue;
      }

      // Atualizar status dos participantes para 'attended'
      if (attendees && attendees.length > 0) {
        await supabaseAdmin
          .from('event_registrations')
          .update({ status: 'attended' })
          .eq('event_id', event.id)
          .not('check_in_at', 'is', null);

        console.log(`[Process Event Completion] ${attendees.length} attendees marked as attended`);
      }

      // 4️⃣ Gerar certificados (se aplicável)
      if (event.certificate_template_id && attendees && attendees.length > 0) {
        const { data: certificates, error: certError } = await supabaseAdmin
          .from('solution_certificates')
          .insert(
            (attendees as Registration[]).map(att => ({
              user_id: att.user_id,
              solution_id: event.id,
              certificate_type: 'event_participation',
              metadata: {
                event_id: event.id,
                event_title: event.title,
                completion_date: new Date().toISOString(),
                check_in_time: att.check_in_at
              }
            }))
          )
          .select('id, user_id');

        if (!certError && certificates) {
          certificatesGenerated += certificates.length;
          
          // Notificar sobre certificados disponíveis
          const certNotifications = certificates.map(cert => ({
            user_id: cert.user_id,
            type: 'event_certificate_ready',
            title: '🎓 Certificado disponível',
            message: `Seu certificado de participação em "${event.title}" está pronto!`,
            category: 'events',
            priority: 2,
            action_url: `/certificates/${cert.id}`,
            reference_id: event.id,
            reference_type: 'event',
            metadata: {
              event_id: event.id,
              certificate_id: cert.id
            }
          }));

          const { error: certNotifsError } = await supabaseAdmin
            .from('notifications')
            .insert(certNotifications);

          if (!certNotifsError) {
            totalNotifications += certNotifications.length;
          }
        }
      }

      // 5️⃣ Enviar pesquisa de satisfação para todos os inscritos
      const { data: allRegistrations, error: allRegsError } = await supabaseAdmin
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', event.id)
        .eq('status', 'attended');

      if (!allRegsError && allRegistrations && allRegistrations.length > 0) {
        const surveyNotifications = allRegistrations.map(reg => ({
          user_id: reg.user_id,
          type: 'event_feedback_request',
          title: '📝 Avalie o evento',
          message: `Conte-nos como foi sua experiência em "${event.title}"`,
          category: 'events',
          priority: 1,
          action_url: `/events/${event.id}/feedback`,
          reference_id: event.id,
          reference_type: 'event',
          metadata: {
            event_id: event.id,
            event_title: event.title
          }
        }));

        const { error: surveyNotifsError } = await supabaseAdmin
          .from('notifications')
          .insert(surveyNotifications);

        if (!surveyNotifsError) {
          totalNotifications += surveyNotifications.length;
        }
      }

      // 6️⃣ Recomendar próximos eventos similares
      // (aqui poderia usar IA para recomendar eventos baseados em tags, categoria, etc)
      const { data: nextEvents, error: nextEventsError } = await supabaseAdmin
        .from('events')
        .select('id, title, start_time')
        .eq('status', 'scheduled')
        .gt('start_time', new Date().toISOString())
        .limit(1);

      if (!nextEventsError && nextEvents && nextEvents.length > 0 && allRegistrations && allRegistrations.length > 0) {
        const recommendationNotifications = allRegistrations.map(reg => ({
          user_id: reg.user_id,
          type: 'event_recommendation',
          title: '💡 Eventos que você pode gostar',
          message: `Baseado em sua participação em "${event.title}", recomendamos: "${nextEvents[0].title}"`,
          category: 'events',
          priority: 1,
          action_url: `/events/${nextEvents[0].id}`,
          reference_id: nextEvents[0].id,
          reference_type: 'event',
          metadata: {
            recommended_event_id: nextEvents[0].id,
            source_event_id: event.id,
            recommendation_type: 'post_event'
          }
        }));

        const { error: recoNotifsError } = await supabaseAdmin
          .from('notifications')
          .insert(recommendationNotifications);

        if (!recoNotifsError) {
          totalNotifications += recommendationNotifications.length;
        }
      }

      console.log(`[Process Event Completion] ✅ Event "${event.title}" processed successfully`);
    }

    const executionTime = Date.now() - startTime;

    console.log('[Process Event Completion] 🎉 Processing complete:');
    console.log(`  - Events processed: ${completedEvents.length}`);
    console.log(`  - Certificates generated: ${certificatesGenerated}`);
    console.log(`  - Notifications sent: ${totalNotifications}`);
    console.log(`  - Execution time: ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        events_processed: completedEvents.length,
        certificates_generated: certificatesGenerated,
        notifications_sent: totalNotifications,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Process Event Completion] 💥 Fatal error:', error);
    
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
