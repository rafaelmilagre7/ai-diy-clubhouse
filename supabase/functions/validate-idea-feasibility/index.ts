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

    // 🆕 PROMPT SIMPLIFICADO (~800 chars) - Foco em JSON válido
    const systemPrompt = `Você é especialista em no-code. Avalie se a ideia é viável com ferramentas como Make, Zapier, APIs de IA (OpenAI, Gemini), Airtable, Bubble, e webhooks.

**SEMPRE VIÁVEL (score 75-90):**
- WhatsApp/Chatbot + IA
- Instagram/Redes Sociais + Automação
- CRM/Vendas + Integração
- Dashboard + APIs
- Análise de dados com IA

**NÃO VIÁVEL (score 0-40):**
- Hardware específico/IoT industrial
- Processamento em tempo real crítico
- Treinar modelo de IA do zero
- APIs inexistentes

**JSON obrigatório:**
{
  "viable": true/false,
  "score": 0-100,
  "reason": "2 frases",
  "technical_explanation": "200+ palavras: fluxo, integrações, APIs, estimativa de custos",
  "suggestions": ["3-5 sugestões práticas"],
  "confidence": "high/medium/low",
  "estimated_complexity": "low/medium/high",
  "estimated_time": "1-2 semanas/2-4 semanas/1-2 meses",
  "required_stack": ["3-8 ferramentas"],
  "limitations": ["2 limitações reais"],
  "cost_estimate": "R$ X-Y/mês"
}

Retorne APENAS JSON válido, sem markdown.`;

    console.log('[VALIDATE-FEASIBILITY] 📤 Chamando Lovable AI...');
    console.log('[VALIDATE-FEASIBILITY] 🤖 Modelo: google/gemini-2.5-pro');

    // 🆕 CORREÇÃO 1: Forçar JSON válido + CORREÇÃO 5: Retry automático
    let validationResult;
    let retryCount = 0;
    const MAX_RETRIES = 1;

    while (retryCount <= MAX_RETRIES) {
      try {
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
              { role: 'user', content: `Avalie: "${idea}"` }
            ],
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: "json_object" } // 🔥 FORÇA JSON VÁLIDO
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
        
        const processingTime = Date.now() - startTime;
        console.log('[VALIDATE-FEASIBILITY] ⏱️ Tempo de processamento:', processingTime + 'ms');

        if (!content) {
          throw new Error('Resposta vazia da IA');
        }

        console.log('[VALIDATE-FEASIBILITY] 📥 Resposta raw:', content.slice(0, 100));

        // 🆕 VALIDAÇÃO: Verificar se resposta foi truncada
        if (content.length < 500) {
          console.error('[VALIDATE-FEASIBILITY] ⚠️ Resposta muito curta, pode ter sido truncada:', content.length, 'chars');
          throw new Error('Resposta da IA foi truncada. Tente novamente.');
        }

        // 🧹 LIMPEZA ROBUSTA: Múltiplas estratégias de extração
        let cleanContent = content.trim();

        // Estratégia 1: Remover markdown code blocks (```json ... ```)
        if (cleanContent.includes('```json')) {
          const match = cleanContent.match(/```json\s*([\s\S]*?)```/);
          if (match) {
            cleanContent = match[1].trim();
          }
        }

        // Estratégia 2: Remover qualquer ``` no início/fim
        cleanContent = cleanContent
          .replace(/```json\s*/gi, '')
          .replace(/```javascript\s*/gi, '')
          .replace(/```\s*/gi, '')
          .replace(/`{1,3}/g, '')
          .trim();

        // Estratégia 3: Tentar encontrar o primeiro { e último }
        if (!cleanContent.startsWith('{')) {
          const firstBrace = cleanContent.indexOf('{');
          if (firstBrace !== -1) {
            cleanContent = cleanContent.substring(firstBrace);
          }
        }

        if (!cleanContent.endsWith('}')) {
          const lastBrace = cleanContent.lastIndexOf('}');
          if (lastBrace !== -1) {
            cleanContent = cleanContent.substring(0, lastBrace + 1);
          }
        }

        console.log('[VALIDATE-FEASIBILITY] 🧹 Depois de limpar:', cleanContent.slice(0, 200));

        // 🆕 CORREÇÃO 3: Recuperação de JSON truncado
        let jsonStr = cleanContent;
        
        // Tentar parse direto primeiro (response_format garante JSON válido)
        try {
          validationResult = JSON.parse(jsonStr);
          console.log('[VALIDATE-FEASIBILITY] ✅ JSON parseado diretamente');
          break; // Sucesso, sair do loop de retry
        } catch (parseError) {
          console.warn('[VALIDATE-FEASIBILITY] ⚠️ Erro no parse inicial, tentando recuperação:', parseError);
          
          // Estratégia 4: Tentar completar JSON truncado
          if (!jsonStr.endsWith('}')) {
            console.log('[VALIDATE-FEASIBILITY] 🔧 Tentando completar JSON truncado...');
            
            // Contar { e } para balancear
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            const missingBraces = openBraces - closeBraces;
            
            if (missingBraces > 0) {
              jsonStr += '}'.repeat(missingBraces);
              console.log('[VALIDATE-FEASIBILITY] 🔧 Adicionadas', missingBraces, 'chaves de fechamento');
            }
            
            // Tentar parse novamente
            try {
              validationResult = JSON.parse(jsonStr);
              console.log('[VALIDATE-FEASIBILITY] ✅ JSON recuperado com sucesso');
              break; // Sucesso, sair do loop
            } catch (recoveryError) {
              console.error('[VALIDATE-FEASIBILITY] ❌ Falha na recuperação:', recoveryError);
            }
          }
          
          // Se chegou aqui, falhou - tentar retry
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`[VALIDATE-FEASIBILITY] 🔄 Tentativa ${retryCount + 1}/${MAX_RETRIES + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
            continue; // Tentar novamente
          }
          
          // Esgotou retries
          throw new Error('Resposta da IA foi truncada. Tente novamente.');
        }
      } catch (fetchError: any) {
        // Erro na chamada da API
        if (retryCount < MAX_RETRIES && !fetchError.message.includes('requisições')) {
          retryCount++;
          console.log(`[VALIDATE-FEASIBILITY] 🔄 Erro na API, tentativa ${retryCount + 1}/${MAX_RETRIES + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw fetchError;
      }
    }

    // Fim do loop while - validationResult agora está definido
    
    // 🆕 FASE 2: Validar TODOS os novos campos obrigatórios
    const technicalExplanationWords = validationResult.technical_explanation?.split(/\s+/).length || 0;
    
    if (typeof validationResult.viable !== 'boolean' ||
        typeof validationResult.score !== 'number' ||
        validationResult.score < 0 || validationResult.score > 100 ||
        typeof validationResult.reason !== 'string' ||
        !validationResult.reason.trim() ||
        typeof validationResult.technical_explanation !== 'string' ||
        technicalExplanationWords < 50 ||
        !Array.isArray(validationResult.suggestions) ||
        validationResult.suggestions.length < 3 ||
        validationResult.suggestions.length > 5 ||
        !['high', 'medium', 'low'].includes(validationResult.confidence) ||
        !['low', 'medium', 'high'].includes(validationResult.estimated_complexity) ||
        typeof validationResult.estimated_time !== 'string' ||
        !Array.isArray(validationResult.required_stack) ||
        validationResult.required_stack.length < 3 ||
        !Array.isArray(validationResult.limitations) ||
        validationResult.limitations.length < 1 ||
        validationResult.limitations.length > 3 ||
        typeof validationResult.cost_estimate !== 'string') {
      
      console.error('[VALIDATE-FEASIBILITY] ❌ Campos inválidos ou incompletos:', {
        viable: typeof validationResult.viable,
        score: validationResult.score,
        reason: typeof validationResult.reason,
        technical_explanation_words: technicalExplanationWords,
        suggestions_count: Array.isArray(validationResult.suggestions) ? validationResult.suggestions.length : 0,
        confidence: validationResult.confidence,
        estimated_complexity: validationResult.estimated_complexity,
        required_stack_count: Array.isArray(validationResult.required_stack) ? validationResult.required_stack.length : 0,
        limitations_count: Array.isArray(validationResult.limitations) ? validationResult.limitations.length : 0,
      });
      console.error('[VALIDATE-FEASIBILITY] 📄 Resposta completa da IA:', JSON.stringify(validationResult, null, 2));
      throw new Error('Resposta da IA não contém todos os campos obrigatórios ou valores inválidos');
    }

    const totalTime = Date.now() - startTime;
    console.log('[VALIDATE-FEASIBILITY] ✅ Resultado validado:', {
      viable: validationResult.viable,
      score: validationResult.score,
      confidence: validationResult.confidence,
      complexity: validationResult.estimated_complexity,
      time: validationResult.estimated_time,
      tools_count: validationResult.required_stack.length,
      total_processing_time: totalTime + 'ms'
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
