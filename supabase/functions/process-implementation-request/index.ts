import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface RequestData {
  solutionId: string;
  solutionTitle: string;
  solutionCategory: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface PipedriveResponse {
  success: boolean;
  data?: {
    id: number;
    title: string;
  };
}

interface DiscordWebhookData {
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: {
      text: string;
      icon_url?: string;
    };
    timestamp: string;
  }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Obter dados da requisição
    const requestData: RequestData = await req.json();
    console.log('Processing implementation request:', requestData);

    // Verificar dados obrigatórios
    if (!requestData.solutionId || !requestData.userEmail || !requestData.userName) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios em falta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter JWT do cabeçalho para identificar o usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar client autenticado
    const token = authHeader.replace('Bearer ', '');
    const authenticatedSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Obter dados do usuário atual
    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser(token);
    if (userError || !user) {
      console.error('User error:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    // 1. Salvar solicitação no banco de dados
    const { data: implementationRequest, error: dbError } = await supabase
      .from('implementation_requests')
      .insert({
        user_id: user.id,
        solution_id: requestData.solutionId,
        user_name: requestData.userName,
        user_email: requestData.userEmail,
        user_phone: requestData.userPhone || null,
        solution_title: requestData.solutionTitle,
        solution_category: requestData.solutionCategory,
        status: 'processing',
        metadata: {
          user_agent: req.headers.get('User-Agent'),
          created_via: 'web_modal',
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar solicitação no banco' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Implementation request saved:', implementationRequest.id);

    // 2. Criar deal no Pipedrive
    let pipedriveData: PipedriveResponse | null = null;
    const pipedriveToken = Deno.env.get('PIPEDRIVE_API_TOKEN');
    const pipedriveCompanyDomain = Deno.env.get('PIPEDRIVE_COMPANY_DOMAIN');
    
    if (pipedriveToken && pipedriveCompanyDomain) {
      try {
        console.log('🔍 Iniciando criação do deal no Pipedrive...');
        console.log('Token disponível:', !!pipedriveToken);
        console.log('Domain disponível:', pipedriveCompanyDomain);
        
        // Buscar o pipeline "inside sales viver de ia" e stage "oportunidade"
        console.log('📋 Buscando pipelines...');
        const pipelinesResponse = await fetch(`https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/pipelines?api_token=${pipedriveToken}`);
        const pipelinesData = await pipelinesResponse.json();
        
        console.log('Pipelines response status:', pipelinesResponse.status);
        console.log('Pipelines encontrados:', pipelinesData.data?.length || 0);
        
        let pipelineId = null;
        let stageId = null;
        let pipelineName = '';
        let stageName = '';
        
        if (pipelinesData.success && pipelinesData.data) {
          // Encontrar pipeline "inside sales viver de ia" (busca flexível)
          const targetPipeline = pipelinesData.data.find((p: any) => {
            const name = p.name.toLowerCase();
            return name.includes('inside sales') && name.includes('viver de ia');
          });
          
          console.log('Pipeline alvo encontrado:', targetPipeline);
          
          if (targetPipeline) {
            pipelineId = targetPipeline.id;
            pipelineName = targetPipeline.name;
            console.log(`✅ Pipeline encontrado: "${pipelineName}" (ID: ${pipelineId})`);
            
            // Buscar stages do pipeline
            console.log('🎯 Buscando stages do pipeline...');
            const stagesResponse = await fetch(`https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/stages?pipeline_id=${pipelineId}&api_token=${pipedriveToken}`);
            const stagesData = await stagesResponse.json();
            
            console.log('Stages response status:', stagesResponse.status);
            console.log('Stages encontrados:', stagesData.data?.length || 0);
            
            if (stagesData.success && stagesData.data) {
              // Encontrar stage "oportunidade"
              const targetStage = stagesData.data.find((s: any) => 
                s.name.toLowerCase().includes('oportunidade')
              );
              
              console.log('Stage alvo encontrado:', targetStage);
              
              if (targetStage) {
                stageId = targetStage.id;
                stageName = targetStage.name;
                console.log(`✅ Stage encontrado: "${stageName}" (ID: ${stageId})`);
              } else {
                console.log('⚠️ Stage "oportunidade" não encontrado, listando stages disponíveis:');
                stagesData.data.forEach((s: any) => console.log(`- ${s.name} (ID: ${s.id})`));
              }
            }
          } else {
            console.log('⚠️ Pipeline "inside sales viver de ia" não encontrado, listando pipelines disponíveis:');
            pipelinesData.data.forEach((p: any) => console.log(`- ${p.name} (ID: ${p.id})`));
          }
        } else {
          console.error('❌ Erro na resposta dos pipelines:', pipelinesData);
        }
        
        // Fallback: se não encontrou pipeline ou stage, usar IDs fixos
        if (!pipelineId || !stageId) {
          console.log('🔄 Aplicando fallback para IDs fixos...');
          pipelineId = pipelineId || 2;
          stageId = stageId || 6;
          pipelineName = pipelineName || 'Pipeline Padrão';
          stageName = stageName || 'Oportunidade';
          console.log(`✅ Usando fallback - Pipeline ID: ${pipelineId}, Stage ID: ${stageId}`);
        }
        
        console.log('🔧 Pipedrive IDs finais para criação do deal:', { 
          pipelineId, 
          stageId,
          pipelineName,
          stageName
        });
        
        // Verificar se o token está presente
        if (!pipedriveToken) {
          console.error('❌ Token do Pipedrive não encontrado!');
          throw new Error('Token do Pipedrive não configurado');
        }
        
        console.log('🔑 Token do Pipedrive presente:', pipedriveToken ? 'SIM' : 'NÃO');
        console.log('🌐 Pipedrive Domain:', pipedriveCompanyDomain);
        
        const dealPayload = {
          title: `Projeto | Plataforma do Club | ${requestData.userName}`,
          value: 0,
          currency: 'BRL',
          status: 'open',
          visible_to: '3',
          ...(pipelineId && { pipeline_id: pipelineId }),
          ...(stageId && { stage_id: stageId }),
          person_id: null,
          org_id: null
        };

        console.log('📤 Deal payload sendo enviado:', JSON.stringify(dealPayload, null, 2));
        console.log('🌐 URL de criação do deal:', `https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/deals`);

        const pipedriveResponse = await fetch(`https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/deals?api_token=${pipedriveToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dealPayload)
        });

        console.log('📥 Pipedrive response status:', pipedriveResponse.status);
        console.log('📥 Pipedrive response headers:', Object.fromEntries(pipedriveResponse.headers.entries()));
        
        const responseText = await pipedriveResponse.text();
        console.log('📥 Pipedrive response raw text:', responseText);
        
        try {
          pipedriveData = JSON.parse(responseText);
          console.log('✅ Pipedrive response parsed successfully:', JSON.stringify(pipedriveData, null, 2));
        } catch (parseError) {
          console.error('❌ Erro ao parsear resposta do Pipedrive:', parseError);
          console.error('❌ Resposta raw:', responseText);
          throw new Error(`Erro ao parsear resposta do Pipedrive: ${parseError.message}`);
        }

        if (pipedriveData?.success && pipedriveData.data) {
          // Atualizar registro com ID do Pipedrive
          await supabase
            .from('implementation_requests')
            .update({ 
              pipedrive_deal_id: pipedriveData.data.id.toString(),
              metadata: {
                ...implementationRequest.metadata,
                pipedrive_created: true,
                pipedrive_deal_title: pipedriveData.data.title
              }
            })
            .eq('id', implementationRequest.id);
          
          console.log('Pipedrive deal created:', pipedriveData.data.id);
        }
      } catch (pipedriveError) {
        console.error('Pipedrive error:', pipedriveError);
        // Não falhar a requisição por erro no Pipedrive
      }
    }

    // 3. Enviar notificação para Discord
    let discordSent = false;
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    console.log('🎯 Iniciando envio do Discord...');
    console.log('Discord webhook URL presente:', !!discordWebhookUrl);
    
    if (discordWebhookUrl) {
      try {
        const discordData: DiscordWebhookData = {
          embeds: [{
            title: "🎯 NOVA SOLICITAÇÃO - PLATAFORMA DO CLUB",
            description: `**${requestData.userName}** solicitou implementação da solução **${requestData.solutionTitle}**`,
            color: 0x10B981, // Verde vibrante
            fields: [
              {
                name: "👤 CLIENTE",
                value: `**${requestData.userName}**\n📧 ${requestData.userEmail}${requestData.userPhone ? `\n📱 ${requestData.userPhone}` : ''}`,
                inline: true
              },
              {
                name: "🚀 PROJETO",
                value: `**${requestData.solutionTitle}**\n📂 ${requestData.solutionCategory}`,
                inline: true
              },
              {
                name: "⚡ STATUS",
                value: `🆔 \`${implementationRequest.id}\`\n⏰ ${new Date().toLocaleString('pt-BR')}\n📍 Pipeline: ${pipelineName || 'Padrão'} → ${stageName || 'Oportunidade'}`,
                inline: false
              }
            ],
            footer: {
              text: "Plataforma do Club - Sistema de Implementação",
              icon_url: "https://viverdeia.ai/favicon.ico"
            },
            timestamp: new Date().toISOString()
          }]
        };

        if (pipedriveData?.success && pipedriveData.data) {
          discordData.embeds[0].fields.push({
            name: "💼 Pipedrive Deal",
            value: `Deal #${pipedriveData.data.id} criado`,
            inline: false
          });
        }

        console.log('📤 Discord payload sendo enviado:', JSON.stringify(discordData, null, 2));

        const discordResponse = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(discordData)
        });

        console.log('📥 Discord response status:', discordResponse.status);
        console.log('📥 Discord response headers:', Object.fromEntries(discordResponse.headers.entries()));
        
        const discordResponseText = await discordResponse.text();
        console.log('📥 Discord response text:', discordResponseText);

        if (discordResponse.ok) {
          discordSent = true;
          console.log('✅ Discord notification sent successfully');
        } else {
          console.error('❌ Discord response error:', discordResponseText);
        }
      } catch (discordError) {
        console.error('❌ Discord error:', discordError);
        console.error('❌ Discord error stack:', discordError.stack);
        // Não falhar a requisição por erro no Discord
      }
    } else {
      console.log('⚠️ Discord webhook URL não configurada');
    }

    // 4. Atualizar status final
    await supabase
      .from('implementation_requests')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: {
          ...implementationRequest.metadata,
          pipedrive_success: !!pipedriveData?.success,
          discord_sent: discordSent,
          processing_completed_at: new Date().toISOString()
        }
      })
      .eq('id', implementationRequest.id);

    // 5. Resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Solicitação processada com sucesso! Nossa equipe entrará em contato em breve.',
        requestId: implementationRequest.id,
        pipedrive: {
          success: !!pipedriveData?.success,
          dealId: pipedriveData?.data?.id || null
        },
        discord: {
          sent: discordSent
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});