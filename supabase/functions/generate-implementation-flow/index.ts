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

    // Buscar framework_mapping para contexto das ferramentas
    const frameworkData = solution.framework_mapping;
    
    // Extrair ferramentas dos 4 pilares
    const automationTools = frameworkData?.quadrant1_automation?.tool_names || [];
    const aiTools = frameworkData?.quadrant2_ai?.tool_names || [];
    const dataTools = frameworkData?.quadrant3_data?.tool_names || [];
    const interfaceTools = frameworkData?.quadrant4_interface?.tool_names || [];
    
    const allTools = [...automationTools, ...aiTools, ...dataTools, ...interfaceTools]
      .filter(Boolean)
      .join(', ') || 'Ferramentas não especificadas';

    // Montar prompt focado em negócio e no-code
    const systemPrompt = `Você é um CONSULTOR DE TRANSFORMAÇÃO DIGITAL especializado em guiar empresários e líderes a implementarem soluções de IA usando ferramentas NO-CODE.

Seu público NÃO é programador. São empresários que querem implementar IA de forma prática.

REGRAS MERMAID (CRÍTICAS - SIGA EXATAMENTE):
1. Use APENAS "graph TD" na primeira linha
2. IDs devem ser APENAS letras maiúsculas únicas (A, B, C, D, E, F, G, H, I, J, K, L)
3. Textos descritivos SEMPRE entre colchetes [ ]
4. Setas SEMPRE com espaços: " --> " (nunca "-->")
5. Máximo 12 nós no total
6. Textos CURTOS: máximo 40 caracteres por nó
7. Decisões (if/else) usam chaves { } e labels nas setas: -->|Sim| e -->|Não|
8. NUNCA use: underscores, hífens, espaços ou números em IDs
9. NUNCA quebre uma definição de nó em múltiplas linhas
10. Cada linha deve ter EXATAMENTE: ID[Texto] --> ID2[Texto] ou ID{Decisão?}

LINGUAGEM (CRÍTICO):
❌ NUNCA use termos técnicos: "Deploy", "API", "Endpoint", "Código", "Development", "Fine-tuning", "Backend", "Frontend", "Database"
✅ USE termos de negócio: "Conectar", "Configurar", "Ativar", "Testar", "Integrar", "Criar conta", "Linkar", "Ajustar"

ESTRUTURA DO FLUXO:
O fluxo deve responder: "O que eu faço PRIMEIRO? Depois? E por último?"
Use esta ordem lógica:
1. Preparação (ex: "Reunir materiais", "Criar contas")
2. Configuração inicial (ex: "Configurar ferramenta X")
3. Integrações (ex: "Conectar ferramenta Y")
4. Testes (ex: "Testar fluxo completo")
5. Ajustes (ex: "Refinar respostas")
6. Ativação (ex: "Liberar para equipe")

EXEMPLO 1 - Chatbot de Vendas:
graph TD
    A[Reunir PDFs dos Produtos] --> B[Criar Conta no ManyChat]
    B --> C[Conectar WhatsApp Business]
    C --> D[Configurar Cenário no Make]
    D --> E[Integrar GPT-4 no Make]
    E --> F[Criar Base no Google Sheets]
    F --> G[Testar Conversa Completa]
    G --> H{Respostas OK?}
    H -->|Não| I[Refinar Prompts]
    I --> G
    H -->|Sim| J[Conectar CRM]
    J --> K[Ativar para Vendedores]

EXEMPLO 2 - Automação de Suporte:
graph TD
    A[Mapear FAQs] --> B[Criar Base no Notion]
    B --> C[Configurar Zapier]
    C --> D[Integrar Claude AI]
    D --> E[Conectar Email]
    E --> F[Testar Resposta]
    F --> G{Precisa Humano?}
    G -->|Sim| H[Encaminhar Slack]
    G -->|Não| I[Responder Direto]
    H --> I
    I --> J[Salvar em Airtable]`;

    const userPrompt = `Crie um fluxo Mermaid (graph TD) com 10-12 etapas PRÁTICAS para um empresário implementar esta solução:

CONTEXTO DA SOLUÇÃO:
- Título: ${solution.title}
- Desafio do Negócio: ${solution.original_idea}
- Ferramentas Mapeadas: ${allTools}

FRAMEWORK DE 4 PILARES:
1. 🤖 AUTOMAÇÃO: ${automationTools.join(', ') || 'Não mapeado'}
2. 🧠 IA: ${aiTools.join(', ') || 'Não mapeado'}
3. 📊 DADOS: ${dataTools.join(', ') || 'Não mapeado'}
4. 💻 INTERFACE: ${interfaceTools.join(', ') || 'Não mapeado'}

MISSÃO:
Crie um roteiro visual que mostre COMO implementar essa solução usando as ferramentas mapeadas.
O fluxo deve ser PRÁTICO e EXECUTÁVEL por alguém SEM conhecimento técnico.

Use esta estrutura:
1. Preparação (reunir materiais, criar contas)
2. Configuração das ferramentas principais
3. Integrações entre ferramentas
4. Testes do fluxo completo
5. Ajustes e refinamento
6. Ativação para uso real

LEMBRE-SE:
- Fale como se estivesse orientando um empresário, não um programador
- Use os nomes REAIS das ferramentas mapeadas acima
- Ordem lógica: o que fazer primeiro, depois, por último
- Textos curtos (máx 40 caracteres por etapa)

RETORNE APENAS JSON VÁLIDO (sem markdown, sem \`\`\`):
{
  "mermaid_code": "graph TD\\n    A[Reunir PDFs] --> B[Criar Conta]\\n    B --> C[Conectar]\\n...",
  "title": "Roteiro de Implementação: ${solution.title.substring(0, 40)}",
  "description": "Passo a passo prático para colocar ${solution.title.substring(0, 30)} no ar usando no-code",
  "estimated_time": "2-4 horas",
  "key_steps": [
    "Preparar materiais necessários",
    "Configurar ferramenta principal",
    "Integrar com outras ferramentas",
    "Testar funcionamento completo",
    "Ajustar e refinar",
    "Ativar para uso real"
  ]
}

VALIDAÇÃO FINAL:
- Se você usou palavras como "deploy", "API", "código", "endpoint" → REFAÇA
- Se os passos são muito técnicos → SIMPLIFIQUE
- Se não mencionou as ferramentas do framework → INCLUA ELAS`;

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
          model: 'google/gemini-2.5-pro', // Modelo mais capaz para melhor qualidade
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7, // Criatividade moderada para soluções práticas
          max_tokens: 8000, // Mais tokens para resposta detalhada
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

    // Validação de qualidade: verificar linguagem técnica
    const technicalWords = ['deploy', 'api', 'endpoint', 'código', 'development', 'backend', 'frontend', 'database', 'fine-tuning'];
    const mermaidLower = flowData.mermaid_code.toLowerCase();
    const foundTechnicalWords = technicalWords.filter(word => mermaidLower.includes(word));
    
    if (foundTechnicalWords.length > 0) {
      console.warn('[FLOW-GEN] ⚠️ Linguagem técnica detectada:', foundTechnicalWords);
      console.warn('[FLOW-GEN] Salvando mesmo assim, mas pode precisar de regeneração');
      // Não bloquear, apenas alertar - deixar usuário regenerar se necessário
    }
    
    // Contar número de nós no diagrama (verificar se está entre 8-12)
    const nodeMatches = flowData.mermaid_code.match(/[A-L]\[/g);
    const nodeCount = nodeMatches ? nodeMatches.length : 0;
    console.log(`[FLOW-GEN] 📊 Diagrama possui ${nodeCount} nós`);
    
    if (nodeCount < 8 || nodeCount > 12) {
      console.warn(`[FLOW-GEN] ⚠️ Número de nós fora do ideal (8-12): ${nodeCount}`);
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
