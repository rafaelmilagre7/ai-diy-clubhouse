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

    // 🆕 FASE 2: Implementar cache de validações (MD5 hash da ideia normalizada)
    const normalizedIdea = idea.trim().toLowerCase().replace(/\s+/g, ' ');
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(normalizedIdea);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const cacheKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('[VALIDATE-FEASIBILITY] 🔑 Cache key:', cacheKey.substring(0, 16) + '...');

    // Verificar cache (válido por 30 dias)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: cachedValidation, error: cacheError } = await supabase
      .from('idea_validations_cache')
      .select('validation_result, created_at, accessed_count')
      .eq('cache_key', cacheKey)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (cachedValidation && !cacheError) {
      console.log('[VALIDATE-FEASIBILITY] ✅ CACHE HIT! Retornando validação existente');
      console.log('[VALIDATE-FEASIBILITY] 📊 Acessos:', cachedValidation.accessed_count + 1);
      
      // Incrementar contador de acessos
      await supabase
        .from('idea_validations_cache')
        .update({
          accessed_count: cachedValidation.accessed_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('cache_key', cacheKey);
      
      return new Response(
        JSON.stringify({
          ...cachedValidation.validation_result,
          from_cache: true,
          cached_at: cachedValidation.created_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[VALIDATE-FEASIBILITY] ❌ Cache miss, chamando IA...');
    console.log('[VALIDATE-FEASIBILITY] 📝 Ideia:', idea.substring(0, 100) + '...');
    
    const startTime = Date.now();

    // 🆕 Buscar configurações do prompt no banco de dados
    const { data: promptConfig, error: promptError } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('key', 'validate_idea_feasibility')
      .eq('is_active', true)
      .single();

    // 🎯 Função auxiliar: Interpreta resposta natural da IA e extrai estrutura
    const interpretValidationResponse = async (rawResponse: string): Promise<{
      viable: boolean;
      score: number;
      reason: string;
    }> => {
      const interpretPrompt = `
Você é um interpretador de respostas de viabilidade técnica.

RESPOSTA DA IA:
"""
${rawResponse}
"""

TAREFA:
Analise a resposta acima e extraia:
1. viable (boolean): A ideia é VIÁVEL tecnicamente? (true/false)
2. score (number): Confiança na viabilidade de 0-100
3. reason (string): Resumo objetivo em 1-2 frases do motivo

REGRAS:
- Se a resposta contém "SIM", "DÁ PRA FAZER", "VIÁVEL" → viable=true
- Se contém "NÃO", "IMPOSSÍVEL", "INVIÁVEL" → viable=false
- Score alto (80-100) = muita confiança, baixo (0-30) = incerto
- Reason deve ser claro e direto

RETORNE APENAS O JSON:
{
  "viable": true/false,
  "score": 0-100,
  "reason": "texto"
}
`;

      const interpretResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: interpretPrompt }],
          temperature: 0.3,
        }),
      });

      if (!interpretResponse.ok) {
        throw new Error('Erro ao interpretar resposta');
      }

      const interpretData = await interpretResponse.json();
      const interpretContent = interpretData.choices[0].message.content.trim();
      
      // Limpar markdown se necessário
      const cleanInterpretContent = interpretContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanInterpretContent);

      // Validação básica
      if (typeof parsed.viable !== 'boolean' ||
          typeof parsed.score !== 'number' ||
          typeof parsed.reason !== 'string') {
        throw new Error('Interpretação inválida');
      }

      return parsed;
    };

    // Fallback para prompt hardcoded se não encontrar no banco
    const systemPrompt = promptConfig?.prompt_content || `Você é um especialista em automação e IA no-code para empresas. Sua missão é determinar se uma ideia pode ou não ser executada com ferramentas no-code atualmente disponíveis.

## CONTEXTO E CONHECIMENTO

Você conhece profundamente estas ferramentas no-code:

**Bancos de Dados e Armazenamento:**
- Airtable, Google Sheets, Notion Database, Supabase, Firebase, etc…

**Inteligência Artificial:**
- APIs: OpenAI (GPT-5, DALL-E, Whisper), Anthropic (Claude), Google (Gemini), Grok, Deepseek, etc…
- Plataformas: ChatGPT, MidJourney, Stable Diffusion, ElevenLabs (voz), etc…
- Visão computacional: GPT-4 Vision, Google Vision API

**Automação e Integração:**
- Lovable, Make, n8n, Zapier, Lindy AI, etc…

**Interfaces onde a IA atua**
- WhatsApp, Site, plataforma própria, CRM, ERP, Gmail, chatbot,Twilio, Discord, qualquer plataforma que tenha API aberta, etc…

**Outras ferramentas:**
- Google Workspace (Docs, Sheets, Calendar, Drive)
- Microsoft Power Automate, Manus, Agent GPT
- Calendly, Cal.com (agendamento)
- OCR: Tesseract, Google Cloud Vision
- DocuParser, Parsio, PDF.co, CloudConvert

## SEU PROCESSO DE ANÁLISE INTERNA

Para cada ideia que receber, você deve analisar mentalmente:

1. **Quebrar a ideia em componentes:**
   - Qual é a entrada de dados? (formulário, e-mail, webhook, arquivo, etc.)
   - Precisa de IA? Qual tipo? (texto, imagem, voz, decisão)
   - Qual é o modelo de IA necessário? (OpenAI, Claude, Gemini, Whisper, Vision, etc…)
   - Quais integrações são necessárias?
   - Qual é a saída esperada? (notificação, relatório, ação, atualização, plataforma no Lovable, gmail, Whatsapp, etc…)

2. **Avaliar viabilidade técnica:**
   - É viável tecnicamente para fazer via automação e ferramentas no-code com IA?
   - As APIs necessárias existem e são acessíveis?

3. **Identificar bloqueadores:**
   - Depende de hardware específico? que não pode ser desenvolvido via Lovable por exemplo?
   - Requer segurança/compliance que foge a uma solução ética.
   - APIs necessárias não existem ou são inacessíveis?

4. **Considerar casos limítrofes:**
   - Se 80% for viável, considere VIÁVEL (pode adaptar)
   - Se precisa de "pequeno código" mas é mínimo, considere VIÁVEL
   - Se existem workarounds razoáveis, considere VIÁVEL

## CRITÉRIOS DE DECISÃO

**Responda SIM quando:**
- Existe uma combinação de ferramentas no-code, automação e IA que resolve o problema
- As integrações necessárias estão disponíveis via API ou conectores nativos
- A lógica pode ser implementada sem necessidade de ser exclusivo hardcode
- Pequenos ajustes no escopo original tornam viável
- É possível com automação, integrações, IA, ferramentas no-code

**Responda NÃO quando:**
- Requer processamento de baixo nível (drivers, hardware específico)
- Precisa de algoritmos complexos não disponíveis em IA/APIs
- Depende de APIs que não existem
- Exige performance impossível para ferramentas no-code, automação e IA
- Requer desenvolvimento de modelos de IA personalizados do zero
- Envolve segurança crítica que no-code não pode garantir

## FORMATO DE RESPOSTA OBRIGATÓRIO

Responda APENAS com JSON:
{
  "viable": true ou false,
  "score": 0-100,
  "reason": "Explicação direta do COMO seria feito (se viável) ou POR QUÊ não é viável (máximo 3 frases)"
}

## PRINCÍPIOS IMPORTANTES

- Seja pragmático: se 90% da ideia funciona, responda SIM
- Seja honesto: se realmente não dá, diga NÃO sem rodeios
- Seja direto: evite "talvez", "depende", "parcialmente"
- Pense em workarounds criativos antes de dizer NÃO
- Considere MVP (produto mínimo viável) ao avaliar`;

    console.log('[VALIDATE-FEASIBILITY] 📤 Chamando IA...');

    // Usar configurações do banco ou defaults
    const model = promptConfig?.model || 'google/gemini-2.5-flash-lite';
    const timeoutMs = (promptConfig?.timeout_seconds || 15) * 1000;
    const maxRetries = promptConfig?.retry_attempts || 2;
    
    console.log('[VALIDATE-FEASIBILITY] 🎯 Configurações:', { 
      model, 
      timeout: timeoutMs + 'ms', 
      retries: maxRetries,
      fromDB: !!promptConfig 
    });

    // Função auxiliar para fazer request com timeout e retry
    const makeAIRequest = async (attempt = 1): Promise<Response> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const bodyPayload: any = {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Avalie se é viável: "${idea}"` }
          ]
        };

        // Adicionar configurações opcionais se disponíveis
        if (promptConfig?.temperature !== null && promptConfig?.temperature !== undefined) {
          bodyPayload.temperature = promptConfig.temperature;
        }
        if (promptConfig?.max_tokens) {
          bodyPayload.max_tokens = promptConfig.max_tokens;
        }
        if (promptConfig?.response_format) {
          bodyPayload.response_format = promptConfig.response_format;
        }
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error: any) {
        if (attempt < maxRetries && (error.name === 'AbortError' || error.message?.includes('timeout'))) {
          console.warn(`[VALIDATE-FEASIBILITY] ⚠️ Timeout na tentativa ${attempt}/${maxRetries}, tentando novamente...`);
          await new Promise(r => setTimeout(r, 1000 * attempt)); // Backoff progressivo
          return makeAIRequest(attempt + 1);
        }
        throw error;
      }
    };

    const response = await makeAIRequest();

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VALIDATE-FEASIBILITY] ❌ Erro na API:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('[VALIDATE-FEASIBILITY] 📥 Resposta:', content);

    // Limpar JSON (remover markdown se tiver)
    let cleanContent = content.trim()
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // 🎯 INTERPRETAÇÃO INTELIGENTE - Suporta JSON estruturado OU texto natural
    let validationResult: { viable: boolean; score: number; reason: string };
    let interpretationMethod = 'direct_parse';

    try {
      // Tentar parse direto primeiro (se já vier JSON estruturado)
      const parsed = JSON.parse(cleanContent);
      
      if (typeof parsed.viable === 'boolean' &&
          typeof parsed.score === 'number' &&
          typeof parsed.reason === 'string') {
        validationResult = parsed;
        console.log('[VALIDATE-FEASIBILITY] ✅ Resposta já estruturada (JSON válido)');
      } else {
        // Se não tiver o formato correto, interpretar com IA
        console.log('[VALIDATE-FEASIBILITY] 🔄 JSON inválido, interpretando com IA...');
        validationResult = await interpretValidationResponse(cleanContent);
        interpretationMethod = 'ai_interpretation';
      }
    } catch (parseError) {
      // Se JSON.parse falhou, resposta é texto natural → interpretar com IA
      console.log('[VALIDATE-FEASIBILITY] 🔄 Resposta em texto natural, interpretando com IA...');
      validationResult = await interpretValidationResponse(cleanContent);
      interpretationMethod = 'ai_interpretation';
    }

    console.log('[VALIDATE-FEASIBILITY] 📊 Resultado interpretado:', {
      viable: validationResult.viable,
      score: validationResult.score,
      reason: validationResult.reason.substring(0, 100) + (validationResult.reason.length > 100 ? '...' : ''),
      method: interpretationMethod
    });

    const totalTime = Date.now() - startTime;
    console.log('[VALIDATE-FEASIBILITY] ✅ Resultado:', {
      viable: validationResult.viable,
      score: validationResult.score,
      tempo_total: totalTime + 'ms'
    });

    // 🆕 FASE 2: Salvar no cache
    try {
      await supabase
        .from('idea_validations_cache')
        .insert({
          cache_key: cacheKey,
          idea_summary: idea.substring(0, 200),
          validation_result: validationResult
        });
      
      console.log('[VALIDATE-FEASIBILITY] 💾 Resultado salvo no cache');
    } catch (cacheInsertError) {
      console.warn('[VALIDATE-FEASIBILITY] ⚠️ Erro ao salvar cache (não crítico):', cacheInsertError);
    }

    return new Response(
      JSON.stringify({
        ...validationResult,
        from_cache: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[VALIDATE-FEASIBILITY] ❌ Erro fatal:', error);
    console.error('[VALIDATE-FEASIBILITY] 📚 Stack:', error.stack);
    
    const errorMessage = error.message || 'Erro desconhecido';
    
    // Mensagens mais específicas baseadas no tipo de erro
    let userMessage = errorMessage;
    
    if (errorMessage.includes('boot error') || errorMessage.includes('SyntaxError')) {
      userMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
    } else if (errorMessage.includes('Resposta inválida') || errorMessage.includes('campos inválidos')) {
      userMessage = 'Não conseguimos analisar sua ideia. Tente descrever com mais detalhes o que você quer automatizar.';
    } else if (errorMessage.includes('JSON')) {
      userMessage = 'Erro ao processar resposta. Tentando novamente pode resolver.';
    } else if (errorMessage.includes('API error')) {
      userMessage = 'Erro de comunicação com IA. Tente novamente.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        viable: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
