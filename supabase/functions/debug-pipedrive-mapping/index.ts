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
    const pipedriveToken = Deno.env.get('PIPEDRIVE_API_TOKEN');
    
    if (!pipedriveToken) {
      return new Response(
        JSON.stringify({ error: 'PIPEDRIVE_API_TOKEN não configurado' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Iniciando mapeamento COMPLETO do Pipedrive...');

    // 1. Buscar informações da conta
    const accountResponse = await fetch('https://api.pipedrive.com/v1/users/me', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const accountData = await accountResponse.json();
    console.log('🏢 Informações da conta:', accountData);

    // 2. Buscar todos os pipelines
    const pipelinesResponse = await fetch('https://api.pipedrive.com/v1/pipelines', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const pipelinesData = await pipelinesResponse.json();
    console.log('📊 Pipelines encontrados:', pipelinesData.data?.length || 0);

    // 3. Buscar TODOS os stages de TODOS os pipelines
    const allStages = [];
    let insideSalesPipeline = null;
    let qualificadoStage = null;
    
    if (pipelinesData.success && pipelinesData.data) {
      for (const pipeline of pipelinesData.data) {
        const stagesResponse = await fetch(`https://api.pipedrive.com/v1/stages?pipeline_id=${pipeline.id}`, {
          headers: { 'Authorization': `Bearer ${pipedriveToken}` }
        });
        const stagesData = await stagesResponse.json();
        
        if (stagesData.success && stagesData.data) {
          const pipelineStages = stagesData.data.map((stage: any) => ({
            ...stage,
            pipeline_name: pipeline.name,
            pipeline_id: pipeline.id
          }));
          allStages.push(...pipelineStages);
          
          // Verificar se é o pipeline Inside Sales
          if (pipeline.name === 'Inside Sales') {
            insideSalesPipeline = pipeline;
            qualificadoStage = pipelineStages.find((stage: any) => stage.name === 'Qualificado');
          }
        }
      }
    }
    console.log('📈 Total de stages encontrados:', allStages.length);

    // 4. Buscar TODOS os campos personalizados de deals
    const dealFieldsResponse = await fetch('https://api.pipedrive.com/v1/dealFields', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const dealFieldsData = await dealFieldsResponse.json();
    console.log('🏷️ Campos de deals:', dealFieldsData.data?.length || 0);

    // 5. Buscar TODOS os campos de pessoas
    const personFieldsResponse = await fetch('https://api.pipedrive.com/v1/personFields', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const personFieldsData = await personFieldsResponse.json();
    console.log('👤 Campos de pessoas:', personFieldsData.data?.length || 0);

    // 6. Buscar todos os usuários
    const usersResponse = await fetch('https://api.pipedrive.com/v1/users', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const usersData = await usersResponse.json();
    console.log('👥 Usuários disponíveis:', usersData.data?.length || 0);

    // 7. Buscar tipos de atividades
    const activityTypesResponse = await fetch('https://api.pipedrive.com/v1/activityTypes', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const activityTypesData = await activityTypesResponse.json();
    console.log('📅 Tipos de atividades:', activityTypesData.data?.length || 0);

    // 8. Buscar organizações (amostra)
    const organizationsResponse = await fetch('https://api.pipedrive.com/v1/organizations?limit=10', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const organizationsData = await organizationsResponse.json();
    console.log('🏢 Organizações (amostra):', organizationsData.data?.length || 0);

    // 9. Buscar produtos (se existirem)
    const productsResponse = await fetch('https://api.pipedrive.com/v1/products?limit=10', {
      headers: { 'Authorization': `Bearer ${pipedriveToken}` }
    });
    const productsData = await productsResponse.json();
    console.log('🛍️ Produtos (amostra):', productsData.data?.length || 0);

    // Compilar resultado COMPLETO
    const mappingResult = {
      success: true,
      timestamp: new Date().toISOString(),
      
      // Informações gerais da conta
      account_summary: {
        company_name: accountData.data?.company_name || 'N/A',
        user_name: accountData.data?.name || 'N/A',
        email: accountData.data?.email || 'N/A',
        currency: accountData.data?.default_currency || 'BRL',
        timezone: accountData.data?.timezone_name || 'America/Sao_Paulo',
        total_pipelines: pipelinesData.data?.length || 0,
        total_stages: allStages.length,
        total_users: usersData.data?.length || 0,
        total_deal_fields: dealFieldsData.data?.length || 0,
        total_person_fields: personFieldsData.data?.length || 0,
        total_activity_types: activityTypesData.data?.length || 0,
        total_organizations: organizationsData.data?.length || 0,
        total_products: productsData.data?.length || 0
      },
      
      // Estruturas principais organizadas
      structures: {
        pipelines: pipelinesData.data || [],
        all_stages: allStages,
        users: usersData.data || [],
        activity_types: activityTypesData.data || [],
        organizations_sample: organizationsData.data || [],
        products_sample: productsData.data || []
      },
      
      // Campos personalizados detalhados
      custom_fields: {
        deal_fields: (dealFieldsData.data || []).map((field: any) => ({
          id: field.id,
          key: field.key,
          name: field.name,
          field_type: field.field_type,
          options: field.options || [],
          mandatory_flag: field.mandatory_flag
        })),
        person_fields: (personFieldsData.data || []).map((field: any) => ({
          id: field.id,
          key: field.key,
          name: field.name,
          field_type: field.field_type,
          options: field.options || [],
          mandatory_flag: field.mandatory_flag
        }))
      },
      
      // Configuração específica encontrada
      target_setup: {
        inside_sales_pipeline: insideSalesPipeline,
        qualificado_stage: qualificadoStage,
        found_target_pipeline: !!insideSalesPipeline,
        found_target_stage: !!qualificadoStage,
        setup_complete: !!(insideSalesPipeline && qualificadoStage)
      },
      
      // Configuração recomendada para implementação
      implementation_config: {
        pipeline_id: insideSalesPipeline?.id || null,
        pipeline_name: insideSalesPipeline?.name || 'Inside Sales',
        stage_id: qualificadoStage?.id || null,
        stage_name: qualificadoStage?.name || 'Qualificado',
        title_format: "Projeto | {solution_category} | {user_name}",
        default_owner_id: usersData.data?.find((u: any) => u.is_admin)?.id || usersData.data?.[0]?.id || null,
        
        // Mapeamento sugerido de campos
        field_mapping: {
          person_standard: {
            name: "name",
            email: "email",
            phone: "phone"
          },
          person_custom: (personFieldsData.data || []).filter((field: any) => 
            field.name.toLowerCase().includes('empresa') ||
            field.name.toLowerCase().includes('cargo') ||
            field.name.toLowerCase().includes('whatsapp') ||
            field.name.toLowerCase().includes('telefone')
          ),
          deal_custom: (dealFieldsData.data || []).filter((field: any) => 
            field.name.toLowerCase().includes('valor') ||
            field.name.toLowerCase().includes('categoria') ||
            field.name.toLowerCase().includes('fonte') ||
            field.name.toLowerCase().includes('projeto') ||
            field.name.toLowerCase().includes('prioridade')
          )
        },
        
        // Issues encontrados
        missing_config: []
      }
    };

    // Verificar configurações faltantes
    if (!insideSalesPipeline) {
      mappingResult.implementation_config.missing_config.push("⚠️ Pipeline 'Inside Sales' não encontrado");
    }
    if (!qualificadoStage) {
      mappingResult.implementation_config.missing_config.push("⚠️ Stage 'Qualificado' não encontrado no pipeline Inside Sales");
    }
    if (!usersData.data?.length) {
      mappingResult.implementation_config.missing_config.push("⚠️ Nenhum usuário encontrado para atribuição");
    }

    console.log('✅ Mapeamento COMPLETO finalizado!');
    console.log('📊 Resumo:', mappingResult.account_summary);

    return new Response(
      JSON.stringify(mappingResult, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro no mapeamento completo:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro ao mapear conta do Pipedrive',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});