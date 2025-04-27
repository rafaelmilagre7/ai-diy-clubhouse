
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL fixa para redirecionamento - crucial para evitar problemas de "Project not specified"
const APP_URL = 'https://viverdeia-club.vercel.app';

console.log('Google Calendar Callback function loaded and initialized');

serve(async (req) => {
  console.log('===== Google Calendar Callback: Requisição recebida =====');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  
  try {
    // Verificar se é uma requisição OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      console.log('Requisição OPTIONS detectada, retornando cabeçalhos CORS');
      return new Response(null, { headers: corsHeaders });
    }

    // Função específica para receber o callback do Google OAuth2
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    console.log('Parâmetros recebidos:', { 
      code: code ? '[código presente]' : 'ausente',
      state: state || 'ausente', 
      error: error || 'nenhum'
    });
    
    // Se houver erro no callback do OAuth
    if (error) {
      console.error('Erro explícito no callback OAuth:', error);
      return Response.redirect(`${APP_URL}/admin/events?authError=${encodeURIComponent(error)}`);
    }

    // Se não tiver o código ou state, retorna erro
    if (!code || !state) {
      console.error('Parâmetros inválidos no callback:', { code: !!code, state: !!state });
      return Response.redirect(`${APP_URL}/admin/events?authError=${encodeURIComponent('parametros_invalidos')}`);
    }

    console.log('Código e state válidos, redirecionando para a aplicação');
    // Redireciona de volta para a aplicação com os parâmetros necessários
    return Response.redirect(`${APP_URL}/admin/events?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
    
  } catch (error) {
    console.error('Erro ao processar callback:', error);
    return Response.redirect(`${APP_URL}/admin/events?authError=${encodeURIComponent('erro_interno')}`);
  }
});
