
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      // System prompt ultra-específico para etapa 2 - apenas 1 parágrafo personalizado
      systemPrompt = `Você é um consultor sênior em IA empresarial com expertise em perfis regionais brasileiros.

MISSÃO: Criar UM ÚNICO PARÁGRAFO hiper-personalizado que conecte o perfil pessoal da pessoa com oportunidades empresariais de IA.

REGRAS RÍGIDAS:
1. APENAS 1 parágrafo (máximo 4-5 frases)
2. Use o nome da pessoa naturalmente
3. Mencione a cidade/localização de forma contextual
4. Integre a curiosidade pessoal de forma inteligente
5. Conecte perfil pessoal com potencial empresarial
6. Tom caloroso mas profissional
7. Foque na transição para falar sobre negócios

ESTRUTURA: Saudação personalizada + conexão cidade/curiosidade + ponte para empresarial + convite para próximo passo

IMPORTANTE: Seja específico, não genérico. Demonstre que realmente analisou o perfil desta pessoa única.`;

      const contextData = {
        nome: onboardingData.name,
        cidade: onboardingData.city,
        estado: onboardingData.state,
        curiosidade: onboardingData.curiosity,
        instagram: onboardingData.instagram,
        linkedin: onboardingData.linkedin,
        tipoMembro: memberType
      };

      userPrompt = `Crie UM ÚNICO PARÁGRAFO hiper-personalizado para:

PERFIL:
- Nome: ${contextData.nome}
- Localização: ${contextData.cidade}, ${contextData.estado}  
- Curiosidade: ${contextData.curiosidade}
- Instagram: ${contextData.instagram || 'Não informado'}
- LinkedIn: ${contextData.linkedin || 'Não informado'}
- Tipo: ${contextData.tipoMembro}

CONTEXTO: A pessoa completou dados pessoais e agora está na etapa empresarial. Use os dados pessoais para criar uma conexão única e fazer a ponte para falar sobre negócios.

RESULTADO: 1 parágrafo que demonstre compreensão profunda do perfil e prepare naturalmente para discutir oportunidades empresariais.`;

    } else {
      // System prompt original para outras etapas
      systemPrompt = `Você é um consultor especialista em transformação digital e IA empresarial. 

Analise CUIDADOSAMENTE todas as informações do onboarding fornecidas e crie uma mensagem personalizada única que demonstre compreensão profunda do perfil, contexto empresarial e objetivos.

NÃO use templates genéricos ou simplesmente insira variáveis no texto.
ENTENDA o contexto completo e crie insights relevantes baseados no perfil específico.

Estruture a mensagem em 3-4 parágrafos:
1. Reconhecimento personalizado do perfil e contexto
2. Insights específicos baseados nas respostas (setor, objetivos, maturidade em IA)
3. Próximos passos recomendados para o perfil específico
4. Motivação final personalizada

A mensagem deve parecer escrita por um consultor que realmente analisou o perfil.`;

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

      userPrompt = `Analise este perfil completo de onboarding e crie uma mensagem final personalizada:

DADOS DO PERFIL:
${JSON.stringify(contextData, null, 2)}

Crie uma mensagem que demonstre que você realmente entendeu este perfil específico, seus desafios, objetivos e contexto empresarial.`;
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
        temperature: 0.8,
        max_tokens: 300, // Reduzido para respostas mais concisas
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedMessage = data.choices[0].message.content;

    console.log(`Mensagem gerada com sucesso para: ${onboardingData.name} (Etapa ${currentStep || 'final'})`);

    return new Response(JSON.stringify({ 
      message: generatedMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na generate-onboarding-message:', error);
    
    // Fallback message otimizado para etapa 2
    const fallbackMessage = `Olá ${onboardingData?.name || 'Membro'}! Que bom ter você aqui conosco! Vi que você está em ${onboardingData?.city || 'sua cidade'} e isso me deixa empolgado com as possibilidades. ${onboardingData?.curiosity ? `Adorei saber que ${onboardingData.curiosity.toLowerCase()}.` : ''} Agora vamos falar sobre seu negócio e como posso ajudar você a identificar as melhores oportunidades de IA! 🚀`;

    return new Response(JSON.stringify({ 
      message: fallbackMessage,
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
