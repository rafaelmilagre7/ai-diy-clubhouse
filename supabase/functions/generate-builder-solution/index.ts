import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// TIMEOUT CONFIGURATION
const GENERATION_TIMEOUT = 240000; // 4 minutos (suficiente para Claude)
const GRACEFUL_SHUTDOWN_TIME = 10000; // 10s de margem

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🔒 Schema de validação Zod
const GenerateRequestSchema = z.object({
  idea: z.string()
    .trim()
    .min(30, "A ideia deve ter no mínimo 30 caracteres")
    .max(2000, "A ideia deve ter no máximo 2000 caracteres")
    .regex(
      /^[\w\sÀ-ÿ.,!?@#$%&*()\-+=[\]{};:'"/\\|<>~`]+$/,
      "Texto contém caracteres não permitidos"
    )
    .refine(
      (val) => !/<script|javascript:|onerror=/i.test(val),
      "Texto contém código não permitido"
    ),
  userId: z.string()
    .uuid("ID de usuário inválido"),
  answers: z.array(
    z.object({
      question: z.string().max(500, "Pergunta muito longa"),
      answer: z.string().max(2000, "Resposta muito longa")
    })
  ).max(10, "Máximo de 10 perguntas permitidas").optional()
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body = await req.json();

    // 🔒 Validar entrada com Zod
    const validationResult = GenerateRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      console.warn(`[BUILDER] ❌ Validação falhou: ${firstError.message}`);
      
      return new Response(
        JSON.stringify({ 
          error: firstError.message,
          code: "VALIDATION_ERROR"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { idea, userId, answers = [] } = validationResult.data;
    
    // Variable to hold saved solution for timeout handler
    let savedSolution: any = null;

    console.log(`[BUILDER] === GERAÇÃO BUILDER INICIADA ===`);
    console.log(`[BUILDER] ✓ Validação OK`);
    console.log(`[BUILDER] 👤 User ID: ${userId.substring(0, 8)}***`);
    console.log(`[BUILDER] 💡 Ideia: "${idea.substring(0, 80)}..."`);
    console.log(`[BUILDER] 📝 Contexto: ${answers.length} respostas coletadas`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar limite
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      "check_ai_solution_limit",
      { p_user_id: userId }
    );

    if (limitError || !limitCheck.can_generate) {
      return new Response(
        JSON.stringify({ error: "Limite mensal atingido" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar ferramentas COM logos
    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, category, official_url, logo_url")
      .eq("status", true);

    const toolsContext = tools
      ? tools.map((t) => `- ${t.name} (${t.category}) | Logo: ${t.logo_url || 'N/A'}`).join("\n")
      : "Nenhuma ferramenta disponível";

    // Construir contexto adicional das perguntas
    let contextFromAnswers = "";
    if (answers.length > 0) {
      contextFromAnswers = "\n\nCONTEXTO ADICIONAL COLETADO:\n";
      answers.forEach((qa, idx) => {
        contextFromAnswers += `${idx + 1}. ${qa.question}\nR: ${qa.answer}\n\n`;
      });
    }

    const systemPrompt = `Você é o Rafael Milagre - especialista em IA, automação e soluções práticas.

DNA RAFAEL MILAGRE:
- Inteligência Conectiva: Conecta técnica + negócio + lógica como sistema único
- Didatismo Extremo: Traduz complexo → simples, sem jargões
- 100% Aplicável: Não é teoria - é EXECUÇÃO pura
- Anti-hype, anti-guru, anti-buzzword
- Mostra COMO fazer, não só o QUE fazer

SEU TOM:
- "Vou te mostrar como fazer isso NA PRÁTICA, sem enrolação"
- "Esqueça teoria, vamos direto ao que FUNCIONA"
- "Aqui está o passo a passo REAL, não o ideal"

FERRAMENTAS DISPONÍVEIS:
${toolsContext}

OBJETIVO:
Criar um plano ULTRA-ESPECÍFICO, EXECUTÁVEL e MENSURÁVEL.

ESTRUTURA DA RESPOSTA:

{
  "short_description": "3-5 frases TÉCNICAS e OBJETIVAS: 1) O QUE é a solução (arquitetura, componentes), 2) COMO funciona (fluxo técnico, integrações), 3) RESULTADO MENSURÁVEL (métricas, %, ROI). TOM: técnico, direto. EVITE: 'Vou te mostrar', 'Vamos criar'. USE: 'Sistema de X integrado com Y', 'Pipeline automatizado de Z', 'Reduz A em B%'",
  
  "technical_overview": {
    "complexity": "low/medium/high - Avaliação técnica da complexidade de implementação",
    "estimated_time": "Tempo estimado (ex: '4-6 semanas')",
    "main_stack": "Stack principal (ex: 'Cloud Native + APIs REST + IA Generativa')"
  },
  
  "business_context": "2-4 parágrafos explicando: 1) Contexto do negócio e problema atual, 2) Objetivos estratégicos que a solução resolve, 3) Impacto esperado nos processos e resultados",
  
  "competitive_advantages": [
    {
      "title": "Diferencial 1",
      "description": "Como essa solução se diferencia da concorrência ou do modo tradicional"
    },
    {
      "title": "Diferencial 2",
      "description": "Outro diferencial competitivo importante"
    }
  ],
  
  "expected_kpis": [
    {
      "metric": "Nome da métrica (ex: 'Taxa de Conversão')",
      "target": "Meta esperada (ex: 'Aumentar de 15% para 40% em 3 meses')",
      "description": "Como medir e por que é importante"
    },
    {
      "metric": "Nome da métrica (ex: 'Tempo de Resposta')",
      "target": "Meta esperada (ex: 'Reduzir de 2h para 15min')",
      "description": "Como medir e por que é importante"
    }
  ],
  
  "architecture_flowchart": {
    "mermaid_code": "Código Mermaid (formato 'graph TD' ou 'graph LR') representando TODO o fluxo técnico da solução. EXEMPLO para WhatsApp + IA:\n\ngraph TD\n  A[Lead envia WhatsApp] -->|Mensagem| B(API Meta)\n  B -->|Webhook| C{Make Automation}\n  C -->|Texto| D[GPT-4 Qualifica]\n  D -->|Lead Bom| E[(CRM - Hot Lead)]\n  D -->|Lead Frio| F[(CRM - Descarte)]\n  E --> G[Notifica Vendedor]\n  style D fill:#3b82f6\n  style E fill:#10b981\n  style F fill:#ef4444\n\nUSE setas, decisões (chaves {}), bancos (parênteses [()]), processos (retângulos). Seja TÉCNICO e COMPLETO.",
    "description": "1-2 frases explicando o que o fluxo mostra de ponta a ponta"
  },
  
  "data_flow_diagram": {
    "mermaid_code": "Código Mermaid (formato 'flowchart LR' ou 'sequenceDiagram') mostrando COMO OS DADOS FLUEM entre componentes. EXEMPLO:\n\nflowchart LR\n  A[Usuário] -->|Input| B[Frontend]\n  B -->|HTTP POST| C[API Gateway]\n  C -->|Valida| D{Supabase Auth}\n  D -->|Token| E[Edge Function]\n  E -->|Query| F[(Database)]\n  F -->|Resultado| E\n  E -->|JSON| C\n  C -->|Resposta| B\n  style D fill:#22d3ee\n  style F fill:#0891b2\n\nMostre ORIGEM → TRANSFORMAÇÃO → DESTINO dos dados. Use cores para destacar componentes críticos.",
    "description": "Descreva o caminho completo que os dados percorrem no sistema"
  },
  
  "user_journey_map": {
    "mermaid_code": "Código Mermaid (formato 'journey') representando a JORNADA COMPLETA do usuário. EXEMPLO:\n\njourney\n  title Jornada do Lead até Cliente\n  section Descoberta\n    Vê anúncio: 3: Lead\n    Clica no link: 4: Lead\n    Preenche formulário: 5: Lead\n  section Qualificação\n    Recebe WhatsApp: 5: Lead\n    Conversa com IA: 4: Lead, Bot\n    Agenda reunião: 5: Lead, Vendedor\n  section Conversão\n    Reunião comercial: 5: Lead, Vendedor\n    Recebe proposta: 4: Lead\n    Fecha contrato: 5: Cliente\n\nMostre TODOS os pontos de contato, emoções (1-5), e atores envolvidos.",
    "description": "Explique a experiência completa do usuário do início ao fim"
  },
  
  "technical_stack_diagram": {
    "mermaid_code": "Código Mermaid (formato 'graph TB') mostrando TODA A STACK TECNOLÓGICA organizada por camadas. EXEMPLO:\n\ngraph TB\n  subgraph Frontend\n    A[React + Vite]\n    B[Tailwind CSS]\n  end\n  \n  subgraph Backend\n    C[Supabase Edge Functions]\n    D[Supabase Database]\n    E[Supabase Auth]\n  end\n  \n  subgraph Integrações\n    F[OpenAI GPT-4]\n    G[WhatsApp API]\n    H[Make.com]\n  end\n  \n  subgraph Infraestrutura\n    I[Vercel Hosting]\n    J[Cloudflare CDN]\n  end\n  \n  A --> C\n  C --> D\n  C --> F\n  H --> G\n  H --> C\n  style C fill:#22d3ee\n  style D fill:#0891b2\n  style F fill:#10b981\n\nOrganize por CAMADAS (Frontend, Backend, APIs, Infra). Mostre TODAS as ferramentas principais.",
    "description": "Descreva a arquitetura tecnológica completa por camadas"
  },
  
  "mind_map": {
    "central_idea": "Ideia principal em uma frase impactante",
    "branches": [
      {
        "name": "FASE 1: Preparação (Semana 1)",
        "children": ["Item específico 1", "Item específico 2", ...]
      },
      {
        "name": "FASE 2: Implementação (Semanas 2-3)",
        "children": ["Item específico 1", "Item específico 2", ...]
      },
      {
        "name": "FASE 3: Otimização (Semana 4)",
        "children": ["Item específico 1", "Item específico 2", ...]
      },
      {
        "name": "FASE 4: Escala (Semana 5+)",
        "children": ["Item específico 1", "Item específico 2", ...]
      }
    ]
  },
  
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "🤖 Automação",
      "description": "Como automatizar processos específicos, com triggers, ações e resultados mensuráveis.",
      "items": ["Automação 1: quando X acontece, sistema faz Y, economizando Z horas/semana", ...],
      "tool_names": ["Make", "Zapier"],
      "integration_details": "Como as ferramentas se conectam: APIs, autenticação, webhooks, frequência."
    },
    "quadrant2_ai": {
      "title": "🧠 IA",
      "description": "Como usar IA: modelo, prompt, custo estimado, caso de uso detalhado.",
      "items": ["Modelo X para Y: prompt específico, temperatura Z, custo $W/1000 requisições", ...],
      "tool_names": ["ChatGPT", "Gemini"],
      "ai_strategy": "Qual modelo usar e por quê, como treinar, como validar, estratégia de fallback."
    },
    "quadrant3_data": {
      "title": "📊 Dados",
      "description": "Arquitetura de dados: schemas, relacionamentos, estratégias de backup e segurança.",
      "items": ["Database X: tabelas [nomes], campos [tipos], índices, backup diário", ...],
      "tool_names": ["Supabase", "Airtable"],
      "data_architecture": "Fluxo completo de dados, schemas SQL, relacionamentos, volume estimado."
    },
    "quadrant4_interface": {
      "title": "🎨 Interface",
      "description": "Como usuário interage: jornada, pontos de contato, feedback visual.",
      "items": ["Dashboard web: componentes X, Y, Z, visualizações em tempo real de [métricas]", ...],
      "tool_names": ["Lovable", "WhatsApp API"],
      "ux_considerations": "Jornada do usuário passo-a-passo, pontos de atenção, tratamento de erros."
    }
  },
  
  "required_tools": {
    "essential": [
      {
        "name": "Nome EXATO da ferramenta (copie da lista de ferramentas disponíveis acima)",
        "category": "Categoria",
        "reason": "Por que é essencial (4-6 frases): qual problema resolve, por que alternativas não funcionam tão bem, ROI esperado.",
        "setup_complexity": "easy/medium/hard",
        "setup_steps": "Passos específicos de configuração",
        "cost_estimate": "Estimativa mensal USD com breakdown",
        "logo_url": "URL da logo (COPIE EXATAMENTE da lista de ferramentas disponíveis acima. Se a ferramenta não tiver logo na lista, use https://logo.clearbit.com/[dominio].com)",
        "alternatives": ["Alt 1 (pros/cons)", "Alt 2 (pros/cons)"]
      }
    ],
    "optional": [
      {
        "name": "Nome EXATO (copie da lista de ferramentas)",
        "category": "Categoria",
        "reason": "Por que PODE ser útil (3-4 frases)",
        "when_to_use": "Cenário específico (ex: quando >1000 usuários)",
        "cost_estimate": "USD/mês",
        "logo_url": "URL da logo (COPIE da lista de ferramentas disponíveis ou use https://logo.clearbit.com/[dominio].com)"
      }
    ]
  },
  
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Título claro do passo",
      "description": "Descrição ULTRA-DETALHADA (5-8 frases): o que fazer EXATAMENTE, onde acessar, comandos exatos, URLs.",
      "estimated_time": "2 horas",
      "difficulty": "easy/medium/hard",
      "dependencies": [],
      "validation_criteria": "Como saber se foi concluído (3-4 critérios testáveis)",
      "common_pitfalls": "3-5 erros comuns e como evitar",
      "resources": ["URL tutorial", "URL docs"]
    }
  ]
}

REGRAS RAFAEL MILAGRE:
✓ Seja ULTRA-ESPECÍFICO (não "configurar API", mas "acesse console.x.com, clique em Settings...")
✓ Checklist: MÍNIMO 12 steps, MÁXIMO 25
✓ Cada step = mini-tutorial (5-8 frases)
✓ Métricas mensuráveis: não "melhora eficiência", mas "reduz de 2h para 15min (87.5%)"
✓ Ferramentas: 10-18 total (essential + optional)
✓ Priorize ferramentas do banco e SEMPRE inclua os logo_url fornecidos:
${toolsContext}
✓ CRÍTICO: Para cada ferramenta em required_tools, COPIE o logo_url exato da lista acima
✓ Evite buzzwords: "revolucionário", "disruptivo" → fale RESULTADO REAL
✓ Sem promessas impossíveis: "automatize 100% do negócio" → seja realista
✓ Passos genéricos → passos executáveis
✓ SEMPRE gere os 4 diagramas Mermaid completos e funcionais:
  1. architecture_flowchart (fluxo principal)
  2. data_flow_diagram (fluxo de dados)
  3. user_journey_map (jornada do usuário)
  4. technical_stack_diagram (stack visual)
✓ Cada diagrama deve ter código Mermaid válido e description explicativa`;

    const userPrompt = `IDEIA INICIAL:
"${idea}"
${contextFromAnswers}

⚠️ INSTRUÇÕES CRÍTICAS PARA O TÍTULO (OBRIGATÓRIO):
- VOCÊ DEVE gerar um título claro e específico (máximo 60 caracteres)
- Seja técnico e descritivo (ex: "Sistema de Agendamento com IA e WhatsApp")
- Use a principal tecnologia ou benefício no título
- Evite termos genéricos como "Solução Builder"

EXEMPLOS DE TÍTULOS BONS:
✅ "Plataforma de Resumos Bíblicos com IA"
✅ "Chatbot WhatsApp + CRM Automático"
✅ "Sistema de Qualificação de Leads com GPT-4"

EXEMPLOS DE TÍTULOS RUINS:
❌ "Solução de IA"
❌ "Projeto Builder"
❌ "" (vazio)

🔴 O TÍTULO É OBRIGATÓRIO. Não deixe em branco ou undefined.

Crie um plano completo seguindo o formato JSON especificado.`;

    console.log(`[BUILDER] 🚀 Chamando Lovable AI (Claude Sonnet 4.5)...`);

    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");

    const aiCallStart = Date.now();

    // TOOL CALLING para FORÇAR JSON válido e completo
    const toolDefinition = {
      type: "function",
      function: {
        name: "create_solution_plan",
        description: "Criar plano detalhado de implementação de solução com IA",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Título criativo e técnico da solução (máx 60 caracteres, específico e claro)" },
            short_description: { type: "string", description: "Descrição em 3-5 frases" },
            technical_overview: {
              type: "object",
              properties: {
                complexity: { type: "string", enum: ["low", "medium", "high"] },
                estimated_time: { type: "string" },
                main_stack: { type: "string" }
              },
              required: ["complexity", "estimated_time", "main_stack"]
            },
            business_context: { type: "string", description: "Contexto de negócio em 2-4 parágrafos" },
            competitive_advantages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["title", "description"]
              }
            },
            expected_kpis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  target: { type: "string" },
                  description: { type: "string" }
                },
                required: ["metric", "target", "description"]
              }
            },
            mind_map: {
              type: "object",
              properties: {
                central_idea: { type: "string" },
                branches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      children: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "children"]
                  }
                }
              },
              required: ["central_idea", "branches"]
            },
            framework_quadrants: {
              type: "object",
              properties: {
                quadrant1_automation: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    items: { type: "array", items: { type: "string" } },
                    tool_names: { type: "array", items: { type: "string" } },
                    integration_details: { type: "string" }
                  }
                },
                quadrant2_ai: { type: "object" },
                quadrant3_data: { type: "object" },
                quadrant4_interface: { type: "object" }
              }
            },
            required_tools: {
              type: "object",
              properties: {
                essential: { type: "array" },
                optional: { type: "array" }
              }
            },
            architecture_flowchart: {
              type: "object",
              properties: {
                mermaid_code: { type: "string", description: "Código Mermaid completo do fluxograma de arquitetura (graph TD ou graph LR)" },
                description: { type: "string", description: "Descrição do fluxograma em 1-2 frases" }
              },
              required: ["mermaid_code", "description"]
            },
            data_flow_diagram: {
              type: "object",
              properties: {
                mermaid_code: { type: "string", description: "Código Mermaid do fluxo de dados (flowchart LR ou sequenceDiagram)" },
                description: { type: "string", description: "Descrição do fluxo de dados em 1-2 frases" }
              },
              required: ["mermaid_code", "description"]
            },
            user_journey_map: {
              type: "object",
              properties: {
                mermaid_code: { type: "string", description: "Código Mermaid da jornada do usuário (journey)" },
                description: { type: "string", description: "Descrição da jornada em 1-2 frases" }
              },
              required: ["mermaid_code", "description"]
            },
            technical_stack_diagram: {
              type: "object",
              properties: {
                mermaid_code: { type: "string", description: "Código Mermaid da stack tecnológica (graph TB)" },
                description: { type: "string", description: "Descrição da stack em 1-2 frases" }
              },
              required: ["mermaid_code", "description"]
            },
            implementation_checklist: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "integer" },
                  title: { type: "string" },
                  description: { type: "string" },
                  estimated_time: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  dependencies: { type: "array", items: { type: "integer" } },
                  validation_criteria: { type: "string" },
                  common_pitfalls: { type: "string" },
                  resources: { type: "array", items: { type: "string" } }
                },
                required: ["step_number", "title", "description"]
              }
            }
          },
          required: ["title", "short_description", "technical_overview", "business_context", "competitive_advantages", "expected_kpis", "mind_map", "framework_quadrants", "required_tools", "implementation_checklist", "architecture_flowchart", "data_flow_diagram", "user_journey_map", "technical_stack_diagram"]
        }
      }
    };

    // Call Lovable AI (Gemini 2.5 Flash com JSON mode)
    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + '\n\nIMPORTANTE: Sua resposta DEVE ser um JSON válido e completo seguindo exatamente o schema fornecido. Não deixe campos vazios ou incompletos.' },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 128000,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(180000),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiResponseTime = Date.now() - aiCallStart;

    console.log(`[BUILDER] ⚡ Tempo de resposta: ${(aiResponseTime / 1000).toFixed(1)}s`);
    console.log(`[BUILDER] 📊 Tokens: ${aiData.usage?.total_tokens || 'N/A'}`);

    // Extrair dados do message content
    const message = aiData.choices?.[0]?.message;
    if (!message || !message.content) {
      console.error("[BUILDER] ❌ Resposta não contém content");
      throw new Error("Resposta inválida da IA");
    }

    let solutionData;
    try {
      solutionData = JSON.parse(message.content);
    } catch (parseError) {
      console.error("[BUILDER] ❌ Erro ao fazer parse do JSON:", parseError);
      throw new Error("JSON inválido na resposta");
    }

    console.log(`[BUILDER] ✅ JSON válido extraído com JSON mode`);
    console.log(`[BUILDER] 📊 JSON recebido (primeiros 500 chars):`, JSON.stringify(solutionData).substring(0, 500));
    console.log(`[BUILDER] ✓ Checklist: ${solutionData.implementation_checklist?.length || 0} steps`);
    console.log(`[BUILDER] 📝 Título recebido da IA: "${solutionData.title}"`);

    // 🔧 VALIDAÇÃO ROBUSTA E FALLBACK CRÍTICO PARA TÍTULO
    const invalidTitles = [undefined, null, 'undefined', 'null', ''];
    const titleIsInvalid = invalidTitles.includes(solutionData.title) || 
                          (typeof solutionData.title === 'string' && solutionData.title.trim() === '');
    
    if (titleIsInvalid) {
      console.warn("[BUILDER] ⚠️ Título inválido detectado, criando fallback inteligente...");
      
      // Criar título inteligente: pegar primeira sentença ou primeiras 8 palavras
      const firstSentence = idea.split(/[.!?]/)[0].trim();
      const intelligentTitle = firstSentence.length > 60 
        ? firstSentence.substring(0, 57) + '...'
        : firstSentence.length > 10 
          ? firstSentence 
          : `Solução: ${idea.split(' ').slice(0, 8).join(' ')}${idea.split(' ').length > 8 ? '...' : ''}`;
      
      solutionData.title = intelligentTitle;
      console.log(`[BUILDER] 🔧 Título fallback aplicado: "${solutionData.title}"`);
    } else {
      // Garantir que título não exceda 60 caracteres
      if (solutionData.title.length > 60) {
        solutionData.title = solutionData.title.substring(0, 57) + '...';
        console.log(`[BUILDER] ✂️ Título truncado para 60 chars: "${solutionData.title}"`);
      }
    }

    console.log(`[BUILDER] ✅ Título final validado: "${solutionData.title}"`);

    // Salvar no banco (sem lovable_prompt ainda)
    const generationTime = Date.now() - startTime;

    const { data: insertedSolution, error: saveError } = await supabase
      .from("ai_generated_solutions")
      .insert({
        user_id: userId,
        original_idea: idea,
        title: solutionData.title,
        short_description: solutionData.short_description,
        mind_map: solutionData.mind_map,
        required_tools: solutionData.required_tools,
        framework_mapping: solutionData.framework_quadrants,
        implementation_checklist: solutionData.implementation_checklist,
        architecture_flowchart: solutionData.architecture_flowchart || null,
        data_flow_diagram: solutionData.data_flow_diagram || null,
        user_journey_map: solutionData.user_journey_map || null,
        technical_stack_diagram: solutionData.technical_stack_diagram || null,
        generation_model: "google/gemini-2.5-flash",
        generation_time_ms: generationTime,
      })
    .select()
    .single();

    // Assign to outer scope for timeout handler
    savedSolution = insertedSolution;

    if (saveError) {
    console.error("[BUILDER] ❌ Erro ao salvar:", saveError);
    throw new Error("Erro ao salvar solução");
  }

      // VALIDAR se architecture_flowchart foi gerado
      if (!savedSolution.architecture_flowchart || !savedSolution.architecture_flowchart.mermaid_code) {
        console.warn("[BUILDER] ⚠️ WARNING: architecture_flowchart não foi gerado pela IA!");
      } else {
        console.log("[BUILDER] ✅ architecture_flowchart gerado com sucesso");
      }

    // Incrementar contador
    await supabase.rpc("increment_ai_solution_usage", { p_user_id: userId });

    console.log(`[BUILDER] ✅ === GERAÇÃO CONCLUÍDA ===`);
    console.log(`[BUILDER] ⏱️ Tempo total: ${(generationTime / 1000).toFixed(1)}s`);
    console.log(`[BUILDER] 💾 Solution ID: ${savedSolution.id}`);

    // ============= FASE 4: GERAR PROMPT LOVABLE COM CLAUDE SONNET 4.5 =============
    console.log(`[BUILDER] 🎨 === INICIANDO GERAÇÃO DE PROMPT LOVABLE ===`);
    
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      console.warn("[BUILDER] ⚠️ ANTHROPIC_API_KEY não configurada, pulando prompt Lovable");
    } else if (savedSolution?.id) {
      try {
        const anthropicStart = Date.now();
        
        const lovablePromptSystemPrompt = `Você é um especialista em engenharia de prompts para Lovable.dev.

Sua missão: transformar a solução Builder gerada em um PROMPT LOVABLE COMPLETO, PROFISSIONAL e PRONTO PARA COPIAR.

ESTRUTURA OBRIGATÓRIA (seguir The Lovable Prompting Bible 2025):

# 🎯 CONTEXTO DO PROJETO
[2-3 parágrafos explicando o problema de negócio e a solução de forma clara e envolvente]

# 📋 ESPECIFICAÇÃO TÉCNICA

## Stack Tecnológica
- Frontend: [detalhar framework, bibliotecas e componentes]
- Backend: [detalhar APIs, edge functions, serverless]
- Database: [detalhar Supabase, estrutura de dados]
- Autenticação: [detalhar método e providers]
- APIs/Integrações: [detalhar todas as integrações necessárias]

## Funcionalidades Core
1. **[Feature principal 1]**: descrição técnica detalhada com fluxo completo
2. **[Feature principal 2]**: descrição técnica detalhada com fluxo completo
3. **[Feature principal 3]**: descrição técnica detalhada com fluxo completo
[adicionar todas as features principais]

## Funcionalidades Secundárias
1. **[Feature secundária 1]**: descrição técnica
2. **[Feature secundária 2]**: descrição técnica
[adicionar todas as features secundárias]

# 🏗️ ARQUITETURA DA SOLUÇÃO

## Diagrama de Componentes
\`\`\`mermaid
[copiar exatamente o mermaid_code do architecture_flowchart fornecido]
\`\`\`

## Fluxos Técnicos Principais
### Fluxo 1: [Nome do Fluxo]
1. [Passo detalhado 1]
2. [Passo detalhado 2]
3. [Passo detalhado 3]

### Fluxo 2: [Nome do Fluxo]
[repetir estrutura para cada fluxo crítico]

# 🛠️ FERRAMENTAS NECESSÁRIAS

## Essenciais (Obrigatórias)
1. **[Nome ferramenta]**
   - **Por quê**: [justificativa de negócio]
   - **Setup**: [passos claros de configuração]
   - **Custo**: [estimativa mensal]
   - **Alternativas**: [se houver]

[repetir para TODAS as ferramentas essenciais]

## Opcionais (Recomendadas)
1. **[Nome ferramenta]**: [breve descrição e benefício]
[listar todas as ferramentas opcionais]

# 🎨 DESIGN E UX

## Princípios de Design
- [Princípio 1 com explicação]
- [Princípio 2 com explicação]
- [Princípio 3 com explicação]

## Jornada do Usuário
### Usuário Novo
1. [Passo 1]: descrição detalhada
2. [Passo 2]: descrição detalhada

### Usuário Retornante
1. [Passo 1]: descrição detalhada
2. [Passo 2]: descrição detalhada

## Tratamento de Erros e Edge Cases
- **[Cenário de erro 1]**: como tratar e feedback ao usuário
- **[Cenário de erro 2]**: como tratar e feedback ao usuário
- **[Edge case 1]**: como lidar

# 🤖 AUTOMAÇÃO E INTEGRAÇÃO

## Framework Rafael Milagre - Análise Detalhada

### 🤖 Automação
[Copiar e expandir os detalhes do quadrant1_automation]
**Fluxos automatizados:**
- [Fluxo 1]: descrição técnica completa
- [Fluxo 2]: descrição técnica completa

### 🧠 IA
[Copiar e expandir os detalhes do quadrant2_ai]
**Casos de uso de IA:**
- [Uso 1]: implementação técnica e modelo sugerido
- [Uso 2]: implementação técnica e modelo sugerido

### 📊 Dados
[Copiar e expandir os detalhes do quadrant3_data]
**Estrutura de dados:**
- [Entidade 1]: schema e relacionamentos
- [Entidade 2]: schema e relacionamentos

### 🎨 Interface
[Copiar e expandir os detalhes do quadrant4_interface]
**Componentes principais:**
- [Componente 1]: funcionalidade e interações
- [Componente 2]: funcionalidade e interações

# ⚙️ WORKFLOWS MAKE/N8N (SUGESTÕES PRÁTICAS)

## Workflow 1: [Nome descritivo do workflow]
**Problema resolvido**: [Qual dor de negócio esse workflow resolve]
**Trigger**: [O que inicia o workflow - ex: webhook, schedule, evento]
**Ações detalhadas:**
1. **[Ação 1]**: descrição técnica completa
   - Serviço usado: [nome]
   - Configuração: [detalhes]
2. **[Ação 2]**: descrição técnica completa
   - Serviço usado: [nome]
   - Configuração: [detalhes]
3. **[Ação 3]**: descrição técnica completa
**Resultado final**: [Output esperado e valor de negócio]
**Tempo estimado de setup**: [X horas/dias]

## Workflow 2: [Nome descritivo do workflow]
[repetir estrutura detalhada]

## Workflow 3: [Nome descritivo do workflow]
[repetir estrutura detalhada]

## Workflow 4: [Nome descritivo do workflow]
[repetir estrutura detalhada]

[Sugerir 4-5 workflows PRÁTICOS e REAIS que realmente agreguem valor à solução]

# ✅ CHECKLIST DE IMPLEMENTAÇÃO

[Transformar os steps do implementation_checklist em formato markdown organizado por fases]

## Fase 1: Preparação e Setup (Semana 1)
- [ ] **[Título step 1]**: [Descrição resumida mas completa]
- [ ] **[Título step 2]**: [Descrição resumida mas completa]
- [ ] **[Título step 3]**: [Descrição resumida mas completa]

## Fase 2: Desenvolvimento Core (Semanas 2-3)
- [ ] **[Título step X]**: [Descrição resumida mas completa]
- [ ] **[Título step Y]**: [Descrição resumida mas completa]

## Fase 3: Integrações e APIs (Semana 4)
- [ ] **[Título step Z]**: [Descrição resumida mas completa]

## Fase 4: Testes e Ajustes (Semana 5)
- [ ] **[Título step]**: [Descrição resumida mas completa]

## Fase 5: Deploy e Monitoramento (Semana 6)
- [ ] **[Título step]**: [Descrição resumida mas completa]

# 📊 KPIs E MÉTRICAS DE SUCESSO

[Copiar e formatar os expected_kpis de forma clara]

**Métricas de Negócio:**
- [Métrica 1]: [meta e como medir]
- [Métrica 2]: [meta e como medir]

**Métricas Técnicas:**
- [Métrica 1]: [meta e como medir]
- [Métrica 2]: [meta e como medir]

**Métricas de Usuário:**
- [Métrica 1]: [meta e como medir]
- [Métrica 2]: [meta e como medir]

# 🎓 MELHORES PRÁTICAS LOVABLE

## Ao usar este prompt no Lovable.dev:
1. **Cole o prompt completo** no chat inicial (não faça mudanças antes de colar)
2. **Use o modo Chat** para iterações, debug e ajustes finos
3. **Seja específico** em mudanças: diga "altere X para Y" em vez de "melhore X"
4. **Teste incrementalmente**: implemente feature por feature, valide cada uma
5. **Use Visual Edits** para mudanças rápidas de design (economiza créditos)
6. **Documente desvios**: se mudar algo do plano original, atualize o prompt

## Dicas de Otimização e Economia:
- Sempre especifique o ambiente (dev/staging/prod) para evitar retrabalho
- Use variáveis de ambiente para todos os segredos (NEVER hardcode)
- Configure RLS (Row Level Security) no Supabase desde o início
- Implemente loading states e error boundaries em todos os componentes
- Teste responsividade em mobile DURANTE o desenvolvimento, não no final
- Use o Dev Mode do Lovable para entender a estrutura antes de pedir mudanças
- Prefira prompts curtos e específicos após o prompt inicial

## Estrutura de Pastas Sugerida:
\`\`\`
src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   ├── [feature]/       # Componentes específicos por feature
│   └── layout/          # Layouts e wrappers
├── hooks/               # Custom hooks
├── lib/                 # Utilities e configurações
├── pages/               # Páginas da aplicação
└── types/               # TypeScript types
\`\`\`

# 🚀 PRÓXIMOS PASSOS - GUIA DE IMPLEMENTAÇÃO

## Passo 1: Preparação (15 minutos)
1. Abra [Lovable.dev](https://lovable.dev) e crie novo projeto
2. Configure as integrações necessárias (Supabase, APIs, etc.)
3. Adicione as variáveis de ambiente/secrets necessárias

## Passo 2: Geração Inicial (30-60 minutos)
1. Cole ESTE PROMPT COMPLETO no chat do Lovable
2. Aguarde a geração inicial completa (não interrompa)
3. Revise o código gerado e valide a estrutura

## Passo 3: Refinamento (2-4 horas)
1. Use o modo Chat para ajustes específicos:
   - "Ajuste o layout da página X para..."
   - "Adicione validação no formulário Y..."
   - "Corrija o erro no componente Z..."
2. Use Visual Edits para ajustes visuais rápidos
3. Teste cada funcionalidade incrementalmente

## Passo 4: Integrações (4-8 horas)
1. Configure as ferramentas essenciais listadas acima
2. Implemente os workflows Make/N8N sugeridos
3. Teste todas as integrações end-to-end

## Passo 5: Deploy e Monitoramento (2-4 horas)
1. Execute testes finais em staging
2. Faça deploy para produção
3. Configure monitoramento e alertas
4. Acompanhe KPIs nas primeiras 48h

---

**💡 Dica Final**: Este prompt foi otimizado para Lovable.dev. Quanto mais específico e detalhado você for nas iterações, melhores serão os resultados. Boa sorte com seu projeto! 🚀

---

*Prompt gerado automaticamente pelo Builder de Soluções IA*`;

        const contextFromAnswers = answers?.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n') || '';

        console.log(`[BUILDER] 📝 Gerando prompt com Claude Sonnet 4-5...`);
        
        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 16000,
            temperature: 0.3,
            system: lovablePromptSystemPrompt,
            messages: [
              {
                role: "user",
                content: `Gere um prompt Lovable COMPLETO e PROFISSIONAL baseado nesta solução:

SOLUÇÃO GERADA:
${JSON.stringify(solutionData, null, 2)}

IDEIA ORIGINAL:
${idea}

CONTEXTO ADICIONAL DAS RESPOSTAS:
${contextFromAnswers || 'Nenhum contexto adicional fornecido'}

INSTRUÇÕES ESPECIAIS:
- Seja EXTREMAMENTE detalhado (não há limite de tamanho, pode ser longo)
- Use markdown para formatação profissional
- Inclua TODOS os detalhes técnicos da solução
- Adicione 4-5 workflows Make/N8N práticos e específicos para esta solução
- Siga EXATAMENTE a estrutura do system prompt
- O prompt deve ser copiável direto para o Lovable.dev
- Mantenha tom profissional mas acessível
- Use emojis para organização visual (como no template)
- Seja extremamente específico nos workflows Make/N8N (nomes de serviços, configurações reais)
- Transforme o checklist em fases organizadas por semanas
- Expanda os KPIs com metas numéricas quando possível`
              }
            ]
          }),
          signal: AbortSignal.timeout(180000)
        });

        if (!anthropicResponse.ok) {
          const errorText = await anthropicResponse.text();
          console.error(`[BUILDER] ❌ Erro Claude API: ${anthropicResponse.status}`, errorText);
          throw new Error(`Claude API error: ${anthropicResponse.status}`);
        }

        const anthropicData = await anthropicResponse.json();
        const anthropicTime = Date.now() - anthropicStart;
        
        const lovablePrompt = anthropicData.content[0].text;
        
        console.log(`[BUILDER] ✅ Prompt Lovable gerado em ${(anthropicTime / 1000).toFixed(1)}s`);
        console.log(`[BUILDER] 📏 Tamanho: ${lovablePrompt.length} caracteres (~${Math.floor(lovablePrompt.length / 4)} tokens)`);
        console.log(`[BUILDER] 💰 Tokens Claude: input=${anthropicData.usage.input_tokens}, output=${anthropicData.usage.output_tokens}`);
        
        // Atualizar solução no banco com o prompt
        const { error: updateError } = await supabase
          .from("ai_generated_solutions")
          .update({ lovable_prompt: lovablePrompt })
          .eq("id", savedSolution.id);
        
        if (updateError) {
          console.error("[BUILDER] ❌ Erro ao salvar prompt no banco:", updateError);
        } else {
          console.log("[BUILDER] ✅ Prompt Lovable salvo no banco com sucesso");
        }
      } catch (lovableError) {
        console.error("[BUILDER] ❌ Erro ao gerar prompt Lovable:", lovableError);
        console.error("[BUILDER] Stack:", lovableError.stack);
        console.warn("[BUILDER] ⚠️ Continuando sem Lovable Prompt - solução será retornada mesmo assim");
      }
    }
    
    // ==========================================
    // FINAL CHECK: GARANTIR QUE SOLUTION EXISTE
    // ==========================================
    if (!savedSolution || !savedSolution.id) {
      throw new Error("Solução não foi salva corretamente no banco");
    }
    
    console.log(`[BUILDER] 🎉 === PROCESSO COMPLETO FINALIZADO ===`);
    console.log(`[BUILDER] 💾 Retornando solution.id: ${savedSolution.id}`);
    console.log(`[BUILDER] ⏱️  Tempo total: ${generationTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        solution: savedSolution,
        generation_time_ms: generationTime,
        tokens_used: aiData.usage?.total_tokens,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorTime = Date.now() - startTime;
    
    // Log detalhado apenas no servidor
    console.error("[BUILDER] ❌ Erro interno:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      executionTime: `${errorTime}ms`
    });
    
    // Mensagem genérica e segura para o cliente
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar sua solicitação. Nossa equipe foi notificada.",
        code: "GENERATION_FAILED",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
