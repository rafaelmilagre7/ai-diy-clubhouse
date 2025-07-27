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
        // Buscar o pipeline "Inside Sales" e stage "Qualificado"
        const pipelinesResponse = await fetch(`https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/pipelines?api_token=${pipedriveToken}`);
        const pipelinesData = await pipelinesResponse.json();
        
        let pipelineId = null;
        let stageId = null;
        
        if (pipelinesData.success && pipelinesData.data) {
          // Encontrar pipeline "Inside Sales"
          const insideSalesPipeline = pipelinesData.data.find((p: any) => 
            p.name.toLowerCase().includes('inside sales') || 
            p.name.toLowerCase().includes('inside_sales')
          );
          
          if (insideSalesPipeline) {
            pipelineId = insideSalesPipeline.id;
            
            // Buscar stages do pipeline
            const stagesResponse = await fetch(`https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/stages?pipeline_id=${pipelineId}&api_token=${pipedriveToken}`);
            const stagesData = await stagesResponse.json();
            
            if (stagesData.success && stagesData.data) {
              // Encontrar stage "Qualificado"
              const qualificadoStage = stagesData.data.find((s: any) => 
                s.name.toLowerCase().includes('qualificado')
              );
              
              if (qualificadoStage) {
                stageId = qualificadoStage.id;
              }
            }
          }
        }
        
        console.log('Pipedrive IDs encontrados:', { pipelineId, stageId });
        
        const pipedriveResponse = await fetch(`https://${pipedriveCompanyDomain}.pipedrive.com/api/v1/deals?api_token=${pipedriveToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `Projeto | Plataforma do Club | ${requestData.userName}`,
            value: 0,
            currency: 'BRL',
            status: 'open',
            visible_to: '3',
            pipeline_id: pipelineId,
            stage_id: stageId,
            notes: `🚀 SOLICITAÇÃO DE IMPLEMENTAÇÃO - PLATAFORMA DO CLUB

📋 DETALHES DO PROJETO:
• Solução: ${requestData.solutionTitle}
• Categoria: ${requestData.solutionCategory}
• Status: Nova solicitação

👤 INFORMAÇÕES DO CLIENTE:
• Nome: ${requestData.userName}
• Email: ${requestData.userEmail}${requestData.userPhone ? `
• Telefone: ${requestData.userPhone}` : ''}

🔗 REFERÊNCIAS:
• ID da Solicitação: ${implementationRequest.id}
• Origem: Plataforma do Club
• Data da Solicitação: ${new Date().toLocaleString('pt-BR')}

⚡ PRÓXIMOS PASSOS:
1. Entrar em contato com o cliente
2. Agendar reunião de descoberta
3. Elaborar proposta personalizada`,
            person_id: null,
            org_id: null
          })
        });

        pipedriveData = await pipedriveResponse.json();
        console.log('Pipedrive response:', pipedriveData);

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
                value: `🆔 \`${implementationRequest.id}\`\n⏰ ${new Date().toLocaleString('pt-BR')}\n📍 Pipeline: Inside Sales → Qualificado`,
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

        const discordResponse = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(discordData)
        });

        if (discordResponse.ok) {
          discordSent = true;
          console.log('Discord notification sent successfully');
        } else {
          console.error('Discord response error:', await discordResponse.text());
        }
      } catch (discordError) {
        console.error('Discord error:', discordError);
        // Não falhar a requisição por erro no Discord
      }
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