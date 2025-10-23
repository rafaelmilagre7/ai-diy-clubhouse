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

    const systemPrompt = `Você é um especialista em avaliar viabilidade de projetos de IA e desenvolvimento web.

Analise a ideia fornecida e determine se ela pode ser implementada usando a plataforma Lovable, que oferece:

**Capacidades da Plataforma:**
- Frontend completo em React + TypeScript + Tailwind CSS
- Backend Supabase (banco de dados, autenticação, storage, edge functions)
- Integrações com APIs externas e serviços de IA (OpenAI, Anthropic, Google, etc.)
- Automações e workflows complexos
- Interfaces ricas e interativas
- Processamento de imagens, textos, áudio via IA
- Webhooks e integrações de terceiros

**Critérios de Viabilidade:**

✅ **VIÁVEL** se:
- Aplicação web (dashboard, SaaS, e-commerce, portal)
- Sistema de gerenciamento (CRM, ERP, gestão de projetos)
- Ferramentas de IA (chatbots, análise de dados, geração de conteúdo, assistentes virtuais)
- Plataformas de conteúdo (blog, marketplace, rede social)
- Integrações com APIs externas (pagamento, email, CRM, automação)
- Processamento de mídia via IA (análise de imagem, transcrição, síntese de voz)

❌ **NÃO VIÁVEL** se exigir:
- **Hardware físico/robótica**: Robôs, braços mecânicos, drones, dispositivos móveis físicos
- **Sensores IoT físicos**: Temperatura, pressão, movimento (exceto câmera/microfone web)
- **Atuadores físicos**: Motores, servos, relés, válvulas
- **Apps mobile nativos**: iOS/Android nativo (web app mobile é OK)
- **Tecnologias fora do stack**: Python standalone, Java, .NET, Ruby (apenas como API externa é OK)
- **Frameworks não suportados**: Angular, Vue, Next.js, Svelte

**❌ EXEMPLOS DE IDEIAS NÃO VIÁVEIS:**
- Robô físico para pegar café e levar no quarto (hardware + robótica)
- Drone de entrega autônomo (hardware + regulação)
- App que controla ar-condicionado via infravermelho (hardware IoT)
- Sistema que mede temperatura corporal com sensor (IoT físico)
- Braço robótico para montagem industrial (hardware)

**Seja otimista mas realista:** Se pode ser feito via web app + IA + integrações de software, é viável.

CRÍTICO: Retorne APENAS o objeto JSON puro, sem markdown, sem code blocks, sem explicações adicionais.

Formato correto:
{"viable": true, "reason": "Explicação de 2-3 frases", "confidence": "high"}

NÃO retorne com markdown:
\`\`\`json
{"viable": true, ...}
\`\`\``;

    console.log('[VALIDATE-FEASIBILITY] 📤 Chamando Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analise a viabilidade desta ideia com OTIMISMO e CRIATIVIDADE. Pense em como PODE ser feito:\n\n"${idea}"\n\nLembre-se: se envolve software, web, IA ou automações, provavelmente é VIÁVEL. Seja generoso na análise.` }
        ],
        temperature: 0.4,
        max_tokens: 300
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

    // Extrair JSON da resposta com parsing robusto
    let validationResult;
    try {
      // Remover markdown code blocks primeiro
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '');
      cleanContent = cleanContent.replace(/```\s*/g, '');
      cleanContent = cleanContent.trim();

      // Extrair JSON do conteúdo limpo
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('[VALIDATE-FEASIBILITY] ❌ Erro ao parsear JSON:', parseError);
      
      // Fallback mais criterioso: verificar indicadores explícitos
      const hasViableTrue = 
        content.toLowerCase().includes('"viable": true') || 
        content.toLowerCase().includes('"viable":true');
      
      const hasViableFalse = 
        content.toLowerCase().includes('"viable": false') || 
        content.toLowerCase().includes('"viable":false');

      if (hasViableTrue && !hasViableFalse) {
        validationResult = {
          viable: true,
          reason: content.substring(0, 200),
          confidence: 'low'
        };
      } else {
        // Por segurança, assumir não viável se não conseguimos confirmar
        validationResult = {
          viable: false,
          reason: 'Não foi possível validar automaticamente. Por favor, reformule sua ideia de forma mais clara.',
          confidence: 'low'
        };
      }
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
