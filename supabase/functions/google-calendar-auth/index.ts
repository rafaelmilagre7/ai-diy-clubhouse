
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Configurações OAuth2
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const body = await req.json().catch(() => ({}));

    // Gerar URL de autorização do Google
    if (Object.keys(body).length === 0) {
      if (!CLIENT_ID || !REDIRECT_URI) {
        throw new Error('Configuração de autenticação incompleta');
      }

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', SCOPES.join(' '));
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      
      const state = crypto.randomUUID();
      authUrl.searchParams.append('state', state);

      return new Response(
        JSON.stringify({ url: authUrl.toString(), state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trocar código por token
    if (body.code) {
      const code = body.code;
      
      if (!code || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        throw new Error('Dados insuficientes para completar autenticação');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(`Erro ao obter token: ${JSON.stringify(tokenData)}`);
      }

      // Obter informações do usuário
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userInfo = await userInfoResponse.json();

      // Retornar tokens e informações do usuário
      return new Response(
        JSON.stringify({
          ...tokenData,
          user_info: userInfo,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar eventos do calendário
    if (body.access_token) {
      const accessToken = body.access_token;
      
      if (!accessToken) {
        throw new Error('Token de acesso não fornecido');
      }

      const calendarId = encodeURIComponent(body.calendar_id || 'primary');
      const maxResults = body.max_results || 10;
      const timeMin = encodeURIComponent(new Date().toISOString());

      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${maxResults}&timeMin=${timeMin}&orderBy=startTime&singleEvents=true`;

      const eventsResponse = await fetch(eventsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json();
        throw new Error(`Erro ao obter eventos: ${JSON.stringify(errorData)}`);
      }

      const eventsData = await eventsResponse.json();

      return new Response(
        JSON.stringify(eventsData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint não encontrado
    return new Response(
      JSON.stringify({ error: 'Requisição inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função Google Calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
