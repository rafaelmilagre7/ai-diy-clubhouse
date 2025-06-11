
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
    
    // System prompt diferente para cada etapa
    let systemPrompt = '';
    let userPrompt = '';

    if (currentStep === 2) {
      // System prompt específico para etapa 2 - foco em perfil empresarial
      systemPrompt = `Você é um consultor sênior especialista em transformação digital e IA empresarial com profundo conhecimento de mercados regionais brasileiros.

MISSÃO: Analisar o perfil pessoal da etapa 1 e criar uma conversa inteligente sobre o contexto empresarial, fazendo conexões perspicazes entre dados pessoais e oportunidades de negócio.

CAPACIDADES ESPECIAIS:
- Conhece tendências de IA por setor e região no Brasil
- Entende como perfis pessoais influenciam decisões empresariais
- Faz conexões inteligentes entre dados aparentemente não relacionados
- Cria insights únicos baseados na combinação de fatores

DIRETRIZES DE PERSONALIZAÇÃO:
1. Use o nome da pessoa de forma natural e calorosa
2. Referencie a localização (cidade/estado) para contexto regional
3. Conecte a curiosidade pessoal com potencial empresarial
4. Analise o perfil digital (Instagram/LinkedIn) para entender maturidade
5. Crie insights específicos sobre oportunidades de IA na região
6. Seja consultivo, não vendedor - mostre expertise real

ESTRUTURA DA RESPOSTA (2-3 parágrafos):
1. Reconhecimento personalizado conectando perfil pessoal com contexto empresarial
2. Insight específico sobre oportunidades de IA baseado na combinação de fatores
3. Transição natural para falar sobre o negócio/empresa

TONALIDADE: Profissional mas caloroso, consultivo, demonstrando expertise real através de insights específicos.

IMPORTANTE: NÃO use templates genéricos. Cada resposta deve demonstrar análise real dos dados fornecidos.`;

      // Preparar dados estruturados para análise da etapa 2
      const contextData = {
        // Dados pessoais da etapa 1
        nome: onboardingData.name,
        cidade: onboardingData.city,
        estado: onboardingData.state,
        curiosidade: onboardingData.curiosity,
        instagram: onboardingData.instagram,
        linkedin: onboardingData.linkedin,
        
        // Dados empresariais da etapa 2 (se já preenchidos)
        empresa: onboardingData.companyName,
        setor: onboardingData.businessSector,
        posicao: onboardingData.position,
        tamanhoEmpresa: onboardingData.companySize,
        faturamento: onboardingData.annualRevenue,
        
        // Contexto
        tipoMembro: memberType,
        etapa: currentStep
      };

      userPrompt = `Analise este perfil e crie uma mensagem personalizada para a etapa 2 (Perfil Empresarial):

DADOS DO PERFIL:
${JSON.stringify(contextData, null, 2)}

CONTEXTO: A pessoa acabou de completar seus dados pessoais e agora está na etapa empresarial. Use os dados pessoais para criar conexões inteligentes com o contexto de negócios.

MISSÃO: Criar uma conversa consultiva que demonstre como você entendeu o perfil dela e pode ajudar no contexto empresarial, fazendo a ponte entre quem ela é pessoalmente e suas oportunidades de negócio.`;

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

Tome cuidado com:
- Use o nome da pessoa de forma natural
- Seja específico sobre o setor/área de atuação
- Referencie objetivos mencionados de forma inteligente
- Adapte o tom ao nível de maturidade em IA indicado
- Seja profissional mas caloroso
- Máximo 4 parágrafos, linguagem fluida e natural

A mensagem deve parecer escrita por um consultor que realmente analisou o perfil.`;

      // Preparar dados estruturados para análise geral
      const contextData = {
        nome: onboardingData.name,
        empresa: onboardingData.companyName,
        setor: onboardingData.businessSector,
        posicao: onboardingData.position,
        tamanhoEmpresa: onboardingData.companySize,
        faturamento: onboardingData.annualRevenue,
        
        // Contexto de IA
        experienciaIA: onboardingData.hasImplementedAI,
        nivelConhecimento: onboardingData.aiKnowledgeLevel,
        ferramentasUsadas: onboardingData.aiToolsUsed,
        
        // Objetivos
        objetivoPrincipal: onboardingData.mainObjective,
        areaImpacto: onboardingData.areaToImpact,
        resultadoEsperado: onboardingData.expectedResult90Days,
        orcamento: onboardingData.aiImplementationBudget,
        quemImplementa: onboardingData.whoWillImplement,
        
        // Preferências
        tempoAprendizado: onboardingData.weeklyLearningTime,
        preferenciaConteudo: onboardingData.contentPreference,
        interesseNetworking: onboardingData.wantsNetworking,
        
        // Contexto pessoal
        curiosidade: onboardingData.curiosity,
        cidade: onboardingData.city,
        estado: onboardingData.state,
        
        // Tipo de membro
        tipoMembro: memberType
      };

      userPrompt = `Analise este perfil completo de onboarding e crie uma mensagem final personalizada:

DADOS DO PERFIL:
${JSON.stringify(contextData, null, 2)}

Crie uma mensagem que demonstre que você realmente entendeu este perfil específico, seus desafios, objetivos e contexto empresarial. A mensagem deve ser única e personalizada para esta pessoa.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
    
    // Fallback message em caso de erro
    const fallbackMessage = `Parabéns por completar seu onboarding! 

Estamos empolgados em tê-lo conosco nesta jornada de transformação digital. Com base no seu perfil, acreditamos que você tem um grande potencial para implementar soluções de IA que farão a diferença no seu negócio.

Agora você terá acesso a todas as nossas soluções, ferramentas e conteúdos exclusivos. Recomendamos começar explorando nossa trilha de implementação personalizada.

Vamos transformar seu negócio com IA! 🚀`;

    return new Response(JSON.stringify({ 
      message: fallbackMessage,
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
