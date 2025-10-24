import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseServiceClient } from '../_shared/supabase-client.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { solutionId, userId } = await req.json();
    console.log('[FLOW-GEN] Gerando fluxo para solução:', solutionId);

    const supabase = getSupabaseServiceClient();

    // Buscar solução
    const { data: solution, error: solutionError } = await supabase
      .from('ai_generated_solutions')
      .select('*')
      .eq('id', solutionId)
      .single();

    if (solutionError) throw solutionError;

    // Montar prompt focado e simples com exemplos concretos
    const systemPrompt = `Você é um arquiteto de soluções especializado em criar fluxos visuais de implementação para projetos de IA.

REGRAS MERMAID (CRÍTICAS - SIGA EXATAMENTE):
1. Use APENAS "graph TD" na primeira linha
2. IDs devem ser APENAS letras maiúsculas únicas (A, B, C, D... até L)
3. Textos descritivos SEMPRE entre colchetes [ ]
4. Setas SEMPRE com espaços: " --> " (nunca "-->")
5. Máximo 12 nós no total
6. Decisões (if/else) usam chaves { } e labels nas setas: -->|Sim| e -->|Não|
7. NUNCA use: underscores, hífens, espaços ou números em IDs
8. NUNCA quebre uma definição de nó em múltiplas linhas
9. Cada linha deve ter EXATAMENTE: ID[Texto] --> ID2[Texto] ou ID{Decisão?}

EXEMPLO 100% VÁLIDO:
graph TD
    A[Definir Requisitos] --> B[Escolher LLM]
    B --> C{Precisa Dados?}
    C -->|Sim| D[Preparar Dataset]
    C -->|Não| E[Usar API Direta]
    D --> F[Fine-tuning]
    E --> F
    F --> G[Criar Interface]
    G --> H[Testes]
    H --> I[Deploy]

EXEMPLO INVÁLIDO (NÃO FAÇA ISSO):
graph TD
    Setup_Inicial[Setup] --> Config_API[Config]  ❌ IDs com underscore
    A[Texto muito longo que
    quebra em duas linhas] --> B  ❌ Quebra de linha
    Node1-->Node2  ❌ Sem espaços na seta`;

    const userPrompt = `Crie UM ÚNICO fluxo Mermaid (graph TD) com 8-12 etapas para implementar esta solução de IA:

SOLUÇÃO:
- Título: ${solution.title}
- Descrição: ${solution.original_idea}
- Ferramentas: ${solution.required_tools || 'Não especificado'}

RETORNE APENAS JSON VÁLIDO (sem markdown):
{
  "mermaid_code": "graph TD\\n    A[Passo 1] --> B[Passo 2]\\n    ...",
  "title": "Fluxo de Implementação - ${solution.title.substring(0, 30)}",
  "description": "Etapas práticas para implementar ${solution.title}",
  "estimated_time": "X-Y horas",
  "key_steps": ["Etapa 1", "Etapa 2", "Etapa 3", "Etapa 4"]
}

IMPORTANTE: 
- mermaid_code deve ser uma string com \\n para quebras de linha
- IDs devem ser A, B, C, D, E, F, G, H, I, J, K, L (apenas letras)
- Textos curtos e diretos (máx 30 chars por nó)
- Foque nas etapas técnicas de implementação da solução de IA`;

    // Chamar Lovable AI com retry logic
    console.log('[FLOW-GEN] Chamando Lovable AI...');
    
    let aiData;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[FLOW-GEN] Tentativa ${attempts}/${maxAttempts}`);
      
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3, // Temperatura mais baixa para maior consistência
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('[FLOW-GEN] ❌ Erro Lovable AI:', errorText);
        
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit excedido. Tente novamente em alguns minutos.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (attempts < maxAttempts) {
          console.log('[FLOW-GEN] Tentando novamente...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s
          continue;
        }
        
        throw new Error(`Lovable AI error: ${aiResponse.status}`);
      }

      aiData = await aiResponse.json();
      break; // Sucesso, sair do loop
    }

    const content = aiData.choices[0].message.content;

    // Parse JSON da resposta
    let flowData;
    try {
      // Tentar extrair JSON (remover markdown se houver)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      flowData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('[FLOW-GEN] ❌ Erro ao parsear JSON:', e);
      throw new Error('Resposta da IA não é JSON válido');
    }

    // Validar campos obrigatórios
    if (!flowData.mermaid_code || !flowData.title) {
      throw new Error('Resposta da IA incompleta');
    }

    // Salvar no banco
    const { error: updateError } = await supabase
      .from('ai_generated_solutions')
      .update({
        implementation_flow: flowData,
        updated_at: new Date().toISOString()
      })
      .eq('id', solutionId);

    if (updateError) throw updateError;

    console.log('[FLOW-GEN] ✅ Fluxo gerado e salvo com sucesso');

    return new Response(
      JSON.stringify({ success: true, flow: flowData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[FLOW-GEN] ❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
