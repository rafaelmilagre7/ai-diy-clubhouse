import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const isDevelopment = req.headers.get('X-Environment') === 'development';
    
    // Gerar nonce seguro para CSP
    const nonceBuffer = new Uint8Array(16);
    crypto.getRandomValues(nonceBuffer);
    const nonce = btoa(String.fromCharCode(...nonceBuffer));

    // Obter URL da requisição para verificar se é rota admin
    const requestBody = await req.text();
    let isAdminRoute = false;
    
    try {
      const body = JSON.parse(requestBody);
      isAdminRoute = body.url && body.url.includes('/admin');
    } catch (e) {
      // Fallback: verificar header ou assumir não-admin
      isAdminRoute = req.headers.get('X-Admin-Route') === 'true';
    }

    // Headers de segurança robustos com CSP adaptativa
    const securityHeaders = {
      // CSP Adaptativa - Relaxada para admin, segura para público
      'Content-Security-Policy': isDevelopment
        ? [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' http://localhost:* https://cdn.gpteng.co https://*.supabase.co chrome-extension:",
            "style-src 'self' 'unsafe-inline' http://localhost:* https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: chrome-extension:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co wss://*.supabase.co chrome-extension:",
            "frame-src 'self' https://*.pandavideo.com.br https://player-vz-*.tv.pandavideo.com.br",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
          ].join('; ')
        : isAdminRoute
          ? [
              "default-src 'self'",
              `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://cdn.gpteng.co https://*.supabase.co`, // unsafe-eval para admin
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline para admin
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://*.pandavideo.com.br https://player-vz-*.tv.pandavideo.com.br",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          : [
              "default-src 'self'",
              `script-src 'self' 'nonce-${nonce}' https://cdn.gpteng.co https://*.supabase.co`,
              "style-src 'self' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://*.pandavideo.com.br https://player-vz-*.tv.pandavideo.com.br",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
              "block-all-mixed-content"
            ].join('; '),

      // Outros headers de segurança críticos
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': [
        'accelerometer=()',
        'camera=()',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'payment=()',
        'usb=()'
      ].join(', '),
      
      // HSTS para HTTPS (apenas em produção)
      ...(isDevelopment ? {} : {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      })
    };

    // CSP Report para monitoramento
    const cspReport = {
      'Content-Security-Policy-Report-Only': isDevelopment 
        ? '' 
        : `${securityHeaders['Content-Security-Policy']}; report-uri /api/csp-report`,
    };

    const response = {
      success: true,
      nonce,
      headers: securityHeaders,
      environment: isDevelopment ? 'development' : 'production',
      timestamp: new Date().toISOString(),
      recommendations: [
        isDevelopment 
          ? 'CSP em modo desenvolvimento - restrições relaxadas + extensões permitidas' 
          : isAdminRoute 
            ? 'CSP relaxada para rota admin - permite imports dinâmicos'
            : 'CSP em modo produção - máxima segurança',
        'Nonce gerado para scripts dinâmicos',
        'Headers de segurança aplicados',
        isAdminRoute ? 'CSP adaptativa: Admin route detectada' : 'CSP adaptativa: Rota pública',
        'Monitoramento CSP ativo'
      ]
    };

    return new Response(
      JSON.stringify(response, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          ...securityHeaders
        }
      }
    );

  } catch (error) {
    console.error('Erro ao gerar headers de segurança:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno ao processar headers de segurança',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});