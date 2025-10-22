/**
 * 📝 EVENT REGISTER
 * 
 * Edge function para gerenciar inscrições em eventos:
 * - Inscrever usuário em evento
 * - Cancelar inscrição
 * - Fazer check-in
 * - Validar vagas disponíveis
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: 'register' | 'cancel' | 'checkin';
  event_id: string;
  cancellation_reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter token do usuário
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { authorization: authHeader }
        }
      }
    );

    // Validar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body: RequestBody = await req.json();
    const { action, event_id, cancellation_reason } = body;

    console.log(`[Event Register] Action: ${action}, Event: ${event_id}, User: ${user.id}`);

    // Buscar informações do evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, max_participants, current_participants, status, start_time')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Validar status do evento
    if (event.status !== 'scheduled' && action === 'register') {
      throw new Error('Event is not available for registration');
    }

    // Executar ação
    let result;

    switch (action) {
      case 'register': {
        // Validar se há vagas disponíveis
        if (event.max_participants && event.current_participants >= event.max_participants) {
          throw new Error('Event is full');
        }

        // Verificar se já está inscrito
        const { data: existing } = await supabase
          .from('event_registrations')
          .select('id, status')
          .eq('event_id', event_id)
          .eq('user_id', user.id)
          .single();

        if (existing && existing.status === 'confirmed') {
          throw new Error('Already registered');
        }

        // Criar inscrição
        const { data: registration, error: regError } = await supabase
          .from('event_registrations')
          .insert({
            event_id,
            user_id: user.id,
            status: 'confirmed',
            registration_date: new Date().toISOString()
          })
          .select()
          .single();

        if (regError) throw regError;

        result = {
          action: 'registered',
          registration_id: registration.id,
          event: {
            id: event.id,
            title: event.title,
            start_time: event.start_time
          },
          message: 'Successfully registered for the event'
        };

        console.log(`[Event Register] ✅ User ${user.id} registered for event ${event_id}`);
        break;
      }

      case 'cancel': {
        // Atualizar inscrição para cancelada
        const { data: cancelled, error: cancelError } = await supabase
          .from('event_registrations')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason
          })
          .eq('event_id', event_id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (cancelError) throw cancelError;

        result = {
          action: 'cancelled',
          registration_id: cancelled.id,
          message: 'Registration cancelled successfully'
        };

        console.log(`[Event Register] ❌ User ${user.id} cancelled registration for event ${event_id}`);
        break;
      }

      case 'checkin': {
        // Fazer check-in
        const now = new Date();
        const startTime = new Date(event.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60); // minutos

        // Permitir check-in apenas 30 minutos antes até 2 horas depois do início
        if (timeDiff > 30 || timeDiff < -120) {
          throw new Error('Check-in not available at this time');
        }

        const { data: checkin, error: checkinError } = await supabase
          .from('event_registrations')
          .update({
            check_in_at: now.toISOString(),
            status: 'attended'
          })
          .eq('event_id', event_id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (checkinError) throw checkinError;

        result = {
          action: 'checkin',
          registration_id: checkin.id,
          check_in_at: now.toISOString(),
          message: 'Check-in successful'
        };

        console.log(`[Event Register] ✅ User ${user.id} checked in for event ${event_id}`);
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[Event Register] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400,
      }
    );
  }
});
