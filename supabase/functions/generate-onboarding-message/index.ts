
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { onboardingData, memberType, currentStep } = await req.json();
    
    let systemPrompt = '';
    let userPrompt = '';

    if (currentStep === 2) {
      // System prompt otimizado para etapa 2 - assistente interno da plataforma
      systemPrompt = `Você é o assistente inteligente da plataforma "Viver de IA", uma comunidade/formação especializada em transformação digital e implementação de inteligência artificial em negócios.

CONTEXTO: O usuário está fazendo onboarding na plataforma. Ele acabou de completar a etapa 1 (dados pessoais) e está prestes a preencher a etapa 2 (perfil empresarial).

MISSÃO: Criar mensagem de boas-vindas personalizada que:
1. Parabenize por completar etapa 1
2. Use dados pessoais para criar conexão calorosa
3. Gere expectativa para etapa 2 (perfil empresarial)
4. Transmita valor da plataforma

ESTRUTURA: Saudação personalizada + conexão com dados pessoais + transição para etapa empresarial + motivação para continuar

TOM: Caloroso, acolhedor, motivador, interno da plataforma (não consultoria externa)
TAMANHO: Máximo 3-4 frases concisas`;

      const contextData = {
        nome: onboardingData.name || 'Membro',
        cidade: onboardingData.city || 'sua cidade',
        estado: onboardingData.state || '',
        curiosidade: onboardingData.curiosity || ''
      };

      userPrompt = `Crie mensagem de boas-vindas da plataforma para:

Nome: ${contextData.nome}
Local: ${contextData.cidade}, ${contextData.estado}
Curiosidade: ${contextData.curiosidade}

SITUAÇÃO: Usuário completou etapa 1 do onboarding e vai para etapa 2 (perfil empresarial).

OBJETIVO: Mensagem que conecte dados pessoais com próxima etapa, demonstrando que a plataforma entende seu perfil e vai ajudá-lo a identificar oportunidades de IA no seu negócio.

NÃO MENCIONE: "agendar conversa", "consultor externo", "reunião"
FOQUE EM: Completar o onboarding, próxima etapa, oportunidades na plataforma`;

    } else {
      // System prompt para outras etapas - assistente da plataforma
      systemPrompt = `Você é o assistente inteligente da plataforma "Viver de IA", especializada em transformação digital e implementação de IA em negócios.

CONTEXTO: Usuário completou todo o onboarding e agora é membro da plataforma.

MISSÃO: Criar mensagem final personalizada que:
1. Parabenize pela conclusão do onboarding
2. Destaque insights únicos do perfil completo
3. Apresente próximos passos na plataforma
4. Motive engajamento com a comunidade

A mensagem deve mostrar compreensão profunda do perfil empresarial e objetivos, sugerindo como a plataforma pode acelerar sua jornada de transformação digital.

Estruture em 3-4 parágrafos:
1. Parabéns personalizado com insights do perfil
2. Conexão entre perfil e oportunidades específicas de IA
3. Próximos passos recomendados na plataforma
4. Motivação para engajamento na comunidade`;

      const contextData = {
        nome: onboardingData.name,
        empresa: onboardingData.companyName,
        setor: onboardingData.businessSector,
        posicao: onboardingData.position,
        tamanhoEmpresa: onboardingData.companySize,
        faturamento: onboardingData.annualRevenue,
        experienciaIA: onboardingData.hasImplementedAI,
        nivelConhecimento: onboardingData.aiKnowledgeLevel,
        ferramentasUsadas: onboardingData.aiToolsUsed,
        objetivoPrincipal: onboardingData.mainObjective,
        areaImpacto: onboardingData.areaToImpact,
        resultadoEsperado: onboardingData.expectedResult90Days,
        orcamento: onboardingData.aiImplementationBudget,
        quemImplementa: onboardingData.whoWillImplement,
        tempoAprendizado: onboardingData.weeklyLearningTime,
        preferenciaConteudo: onboardingData.contentPreference,
        interesseNetworking: onboardingData.wantsNetworking,
        curiosidade: onboardingData.curiosity,
        cidade: onboardingData.city,
        estado: onboardingData.state,
        tipoMembro: memberType
      };

      userPrompt = `Analise este perfil completo de onboarding da plataforma "Viver de IA":

DADOS DO PERFIL:
${JSON.stringify(contextData, null, 2)}

Crie mensagem final que demonstre compreensão profunda do perfil e apresente como a plataforma pode acelerar sua transformação digital com IA.

FOQUE EM: Trilhas de implementação, comunidade, recursos da plataforma, networking
NÃO MENCIONE: Consultoria externa, agendamentos, serviços fora da plataforma`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedMessage = data.choices[0].message.content;

    // Sanitizar e limpar a mensagem
    if (generatedMessage) {
      generatedMessage = generatedMessage
        .trim()
        .replace(/undefined/g, '')
        .replace(/null/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();
      
      if (generatedMessage.length < 10) {
        console.warn('[AIMessageGeneration] Mensagem muito pequena após sanitização, usando fallback');
        generatedMessage = getFallbackMessage(onboardingData, currentStep);
      }
    }

    console.log(`Mensagem gerada com sucesso para: ${onboardingData.name} (Etapa ${currentStep || 'final'})`);

    return new Response(JSON.stringify({ 
      message: generatedMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na generate-onboarding-message:', error);
    
    // Definir variáveis no escopo para o fallback
    const { onboardingData: fallbackOnboardingData = {}, currentStep: fallbackCurrentStep } = await req.json().catch(() => ({}));
    const fallbackMessage = getFallbackMessage(fallbackOnboardingData, fallbackCurrentStep);

    return new Response(JSON.stringify({ 
      message: fallbackMessage,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função auxiliar para mensagens de fallback contextualizadas
function getFallbackMessage(onboardingData: any, currentStep?: number) {
  if (currentStep === 2) {
    return `Olá ${onboardingData?.name || 'Membro'}! Que bom ter você aqui na Viver de IA! Vi que você está em ${onboardingData?.city || 'sua cidade'} e fico empolgado em ver mais um apaixonado por IA se juntando à nossa comunidade. ${onboardingData?.curiosity ? `Adorei saber que ${onboardingData.curiosity.toLowerCase()}.` : ''} Agora vamos descobrir como podemos acelerar sua jornada empresarial com IA - vamos para seu perfil de negócios! 🚀`;
  }
  return `Parabéns ${onboardingData?.name || 'Membro'}! Seu onboarding foi concluído com sucesso. Bem-vindo à comunidade Viver de IA - agora vamos transformar o futuro dos negócios juntos! 🚀`;
}
