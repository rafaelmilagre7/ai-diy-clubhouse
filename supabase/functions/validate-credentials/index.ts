import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CredentialCheck {
  name: string;
  configured: boolean;
  length?: number;
  status: 'ok' | 'missing' | 'invalid';
  message: string;
}

interface ValidationResult {
  overall_status: 'healthy' | 'partial' | 'critical';
  credentials: CredentialCheck[];
  recommendations: string[];
  timestamp: string;
}

const validateCredentials = (): ValidationResult => {
  const credentials: CredentialCheck[] = [];
  const recommendations: string[] = [];

  // WhatsApp Business
  const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN');
  credentials.push({
    name: 'WHATSAPP_BUSINESS_TOKEN',
    configured: !!whatsappToken,
    length: whatsappToken?.length,
    status: whatsappToken && whatsappToken.length > 50 ? 'ok' : 'missing',
    message: whatsappToken && whatsappToken.length > 50 
      ? '✅ Token configurado corretamente' 
      : '❌ Token não configurado ou muito curto'
  });

  const whatsappPhoneId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID');
  credentials.push({
    name: 'WHATSAPP_BUSINESS_PHONE_ID',
    configured: !!whatsappPhoneId,
    length: whatsappPhoneId?.length,
    status: whatsappPhoneId && whatsappPhoneId.length > 10 ? 'ok' : 'missing',
    message: whatsappPhoneId && whatsappPhoneId.length > 10 
      ? '✅ Phone ID configurado corretamente' 
      : '❌ Phone ID não configurado ou inválido'
  });

  const whatsappAccountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID');
  credentials.push({
    name: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
    configured: !!whatsappAccountId,
    length: whatsappAccountId?.length,
    status: whatsappAccountId && whatsappAccountId.length > 10 ? 'ok' : 'missing',
    message: whatsappAccountId && whatsappAccountId.length > 10 
      ? '✅ Account ID configurado corretamente' 
      : '❌ Account ID não configurado ou inválido'
  });

  // Resend
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  credentials.push({
    name: 'RESEND_API_KEY',
    configured: !!resendApiKey,
    length: resendApiKey?.length,
    status: resendApiKey && resendApiKey.length > 20 ? 'ok' : 'missing',
    message: resendApiKey && resendApiKey.length > 20 
      ? '✅ Resend API Key configurada corretamente' 
      : '❌ Resend API Key não configurada ou inválida'
  });

  // Supabase (devem estar sempre presentes)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  credentials.push({
    name: 'SUPABASE_URL',
    configured: !!supabaseUrl,
    length: supabaseUrl?.length,
    status: supabaseUrl ? 'ok' : 'missing',
    message: supabaseUrl ? '✅ Supabase URL configurada' : '❌ Supabase URL não configurada'
  });

  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  credentials.push({
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    configured: !!supabaseServiceKey,
    length: supabaseServiceKey?.length,
    status: supabaseServiceKey && supabaseServiceKey.length > 100 ? 'ok' : 'missing',
    message: supabaseServiceKey && supabaseServiceKey.length > 100 
      ? '✅ Service Role Key configurada' 
      : '❌ Service Role Key não configurada ou inválida'
  });

  // Gerar recomendações
  if (!whatsappToken || !whatsappPhoneId || !whatsappAccountId) {
    recommendations.push('Configure as credenciais do WhatsApp Business nos Edge Function Secrets');
  }

  if (!resendApiKey) {
    recommendations.push('Configure a RESEND_API_KEY nos Edge Function Secrets para envio de emails');
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    recommendations.push('Credenciais do Supabase não encontradas - verifique a configuração da função');
  }

  // Determinar status geral
  const okCount = credentials.filter(c => c.status === 'ok').length;
  const totalCount = credentials.length;
  
  let overallStatus: 'healthy' | 'partial' | 'critical';
  if (okCount === totalCount) {
    overallStatus = 'healthy';
  } else if (okCount >= totalCount / 2) {
    overallStatus = 'partial';
  } else {
    overallStatus = 'critical';
  }

  return {
    overall_status: overallStatus,
    credentials,
    recommendations,
    timestamp: new Date().toISOString()
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Validando credenciais dos Edge Function Secrets...');
    
    const result = validateCredentials();
    
    console.log('📊 Resultado da validação:', {
      status: result.overall_status,
      ok_count: result.credentials.filter(c => c.status === 'ok').length,
      total_count: result.credentials.length
    });

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Erro ao validar credenciais:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Erro interno ao validar credenciais'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

serve(handler);