
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

    const { onboardingData, memberType } = await req.json();
    
    // System prompt que entende contexto empresarial
    const systemPrompt = `Você é um consultor especialista em transformação digital e IA empresarial. 

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

    // Preparar dados estruturados para análise
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

    const userPrompt = `Analise este perfil completo de onboarding e crie uma mensagem final personalizada:

DADOS DO PERFIL:
${JSON.stringify(contextData, null, 2)}

Crie uma mensagem que demonstre que você realmente entendeu este perfil específico, seus desafios, objetivos e contexto empresarial. A mensagem deve ser única e personalizada para esta pessoa.`;

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

    console.log('Mensagem gerada com sucesso para:', onboardingData.name);

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
