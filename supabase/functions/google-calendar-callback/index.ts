
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extrair PROJECT_ID de várias fontes possíveis para garantir que sempre tenhamos um valor
function getProjectId(): string {
  // Tentar extrair do PROJECT_ID explícito
  const projectId = Deno.env.get('PROJECT_ID');
  if (projectId) return projectId;
  
  // Tentar extrair de SUPABASE_URL (formato: https://[project-id].supabase.co)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (supabaseUrl) {
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match && match[1]) return match[1];
  }
  
  // Valor padrão se tudo falhar (pode ser substituído por um valor específico do seu projeto)
  return 'zotzvtepvpnkcoobdubt';
}

// Configuração de URLs e IDs do projeto
const PROJECT_ID = getProjectId();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || `https://${PROJECT_ID}.supabase.co`;
const APP_URL = Deno.env.get('APP_URL') || 'https://viverdeia-club.vercel.app';

console.log('Google Calendar Callback function inicializada com sucesso', {
  projectId: PROJECT_ID,
  supabaseUrl: SUPABASE_URL,
  appUrl: APP_URL
});

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
      error: error || 'nenhum',
      projectId: PROJECT_ID,
      supabaseUrl: SUPABASE_URL,
      appUrl: APP_URL
    });
    
    // Se houver erro no callback do OAuth
    if (error) {
      console.error('Erro explícito no callback OAuth:', error);
      const redirectUrl = `${APP_URL}/admin/events?authError=${encodeURIComponent(error)}`;
      console.log('Redirecionando para:', redirectUrl);
      return Response.redirect(redirectUrl);
    }

    // Se não tiver o código ou state, retorna erro
    if (!code || !state) {
      console.error('Parâmetros inválidos no callback:', { code: !!code, state: !!state });
      const redirectUrl = `${APP_URL}/admin/events?authError=${encodeURIComponent('parametros_invalidos')}`;
      console.log('Redirecionando para:', redirectUrl);
      return Response.redirect(redirectUrl);
    }

    console.log('Código e state válidos, redirecionando para a aplicação');
    // Redireciona de volta para a aplicação com os parâmetros necessários
    const redirectUrl = `${APP_URL}/admin/events?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    console.log('Redirecionando para:', redirectUrl);
    return Response.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Erro ao processar callback:', error);
    const redirectUrl = `${APP_URL}/admin/events?authError=${encodeURIComponent('erro_interno')}`;
    console.log('Redirecionando com erro para:', redirectUrl);
    return Response.redirect(redirectUrl);
  }
});
