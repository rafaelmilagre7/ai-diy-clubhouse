import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Ideia não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um especialista em viabilidade de projetos com Inteligência Artificial e no-code/low-code, especialmente na plataforma Lovable.

Seu trabalho é VALIDAR RAPIDAMENTE se uma ideia pode ser executada com IA e automações modernas.

## CRITÉRIOS DE VIABILIDADE

✅ VIÁVEL se a ideia envolve:
- Processamento de linguagem natural (chatbots, análise de texto)
- Automação de processos repetitivos
- Integração entre sistemas/APIs (CRM, ERPs, Google, WhatsApp)
- Interfaces web/dashboards
- Geração de conteúdo com IA
- Análise de dados e relatórios
- Sistemas de recomendação
- OCR e extração de documentos
- Assistentes virtuais e agentes de IA

❌ NÃO VIÁVEL se a ideia requer:
- Hardware especializado (robótica física, IoT complexo)
- Processamento em tempo real extremamente crítico (milissegundos)
- Manipulação física de objetos
- Aplicativos nativos mobile complexos (iOS/Android com recursos de hardware)
- Sistemas embarcados ou firmware
- Processamento de grandes volumes de vídeo em tempo real
- Blockchain/crypto mining
- Projetos puramente offline sem interface web

## RESPOSTA

Retorne APENAS um JSON válido no formato:
{
  "viable": true ou false,
  "reason": "Explicação clara e direta em português de 1-2 linhas",
  "confidence": "high" | "medium" | "low"
}

Seja objetivo e direto. A análise deve ser rápida (máximo 3 segundos).`;

    console.log('[VALIDATE-FEASIBILITY] 📤 Chamando Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analise a viabilidade desta ideia:\n\n"${idea}"` }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VALIDATE-FEASIBILITY] ❌ Erro na API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Aguarde alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('[VALIDATE-FEASIBILITY] 📥 Resposta raw:', content);

    // Extrair JSON da resposta
    let validationResult;
    try {
      // Tentar encontrar JSON na resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('[VALIDATE-FEASIBILITY] ❌ Erro ao parsear JSON:', parseError);
      // Fallback: tentar interpretar a resposta
      const isPositive = content.toLowerCase().includes('viável') || 
                        content.toLowerCase().includes('possível') ||
                        content.toLowerCase().includes('viable');
      
      validationResult = {
        viable: isPositive,
        reason: content.substring(0, 200),
        confidence: 'medium'
      };
    }

    console.log('[VALIDATE-FEASIBILITY] ✅ Resultado:', validationResult);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[VALIDATE-FEASIBILITY] ❌ Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao validar viabilidade',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
