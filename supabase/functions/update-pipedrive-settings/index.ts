import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !authData.user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles!inner(name)
      `)
      .eq('id', authData.user.id)
      .single();

    if (!profile || (profile.user_roles as any)?.name !== 'admin') {
      throw new Error('Acesso negado - apenas administradores podem alterar configurações');
    }

    const { token, domain } = await req.json();

    if (!token) {
      throw new Error('Token do Pipedrive é obrigatório');
    }

    console.log('🔧 Atualizando configurações do Pipedrive...');
    console.log('Token fornecido:', !!token);
    console.log('Domínio fornecido:', domain || 'Não informado');

    // Validar token antes de salvar
    let validationUrl: string;
    if (domain && domain.trim() !== '') {
      validationUrl = `https://${domain.trim()}.pipedrive.com/api/v1/users/me?api_token=${token}`;
      console.log('🏢 Testando com domínio personalizado:', domain);
    } else {
      validationUrl = `https://api.pipedrive.com/v1/users/me?api_token=${token}`;
      console.log('🏢 Testando com API padrão');
    }

    const validationResponse = await fetch(validationUrl);
    const validationData = await validationResponse.json();

    if (!validationResponse.ok || !validationData.success) {
      console.error('❌ Validação falhou:', validationData);
      throw new Error(
        validationData.error_info || 
        'Token inválido ou problema de conectividade com Pipedrive'
      );
    }

    console.log('✅ Token validado com sucesso');
    console.log('Conta encontrada:', validationData.data?.name || 'N/A');

    // Aqui normalmente atualizaríamos os secrets via API do Supabase
    // Como não temos acesso direto, vamos simular o processo e retornar instruções
    
    const result = {
      success: true,
      message: 'Configurações validadas com sucesso',
      validation: {
        token_valid: true,
        account_name: validationData.data?.name,
        company_id: validationData.data?.company_id,
        domain_used: domain || 'api.pipedrive.com',
        test_timestamp: new Date().toISOString()
      },
      instructions: {
        pipedrive_api_token: token,
        pipedrive_company_domain: domain || null,
        next_steps: [
          'Token validado com sucesso',
          'Configurações prontas para atualização',
          'Execute a atualização dos secrets no Supabase Dashboard'
        ]
      }
    };

    // Log da operação
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authData.user.id,
        event_type: 'settings_update',
        action: 'pipedrive_config_update',
        details: {
          domain_provided: !!domain,
          token_validated: true,
          account_name: validationData.data?.name,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});