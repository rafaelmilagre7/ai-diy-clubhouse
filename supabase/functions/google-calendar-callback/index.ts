
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Configurações OAuth2
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || 'https://viverdeia-club.functions.supabase.co/google-calendar-callback';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Verificar se é uma requisição OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Função específica para receber o callback do Google OAuth2
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  // Extrair a origem da aplicação para fazer o redirecionamento
  // Usamos o origin da URL da requisição como fallback
  const appOrigin = url.origin;

  console.log('Google Calendar Callback recebido:', { 
    code: code ? '[código presente]' : 'ausente', 
    state, 
    error,
    origin: appOrigin
  });

  // Se houver erro no callback do OAuth
  if (error) {
    console.error('Erro no callback OAuth:', error);
    // Redirecionar para a página admin com parâmetro de erro
    return Response.redirect(`${appOrigin}/admin/events?authError=${encodeURIComponent(error)}`);
  }

  // Se não tiver o código ou state, retorna erro
  if (!code || !state) {
    console.error('Parâmetros inválidos no callback:', { code: !!code, state: !!state });
    return Response.redirect(`${appOrigin}/admin/events?authError=parametros_invalidos`);
  }

  try {
    // Redireciona de volta para a aplicação com os parâmetros necessários
    return Response.redirect(`${appOrigin}/admin/events?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
  } catch (error) {
    console.error('Erro ao processar callback:', error);
    return Response.redirect(`${appOrigin}/admin/events?authError=${encodeURIComponent('erro_interno')}`);
  }
});
