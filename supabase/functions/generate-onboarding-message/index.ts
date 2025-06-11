
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
      // System prompt ultra-otimizado para etapa 2 - resposta rápida
      systemPrompt = `Você é um consultor em IA empresarial especialista em perfis brasileiros.

MISSÃO: Criar UM parágrafo personalizado conectando perfil pessoal com oportunidades empresariais de IA.

REGRAS:
1. Máximo 3-4 frases
2. Use nome da pessoa naturalmente  
3. Mencione cidade contextualmente
4. Integre curiosidade pessoal
5. Tom caloroso mas profissional
6. Foque na transição para negócios

ESTRUTURA: Saudação + conexão cidade/curiosidade + ponte empresarial + convite próximo passo`;

      const contextData = {
        nome: onboardingData.name || 'Membro',
        cidade: onboardingData.city || 'sua cidade',
        estado: onboardingData.state || '',
        curiosidade: onboardingData.curiosity || ''
      };

      userPrompt = `Crie 1 parágrafo personalizado para:

Nome: ${contextData.nome}
Local: ${contextData.cidade}, ${contextData.estado}
Curiosidade: ${contextData.curiosidade}

Contexto: Pessoa completou dados pessoais, agora vai para etapa empresarial. Use dados pessoais para criar conexão única e preparar para discussão sobre negócios.

Resposta: 1 parágrafo demonstrando compreensão do perfil.`;

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
        temperature: 0.7,
        max_tokens: 150, // Reduzido para respostas mais rápidas
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
        .replace(/\n\s*\n/g, '\n\n');
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
    
    // Fallback message otimizado e limpo
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
