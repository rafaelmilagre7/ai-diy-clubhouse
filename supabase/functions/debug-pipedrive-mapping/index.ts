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
    const pipedriveCompanyDomain = Deno.env.get('PIPEDRIVE_COMPANY_DOMAIN');
    
    console.log('🔍 Iniciando diagnóstico completo do Pipedrive...');
    
    if (!pipedriveToken) {
      console.error('❌ Token do Pipedrive não encontrado');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'PIPEDRIVE_API_TOKEN não configurado',
          help: 'Configure o token em Supabase Settings > Edge Functions'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Token encontrado, testando autenticação...');
    
    // Função helper para fazer requisições com fallback de formato
    const makePipedriveRequest = async (endpoint: string) => {
      let response;
      
      // Tentar primeiro com domínio da empresa (se disponível)
      if (pipedriveCompanyDomain) {
        const urlWithDomain = `https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/${endpoint}?api_token=${pipedriveToken}`;
        console.log(`🏢 Tentando com domínio: ${urlWithDomain}`);
        response = await fetch(urlWithDomain);
        
        if (response.ok) {
          console.log('✅ Sucesso com formato de domínio da empresa');
          return response;
        } else {
          console.log(`❌ Falhou com domínio da empresa: ${response.status}`);
        }
      }
      
      // Fallback para formato moderno
      const urlModern = `https://api.pipedrive.com/v1/${endpoint}?api_token=${pipedriveToken}`;
      console.log(`🌐 Tentando com formato moderno: ${urlModern}`);
      response = await fetch(urlModern);
      
      if (!response.ok) {
        console.log(`❌ Falhou com formato moderno: ${response.status}`);
      }
      
      return response;
    };

    // 1. Primeiro, testar autenticação
    console.log('🔐 Testando autenticação...');
    const authTestResponse = await makePipedriveRequest('users/me');
    
    console.log('🔐 Status da autenticação:', authTestResponse.status);
    
    if (!authTestResponse.ok) {
      const errorText = await authTestResponse.text();
      console.error('❌ Erro de autenticação:', errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Falha na autenticação do Pipedrive',
          status_code: authTestResponse.status,
          details: errorText,
          help: 'Verifique se o token está correto e tem as permissões necessárias'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const authData = await authTestResponse.json();
    console.log('👤 Usuário autenticado:', authData.data?.name, authData.data?.email);

    // 2. Buscar todos os pipelines
    console.log('📊 Buscando pipelines...');
    const pipelinesResponse = await makePipedriveRequest('pipelines');
    
    if (!pipelinesResponse.ok) {
      const errorText = await pipelinesResponse.text();
      console.error('❌ Erro ao buscar pipelines:', errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao buscar pipelines',
          status_code: pipelinesResponse.status,
          details: errorText
        }),
        { 
          status: pipelinesResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const pipelinesData = await pipelinesResponse.json();
    console.log('📊 Pipelines encontrados:', pipelinesData.data?.length || 0);

    // 3. Buscar TODOS os stages de TODOS os pipelines
    const allStages = [];
    let insideSalesPipeline = null;
    let qualificadoStage = null;
    
    if (pipelinesData.success && pipelinesData.data) {
      for (const pipeline of pipelinesData.data) {
        console.log(`🔍 Analisando pipeline: ${pipeline.name} (ID: ${pipeline.id})`);
        
        const stagesResponse = await makePipedriveRequest(`stages?pipeline_id=${pipeline.id}`);
        
        if (stagesResponse.ok) {
          const stagesData = await stagesResponse.json();
          console.log(`  └─ Stages encontrados: ${stagesData.data?.length || 0}`);
          
          if (stagesData.success && stagesData.data) {
            const pipelineStages = stagesData.data.map((stage: any) => ({
              ...stage,
              pipeline_name: pipeline.name,
              pipeline_id: pipeline.id
            }));
            allStages.push(...pipelineStages);
            
            // Verificar se é o pipeline Inside Sales (busca flexível)
            if (pipeline.name.toLowerCase().includes('inside') || 
                pipeline.name.toLowerCase().includes('sales') ||
                pipeline.name === 'Inside Sales') {
              insideSalesPipeline = pipeline;
              console.log(`🎯 Pipeline target encontrado: ${pipeline.name}`);
              
              // Procurar stage Qualificado
              qualificadoStage = pipelineStages.find((stage: any) => 
                stage.name.toLowerCase().includes('qualificado') ||
                stage.name.toLowerCase().includes('qualified')
              );
              
              if (qualificadoStage) {
                console.log(`🎯 Stage target encontrado: ${qualificadoStage.name}`);
              }
            }
          }
        } else {
          console.warn(`⚠️ Erro ao buscar stages do pipeline ${pipeline.name}:`, stagesResponse.status);
        }
      }
    }

    // 4. Buscar campos personalizados de deals
    console.log('🏷️ Buscando campos de deals...');
    const dealFieldsResponse = await makePipedriveRequest('dealFields');
    
    let dealFields = [];
    if (dealFieldsResponse.ok) {
      const dealFieldsData = await dealFieldsResponse.json();
      dealFields = dealFieldsData.data || [];
      console.log('🏷️ Campos de deals:', dealFields.length);
    } else {
      console.warn('⚠️ Erro ao buscar campos de deals:', dealFieldsResponse.status);
    }

    // 5. Buscar campos de pessoas
    console.log('👤 Buscando campos de pessoas...');
    const personFieldsResponse = await makePipedriveRequest('personFields');
    
    let personFields = [];
    if (personFieldsResponse.ok) {
      const personFieldsData = await personFieldsResponse.json();
      personFields = personFieldsData.data || [];
      console.log('👤 Campos de pessoas:', personFields.length);
    } else {
      console.warn('⚠️ Erro ao buscar campos de pessoas:', personFieldsResponse.status);
    }

    // 6. Buscar usuários
    console.log('👥 Buscando usuários...');
    const usersResponse = await makePipedriveRequest('users');
    
    let users = [];
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      users = usersData.data || [];
      console.log('👥 Usuários encontrados:', users.length);
    } else {
      console.warn('⚠️ Erro ao buscar usuários:', usersResponse.status);
    }

    // 7. Buscar tipos de atividades
    console.log('📅 Buscando tipos de atividades...');
    const activityTypesResponse = await makePipedriveRequest('activityTypes');
    
    let activityTypes = [];
    if (activityTypesResponse.ok) {
      const activityTypesData = await activityTypesResponse.json();
      activityTypes = activityTypesData.data || [];
      console.log('📅 Tipos de atividades:', activityTypes.length);
    }

    // 8. Buscar organizações (amostra)
    console.log('🏢 Buscando organizações (amostra)...');
    const organizationsResponse = await makePipedriveRequest('organizations?limit=10');
    
    let organizationsSample = [];
    if (organizationsResponse.ok) {
      const organizationsData = await organizationsResponse.json();
      organizationsSample = organizationsData.data || [];
      console.log('🏢 Organizações (amostra):', organizationsSample.length);
    }

    // 9. Buscar produtos (se existirem)
    console.log('🛍️ Buscando produtos (amostra)...');
    const productsResponse = await makePipedriveRequest('products?limit=10');
    
    let productsSample = [];
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      productsSample = productsData.data || [];
      console.log('🛍️ Produtos (amostra):', productsSample.length);
    }

    // Compilar resultado COMPLETO
    const mappingResult = {
      success: true,
      timestamp: new Date().toISOString(),
      authentication: {
        status: 'success',
        user: {
          name: authData.data?.name,
          email: authData.data?.email,
          company: authData.data?.company_name
        }
      },
      
      // Informações gerais da conta
      account_summary: {
        company_name: authData.data?.company_name || 'N/A',
        user_name: authData.data?.name || 'N/A',
        email: authData.data?.email || 'N/A',
        currency: authData.data?.default_currency || 'BRL',
        timezone: authData.data?.timezone_name || 'America/Sao_Paulo',
        total_pipelines: pipelinesData.data?.length || 0,
        total_stages: allStages.length,
        total_users: users.length,
        total_deal_fields: dealFields.length,
        total_person_fields: personFields.length,
        total_activity_types: activityTypes.length,
        total_organizations: organizationsSample.length,
        total_products: productsSample.length
      },
      
      // Estruturas principais organizadas
      structures: {
        pipelines: pipelinesData.data || [],
        all_stages: allStages,
        users: users,
        activity_types: activityTypes,
        organizations_sample: organizationsSample,
        products_sample: productsSample
      },
      
      // Campos personalizados detalhados
      custom_fields: {
        deal_fields: dealFields.map((field: any) => ({
          id: field.id,
          key: field.key,
          name: field.name,
          field_type: field.field_type,
          options: field.options || [],
          mandatory_flag: field.mandatory_flag
        })),
        person_fields: personFields.map((field: any) => ({
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
        default_owner_id: users.find((u: any) => u.is_admin)?.id || users[0]?.id || null,
        
        // Mapeamento sugerido de campos
        field_mapping: {
          person_standard: {
            name: "name",
            email: "email",
            phone: "phone"
          },
          person_custom: personFields.filter((field: any) => 
            field.name.toLowerCase().includes('empresa') ||
            field.name.toLowerCase().includes('cargo') ||
            field.name.toLowerCase().includes('whatsapp') ||
            field.name.toLowerCase().includes('telefone')
          ),
          deal_custom: dealFields.filter((field: any) => 
            field.name.toLowerCase().includes('valor') ||
            field.name.toLowerCase().includes('categoria') ||
            field.name.toLowerCase().includes('fonte') ||
            field.name.toLowerCase().includes('projeto') ||
            field.name.toLowerCase().includes('prioridade')
          )
        },
        
        // Issues encontrados
        missing_config: [] as string[]
      }
    };

    // Verificar configurações faltantes
    if (!insideSalesPipeline) {
      mappingResult.implementation_config.missing_config.push("⚠️ Pipeline 'Inside Sales' não encontrado");
      console.log('⚠️ Pipelines disponíveis:', pipelinesData.data?.map((p: any) => p.name));
    }
    if (!qualificadoStage) {
      mappingResult.implementation_config.missing_config.push("⚠️ Stage 'Qualificado' não encontrado no pipeline Inside Sales");
    }
    if (!users.length) {
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
    console.error('❌ Erro inesperado no mapeamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro inesperado ao mapear conta do Pipedrive',
        details: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});