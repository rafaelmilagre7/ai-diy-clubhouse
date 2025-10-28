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

    // Buscar solução completa com perguntas e respostas
    const { data: solution, error: solutionError } = await supabase
      .from('ai_generated_solutions')
      .select('*')
      .eq('id', solutionId)
      .single();

    if (solutionError) throw solutionError;

    // Extrair perguntas e respostas da validação
    const questionsAsked = solution.questions_asked || [];
    const userAnswers = solution.user_answers || [];
    
    console.log(`[FLOW-GEN] 📝 Perguntas enviadas: ${questionsAsked.length}`);
    console.log('[FLOW-GEN] 🏗️ Framework Rafael Milagre incluído no contexto');

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

🏗️ FRAMEWORK DE IMPLEMENTAÇÃO (by Rafael Milagre):

PRIORIDADE 1 - DESENVOLVIMENTO DE PLATAFORMA:
🚀 Lovable (https://lovable.dev)
   - Quando usar: Aplicações web completas, dashboards, portais, sistemas internos, plataformas personalizadas
   - Capacidades: Frontend completo, autenticação de usuários, banco de dados (Supabase), APIs customizadas, integrações
   - Vantagens: Código próprio, escalável, personalizável, sem dependências externas, solução proprietária
   - Exemplos: Plataforma de atendimento com IA, sistema de gestão interna, portal de vendas, dashboard de analytics

PRIORIDADE 2 - AUTOMAÇÃO E INTEGRAÇÃO:
🔄 Make, n8n, Zapier
   - Quando usar: Conectar ferramentas existentes, webhooks, integrações pontuais, fluxos entre aplicativos
   - Capacidades: Fluxos automatizados entre aplicativos, gatilhos automáticos, sincronização de dados
   - Limitações: Dependente de ferramentas externas, menos personalizável, custos recorrentes por automação

PRIORIDADE 3 - BANCOS DE DADOS:
📊 Supabase (integrado ao Lovable), Airtable, Google Sheets, Notion Database, Firebase

PRIORIDADE 4 - INTELIGÊNCIA ARTIFICIAL:
🧠 APIs: OpenAI (GPT-5, DALL-E, Whisper), Anthropic (Claude), Google (Gemini), Grok, Deepseek, Manus
   Plataformas: ChatGPT, MidJourney, Stable Diffusion, ElevenLabs (voz), GPT-4 Vision

PRIORIDADE 5 - INTERFACES DE COMUNICAÇÃO:
💻 WhatsApp, CRM, ERP, Gmail, chatbot, Discord, Twilio, Site corporativo

Use essa hierarquia para priorizar ferramentas adequadas ao contexto da solução.

REGRAS MERMAID (CRÍTICAS - SIGA EXATAMENTE):
1. Use APENAS "graph TD" na primeira linha
2. IDs devem ser APENAS letras maiúsculas únicas (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O)
3. Textos descritivos SEMPRE entre colchetes [ ]
4. Setas SEMPRE com espaços: " --> " (nunca "-->")
5. Máximo 15 nós no total
6. Textos CURTOS: máximo 40 caracteres por nó
7. Decisões (if/else) usam chaves { } e labels nas setas: -->|Sim| e -->|Não|
8. NUNCA use: underscores, hífens, espaços ou números em IDs
9. NUNCA quebre uma definição de nó em múltiplas linhas
10. Cada linha deve ter EXATAMENTE: ID[Texto] --> ID2[Texto] ou ID{Decisão?}
11. 🚨 CRÍTICO - PARÊNTESES E VÍRGULAS: NUNCA use parênteses ( ) ou vírgulas , dentro dos labels [ ]
    - ❌ ERRADO: [Criar Contas (Make, ManyChat)]
    - ✅ CORRETO: [Criar Contas - Make e ManyChat]
    - ❌ ERRADO: [Configurar (WhatsApp, Email)]
    - ✅ CORRETO: [Configurar WhatsApp e Email]
    - Use "e" ou "-" para separar itens, NUNCA vírgulas ou parênteses

LINGUAGEM (CRÍTICO):
❌ NUNCA use termos técnicos: "Deploy", "API", "Endpoint", "Código", "Development", "Fine-tuning", "Backend", "Frontend", "Database"
✅ USE termos de negócio: "Conectar", "Configurar", "Ativar", "Testar", "Integrar", "Criar conta", "Linkar", "Ajustar"

🎯 REGRA "LOVABLE FIRST" (CRÍTICA):
SEMPRE avalie se a solução pode ser construída como uma aplicação web.
Se SIM → Priorize Lovable como base principal do fluxo
Se NÃO → Use automação (Make/n8n) apenas para integrações específicas

✅ USE LOVABLE QUANDO A SOLUÇÃO PRECISA DE:
- Interface web (dashboard, portal, sistema, painel de controle)
- Autenticação de usuários (login, perfis, permissões)
- Armazenar dados estruturados (cadastros, histórico, relatórios)
- APIs customizadas (endpoints próprios, integrações específicas)
- Solução escalável e proprietária (sem depender de plataformas externas)

❌ NÃO USE LOVABLE (use automação simples) QUANDO:
- Apenas integrar ferramentas existentes sem interface (ex: Slack → Gmail)
- Solução 100% via WhatsApp/chatbot sem necessidade de painel web
- Fluxo pontual e simples sem necessidade de plataforma completa

⚠️ ATENÇÃO: Lovable cria APLICAÇÕES WEB COMPLETAS, não é apenas automação.
Se a solução precisa de interface de usuário → Lovable é SEMPRE a primeira escolha.

ESTRUTURA DO FLUXO:
O fluxo deve responder: "O que eu faço PRIMEIRO? Depois? E por último?"
Use esta ordem lógica:
1. Preparação (ex: "Reunir materiais", "Criar contas")
2. Configuração inicial (ex: "Configurar ferramenta X")
3. Integrações (ex: "Conectar ferramenta Y")
4. Testes (ex: "Testar fluxo completo")
5. Ajustes (ex: "Refinar respostas")
6. Ativação (ex: "Liberar para equipe")

IMPORTANTE: O fluxo deve ter entre 12-15 nós para garantir detalhamento adequado e praticidade.

EXEMPLO 1 - Portal de Atendimento com IA (Lovable - Plataforma Web):
graph TD
    A[Mapear Requisitos] --> B[Criar Projeto no Lovable]
    B --> C[Configurar Autenticação]
    C --> D[Criar Banco Supabase]
    D --> E[Integrar API OpenAI]
    E --> F[Desenvolver Interface]
    F --> G[Testar Funcionalidades]
    G --> H{Precisa Integração Externa?}
    H -->|Sim| I[Conectar via Make]
    H -->|Não| J[Refinar Interface]
    I --> J
    J --> K[Treinar Equipe]
    K --> L[Publicar na Web]

EXEMPLO 2 - Automação Simples (Make/n8n - Sem Interface Web):
graph TD
    A[Mapear FAQs] --> B[Criar Base no Notion]
    B --> C[Configurar Make]
    C --> D[Integrar Claude AI]
    D --> E[Conectar Email]
    E --> F[Testar Resposta]
    F --> G{Precisa Humano?}
    G -->|Sim| H[Encaminhar Slack]
    G -->|Não| I[Responder Direto]
    H --> I
    I --> J[Salvar em Airtable]
    J --> K[Refinar Prompts]`;

    // Montar perguntas e respostas para contexto
    const qaSection = questionsAsked.length > 0 
      ? questionsAsked.map((q: string, i: number) => 
          `Pergunta ${i + 1}: ${q}\nResposta: ${userAnswers[i] || 'Não respondida'}`
        ).join('\n\n')
      : 'Nenhuma pergunta respondida';

    const userPrompt = `Crie um fluxo Mermaid (graph TD) com 12-15 etapas PRÁTICAS para um empresário implementar esta solução:

CONTEXTO DA SOLUÇÃO:
- Título: ${solution.title}
- Desafio do Negócio: ${solution.original_idea}
- Ferramentas Mapeadas: ${allTools}

📝 PERGUNTAS E RESPOSTAS DA VALIDAÇÃO:
${qaSection}

FRAMEWORK DE 4 PILARES:
1. 🤖 AUTOMAÇÃO: ${automationTools.join(', ') || 'Não mapeado'}
2. 🧠 IA: ${aiTools.join(', ') || 'Não mapeado'}
3. 📊 DADOS: ${dataTools.join(', ') || 'Não mapeado'}
4. 💻 INTERFACE: ${interfaceTools.join(', ') || 'Não mapeado'}

🎯 DECISÃO ESTRATÉGICA (RESPONDA ANTES DE CRIAR O FLUXO):
1. A solução precisa de uma interface web (dashboard, portal, sistema)?
   → Se SIM: Use Lovable como ferramenta BASE do fluxo
   
2. A solução é apenas integração entre ferramentas existentes sem interface?
   → Se SIM: Use Make/n8n como base
   
3. A solução precisa de banco de dados próprio, autenticação de usuários ou APIs customizadas?
   → Se SIM: Use Lovable + Supabase como base

⚠️ ATENÇÃO CRÍTICA:
- Lovable cria APLICAÇÕES WEB COMPLETAS (não é apenas automação)
- Se houver necessidade de interface de usuário → Lovable é SEMPRE a primeira escolha
- Make/n8n/Zapier são COMPLEMENTOS para integrações específicas, não substitutos de plataforma

MISSÃO:
Crie um roteiro visual que mostre COMO implementar essa solução usando as ferramentas mapeadas.
O fluxo deve ser PRÁTICO e EXECUTÁVEL por alguém SEM conhecimento técnico.

Use esta estrutura (adaptada conforme a ferramenta base escolhida):

SE USAR LOVABLE COMO BASE:
1. Mapear requisitos e funcionalidades
2. Criar projeto no Lovable
3. Configurar autenticação e banco de dados
4. Desenvolver interface principal
5. Integrar APIs de IA (se necessário)
6. Conectar integrações externas via Make (se necessário)
7. Testar funcionalidades completas
8. Refinar interface e experiência
9. Treinar equipe e publicar

SE USAR AUTOMAÇÃO SIMPLES (sem interface web):
1. Preparação (reunir materiais, criar contas)
2. Configuração das ferramentas principais
3. Integrações entre ferramentas
4. Testes do fluxo completo
5. Ajustes e refinamento
6. Ativação para uso real

LEMBRE-SE:
- Fale como se estivesse orientando um empresário, não um programador
- Use os nomes REAIS das ferramentas mapeadas acima
- Priorize Lovable se a solução precisa de interface web
- Ordem lógica: o que fazer primeiro, depois, por último
- Textos curtos (máx 40 caracteres por etapa)

RETORNE APENAS JSON VÁLIDO (sem markdown, sem \`\`\`):
{
  "mermaid_code": "graph TD\\n    A[Mapear Requisitos] --> B[Criar Projeto Lovable]\\n    B --> C[Configurar]\\n...",
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

VALIDAÇÃO FINAL (CRÍTICA):
- Se a solução precisa de interface web e você NÃO usou Lovable como base → REFAÇA
- Se você usou Make como base de uma aplicação web que precisa de login/dashboard → USE LOVABLE PRIMEIRO
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
    
    // Contar número de nós no diagrama (verificar se está entre 12-15)
    const nodeMatches = flowData.mermaid_code.match(/[A-O]\[/g);
    const nodeCount = nodeMatches ? nodeMatches.length : 0;
    console.log(`[FLOW-GEN] 📊 Diagrama possui ${nodeCount} nós`);
    
    if (nodeCount < 12 || nodeCount > 15) {
      console.warn(`[FLOW-GEN] ⚠️ Número de nós fora do ideal (12-15): ${nodeCount}`);
    }

    // 🔧 CAMADA 3: SANITIZAÇÃO MERMAID - Remover parênteses e vírgulas problemáticos
    const sanitizeMermaidCode = (code: string): string => {
      console.log('[FLOW-GEN] 🔧 Sanitizando código Mermaid...');
      
      // Processar linha por linha
      const sanitized = code
        .split('\n')
        .map(line => {
          // Detectar labels [...] e substituir parênteses e vírgulas
          return line.replace(/\[([^\]]+)\]/g, (match, content) => {
            const sanitizedContent = content
              .replace(/\(/g, '-')     // ( vira -
              .replace(/\)/g, '')      // ) vira vazio
              .replace(/,/g, ' e');    // , vira " e"
            
            if (content !== sanitizedContent) {
              console.log(`[FLOW-GEN] 🔧 Sanitizado: "${content}" → "${sanitizedContent}"`);
            }
            
            return `[${sanitizedContent}]`;
          });
        })
        .join('\n');
      
      console.log('[FLOW-GEN] ✅ Código Mermaid sanitizado');
      return sanitized;
    };

    // Aplicar sanitização antes de salvar
    const originalCode = flowData.mermaid_code;
    flowData.mermaid_code = sanitizeMermaidCode(originalCode);
    
    // Log da sanitização
    if (originalCode !== flowData.mermaid_code) {
      console.log('[FLOW-GEN] 🔧 Código foi modificado pela sanitização');
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
