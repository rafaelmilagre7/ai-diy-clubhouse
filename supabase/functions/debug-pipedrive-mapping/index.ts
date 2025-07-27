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

    console.log('🔍 Mapeando conta do Pipedrive...');

    // 1. Buscar todos os pipelines
    const pipelinesResponse = await fetch('https://api.pipedrive.com/v1/pipelines', {
      headers: {
        'Authorization': `Bearer ${pipedriveToken}`
      }
    });
    const pipelinesData = await pipelinesResponse.json();
    console.log('📊 Pipelines encontrados:', pipelinesData);

    // 2. Buscar stages do pipeline "Inside Sales"
    let insideSalesPipeline = null;
    let qualificadoStage = null;
    
    if (pipelinesData.success && pipelinesData.data) {
      insideSalesPipeline = pipelinesData.data.find((p: any) => 
        p.name.toLowerCase().includes('inside sales') || 
        p.name.toLowerCase().includes('inside') ||
        p.name.toLowerCase().includes('sales')
      );
      
      if (insideSalesPipeline) {
        console.log('✅ Pipeline Inside Sales encontrado:', insideSalesPipeline);
        
        // Buscar stages deste pipeline
        const stagesResponse = await fetch(`https://api.pipedrive.com/v1/stages?pipeline_id=${insideSalesPipeline.id}`, {
          headers: {
            'Authorization': `Bearer ${pipedriveToken}`
          }
        });
        const stagesData = await stagesResponse.json();
        console.log('📈 Stages do pipeline:', stagesData);
        
        if (stagesData.success && stagesData.data) {
          qualificadoStage = stagesData.data.find((s: any) => 
            s.name.toLowerCase().includes('qualificado') ||
            s.name.toLowerCase().includes('qualified')
          );
        }
      }
    }

    // 3. Buscar campos personalizados de deals
    const dealFieldsResponse = await fetch('https://api.pipedrive.com/v1/dealFields', {
      headers: {
        'Authorization': `Bearer ${pipedriveToken}`
      }
    });
    const dealFieldsData = await dealFieldsResponse.json();
    console.log('🏷️ Campos personalizados de deals:', dealFieldsData);

    // 4. Buscar campos de pessoa
    const personFieldsResponse = await fetch('https://api.pipedrive.com/v1/personFields', {
      headers: {
        'Authorization': `Bearer ${pipedriveToken}`
      }
    });
    const personFieldsData = await personFieldsResponse.json();
    console.log('👤 Campos de pessoa:', personFieldsData);

    // 5. Buscar usuários (para atribuição)
    const usersResponse = await fetch('https://api.pipedrive.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${pipedriveToken}`
      }
    });
    const usersData = await usersResponse.json();
    console.log('👥 Usuários disponíveis:', usersData);

    // Compilar resultado
    const mappingResult = {
      success: true,
      account_info: {
        pipelines: pipelinesData.data || [],
        inside_sales_pipeline: insideSalesPipeline,
        qualificado_stage: qualificadoStage,
        users: usersData.data || []
      },
      deal_fields: dealFieldsData.data || [],
      person_fields: personFieldsData.data || [],
      recommended_config: {
        pipeline_id: insideSalesPipeline?.id || null,
        stage_id: qualificadoStage?.id || null,
        title_format: "Projeto | Plataforma do Club | {user_name}",
        missing_config: []
      }
    };

    // Verificar configurações faltantes
    if (!insideSalesPipeline) {
      mappingResult.recommended_config.missing_config.push("Pipeline 'Inside Sales' não encontrado");
    }
    if (!qualificadoStage) {
      mappingResult.recommended_config.missing_config.push("Stage 'Qualificado' não encontrado");
    }

    console.log('📋 Mapeamento completo:', mappingResult);

    return new Response(
      JSON.stringify(mappingResult, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro no mapeamento:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro ao mapear conta do Pipedrive',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});