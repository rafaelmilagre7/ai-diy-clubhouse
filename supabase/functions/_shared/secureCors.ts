/**
 * 🔒 CONFIGURAÇÃO CORS SEGURA
 * Bloqueia origens arbitrárias e permite apenas domínios confiáveis
 * 
 * FIX: CORS (Cross-Origin Resource Sharing) - Confiança em Origem Arbitrária
 * CVSS 3.1: 8.2 (Alta)
 */

const ALLOWED_ORIGINS = [
  'https://app.viverdeia.ai',
  'https://viverdeia.ai',
  // Ambiente de desenvolvimento
  ...(Deno.env.get('ENVIRONMENT') === 'development' || Deno.env.get('DEV_MODE') === 'true'
    ? [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
      ]
    : []),
];

/**
 * Gera headers CORS seguros baseados na origem da requisição
 * Retorna origin validada ou null se não confiável
 */
export const getSecureCorsHeaders = (request: Request) => {
  const origin = request.headers.get('origin');
  
  // Validar se a origem está na whitelist
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  
  // Se origem não é confiável, bloquear CORS
  const allowedOrigin = isAllowedOrigin ? origin : 'null';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Allow-Credentials': 'true', // Permitir cookies apenas de origens confiáveis
    'Access-Control-Max-Age': '86400', // Cache por 24h
  };
};

/**
 * Valida se a origem da requisição é confiável
 */
export const isOriginAllowed = (request: Request): boolean => {
  const origin = request.headers.get('origin');
  return origin ? ALLOWED_ORIGINS.includes(origin) : false;
};

/**
 * Retorna resposta de erro para origens não confiáveis
 */
export const forbiddenOriginResponse = () => {
  return new Response(
    JSON.stringify({ 
      error: 'Origin not allowed',
      message: 'This request is not authorized from your origin' 
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'null', // Bloquear explicitamente
      },
    }
  );
};

// Manter compatibilidade com código legado (DEPRECADO - usar getSecureCorsHeaders)
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.viverdeia.ai',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
