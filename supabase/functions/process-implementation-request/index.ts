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
    
    if (pipedriveToken) {
      try {
        const pipedriveResponse = await fetch('https://api.pipedrive.com/v1/deals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pipedriveToken}`
          },
          body: JSON.stringify({
            title: `Implementação: ${requestData.solutionTitle} - ${requestData.userName}`,
            value: 0, // Valor inicial
            currency: 'BRL',
            status: 'open',
            visible_to: '3', // Visível para todos
            notes: `Solicitação de implementação da solução "${requestData.solutionTitle}" (${requestData.solutionCategory}).\n\nContato: ${requestData.userEmail}${requestData.userPhone ? `\nTelefone: ${requestData.userPhone}` : ''}\n\nID da solicitação: ${implementationRequest.id}`,
            person_id: null, // Será criado separadamente se necessário
            org_id: null,
            custom_fields: {
              solution_category: requestData.solutionCategory,
              request_id: implementationRequest.id,
              user_email: requestData.userEmail
            }
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
            title: "🚀 Nova Solicitação de Implementação",
            description: `Solicitação para implementar a solução **${requestData.solutionTitle}**`,
            color: 0x0ABAB5, // Cor viverblue
            fields: [
              {
                name: "👤 Cliente",
                value: requestData.userName,
                inline: true
              },
              {
                name: "📧 Email",
                value: requestData.userEmail,
                inline: true
              },
              {
                name: "📱 Telefone",
                value: requestData.userPhone || "Não informado",
                inline: true
              },
              {
                name: "🎯 Solução",
                value: requestData.solutionTitle,
                inline: true
              },
              {
                name: "📂 Categoria",
                value: requestData.solutionCategory,
                inline: true
              },
              {
                name: "🆔 ID da Solicitação",
                value: implementationRequest.id,
                inline: true
              }
            ],
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