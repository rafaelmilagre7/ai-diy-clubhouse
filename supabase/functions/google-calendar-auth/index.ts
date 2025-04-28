
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função robusta para extrair PROJECT_ID de várias fontes possíveis
function getProjectId(): string {
  console.log('Obtendo PROJECT_ID de variáveis de ambiente');
  
  // Primeiro, tentar extrair do SUPABASE_PROJECT_ID explícito (prioridade máxima)
  const projectIdFromEnv = Deno.env.get('SUPABASE_PROJECT_ID');
  if (projectIdFromEnv) {
    console.log(`SUPABASE_PROJECT_ID encontrado: ${projectIdFromEnv}`);
    return projectIdFromEnv;
  }
  
  // Tentar extrair de PROJECT_ID (compatibilidade)
  const projectId = Deno.env.get('PROJECT_ID');
  if (projectId) {
    console.log(`PROJECT_ID encontrado: ${projectId}`);
    return projectId;
  }
  
  // Tentar extrair de SUPABASE_URL (formato: https://[project-id].supabase.co)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (supabaseUrl) {
    console.log(`SUPABASE_URL encontrado: ${supabaseUrl}`);
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match && match[1]) {
      console.log(`PROJECT_ID extraído de SUPABASE_URL: ${match[1]}`);
      return match[1];
    }
  }
  
  // Valor padrão do projeto
  const defaultProjectId = 'zotzvtepvpnkcoobdubt';
  console.log(`ATENÇÃO: Usando PROJECT_ID padrão: ${defaultProjectId}`);
  return defaultProjectId;
}

// Verificar se todas as variáveis de ambiente necessárias estão configuradas
function verificarVariaveisAmbiente(): { valido: boolean; mensagens: string[] } {
  const mensagens: string[] = [];
  const variaveis = [
    { nome: 'GOOGLE_CLIENT_ID', valor: Deno.env.get('GOOGLE_CLIENT_ID') },
    { nome: 'GOOGLE_CLIENT_SECRET', valor: Deno.env.get('GOOGLE_CLIENT_SECRET') },
    { nome: 'GOOGLE_REDIRECT_URI', valor: Deno.env.get('GOOGLE_REDIRECT_URI') },
    { nome: 'SUPABASE_URL', valor: Deno.env.get('SUPABASE_URL') },
    { nome: 'SUPABASE_SERVICE_ROLE_KEY', valor: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') },
    { nome: 'APP_URL', valor: Deno.env.get('APP_URL') },
  ];

  variaveis.forEach(v => {
    if (!v.valor) {
      mensagens.push(`Variável de ambiente '${v.nome}' não definida.`);
    }
  });

  return {
    valido: mensagens.length === 0,
    mensagens
  };
}

// Configuração de URLs e IDs do projeto
const PROJECT_ID = getProjectId();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const APP_URL = Deno.env.get('APP_URL') || 'https://viverdeia-club.vercel.app';

// Configurações OAuth2 do Google
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || 'https://viverdeia-club.functions.supabase.co/google-calendar-callback';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Inicializar cliente Supabase sem persistência de sessão
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

console.log('Google Calendar Auth function inicializada com sucesso', {
  projectId: PROJECT_ID,
  supabaseUrl: SUPABASE_URL,
  redirectUri: REDIRECT_URI,
  appUrl: APP_URL,
  hasClientId: !!CLIENT_ID,
  hasClientSecret: !!CLIENT_SECRET,
});

// Verificação de ambiente na inicialização
const ambienteCheck = verificarVariaveisAmbiente();
if (!ambienteCheck.valido) {
  console.error('ERRO DE CONFIGURAÇÃO: Variáveis de ambiente ausentes:', ambienteCheck.mensagens);
}

serve(async (req) => {
  console.log('===== Google Calendar Auth: Requisição recebida =====');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  
  try {
    // Verificar se é uma requisição OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      console.log('Requisição OPTIONS detectada, retornando cabeçalhos CORS');
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    console.log('Dados da requisição:', { 
      url: url.toString(), 
      body: Object.keys(body).length > 0 ? '[dados presentes]' : '[corpo vazio]',
      projectId: PROJECT_ID,
      redirectUri: REDIRECT_URI
    });

    // Verificar novamente as variáveis de ambiente
    if (!ambienteCheck.valido) {
      throw new Error(`Configuração incompleta: ${ambienteCheck.mensagens.join(', ')}`);
    }

    // Gerar URL de autorização do Google
    if (Object.keys(body).length === 0) {
      if (!CLIENT_ID || !REDIRECT_URI) {
        throw new Error('Configuração de autenticação incompleta: CLIENT_ID ou REDIRECT_URI não configurados');
      }

      console.log('Gerando URL de autorização com redirect URI:', REDIRECT_URI);

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', SCOPES.join(' '));
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      
      const state = crypto.randomUUID();
      authUrl.searchParams.append('state', state);

      console.log('Auth URL gerada:', authUrl.toString());

      return new Response(
        JSON.stringify({ url: authUrl.toString(), state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trocar código por token
    if (body.code) {
      const code = body.code;
      
      if (!code || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        const missingParams = [];
        if (!code) missingParams.push('code');
        if (!CLIENT_ID) missingParams.push('CLIENT_ID');
        if (!CLIENT_SECRET) missingParams.push('CLIENT_SECRET');
        if (!REDIRECT_URI) missingParams.push('REDIRECT_URI');
        
        throw new Error(`Dados insuficientes para completar autenticação: ${missingParams.join(', ')}`);
      }

      console.log('Trocando código por token:', { 
        code: typeof code === 'string' ? (code.substring(0, 10) + '...') : 'formato inválido',
        redirect_uri: REDIRECT_URI 
      });

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
        console.error('Erro na resposta do token:', tokenData);
        throw new Error(`Erro ao obter token: ${JSON.stringify(tokenData)}`);
      }

      console.log('Token obtido com sucesso: ', {
        access_token: tokenData.access_token ? 'presente' : 'ausente',
        refresh_token: tokenData.refresh_token ? 'presente' : 'ausente',
        expires_in: tokenData.expires_in
      });

      // Obter informações do usuário
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userInfo = await userInfoResponse.json();
      console.log('Informações do usuário obtidas:', {
        email: userInfo.email,
        name: userInfo.name
      });

      // Retornar tokens e informações do usuário
      return new Response(
        JSON.stringify({
          ...tokenData,
          user_info: userInfo,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Renovação de token
    if (body.refresh_token && body.grant_type === 'refresh_token') {
      const refreshToken = body.refresh_token;
      
      console.log('Renovando token com refresh_token');

      if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('CLIENT_ID ou CLIENT_SECRET não configurados para renovação de token');
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      
      if (!refreshResponse.ok) {
        console.error('Erro na renovação do token:', refreshData);
        throw new Error(`Erro ao renovar token: ${JSON.stringify(refreshData)}`);
      }

      console.log('Token renovado com sucesso: ', {
        access_token: refreshData.access_token ? 'presente' : 'ausente',
        expires_in: refreshData.expires_in
      });
      
      // Preservar o refresh_token original caso a API não o devolva
      if (!refreshData.refresh_token) {
        refreshData.refresh_token = refreshToken;
      }

      return new Response(
        JSON.stringify(refreshData),
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
      const maxResults = body.max_results || 30; // Aumentado para 30 eventos
      
      // Definir o período para buscar eventos (próximos 12 meses)
      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(today.getFullYear() + 1);
      
      const timeMin = encodeURIComponent(today.toISOString());
      const timeMax = encodeURIComponent(nextYear.toISOString());

      console.log('Buscando eventos com parâmetros:', { 
        calendarId, 
        maxResults, 
        timeMin, 
        timeMax 
      });

      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${maxResults}&timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`;

      console.log('URL de eventos:', eventsUrl);

      const eventsResponse = await fetch(eventsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json();
        console.error('Erro na resposta de eventos:', errorData);
        throw new Error(`Erro ao obter eventos: ${JSON.stringify(errorData)}`);
      }

      const eventsData = await eventsResponse.json();
      console.log(`Eventos encontrados: ${eventsData.items?.length || 0}`);

      return new Response(
        JSON.stringify(eventsData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint não encontrado
    return new Response(
      JSON.stringify({ 
        error: 'Requisição inválida', 
        message: 'Endpoint não encontrado ou método não suportado'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função Google Calendar Auth:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: {
          project_id: PROJECT_ID,
          redirect_uri: REDIRECT_URI,
          has_client_id: !!CLIENT_ID,
          has_client_secret: !!CLIENT_SECRET,
          config_status: ambienteCheck,
          supabase_url: SUPABASE_URL
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
