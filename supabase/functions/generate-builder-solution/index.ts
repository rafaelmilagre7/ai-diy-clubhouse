import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
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
  ).max(10, "Máximo de 10 perguntas permitidas").optional(),
  mode: z.enum(["quick", "complete"]).optional().default("quick") // Modo de geração
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

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

    const { idea, userId, answers = [], mode = "quick" } = validationResult.data;
    
    console.log(`[BUILDER][${requestId}] 🎯 Modo de geração: ${mode.toUpperCase()}`);
    
    // Variable to hold saved solution for timeout handler
    let savedSolution: any = null;

    console.log(`[BUILDER][${requestId}] === GERAÇÃO BUILDER INICIADA ===`);
    console.log(`[BUILDER][${requestId}] ✓ Validação OK`);
    console.log(`[BUILDER][${requestId}] 👤 User ID: ${userId.substring(0, 8)}***`);
    console.log(`[BUILDER][${requestId}] 💡 Ideia: "${idea.substring(0, 80)}..."`);
    console.log(`[BUILDER][${requestId}] 📝 Contexto: ${answers.length} respostas coletadas`);

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

⚠️ INSTRUÇÕES CRÍTICAS PARA DIAGRAMAS MERMAID (OBRIGATÓRIO):

🔴 ARCHITECTURE_FLOWCHART (graph TD/LR):
- Use APENAS "graph TD" ou "graph LR" (NUNCA "flowchart")
- Nós: [ ] para retângulos, ( ) para arredondados, (( )) para círculos
- NUNCA use chaves { } em graphs (causa syntax error fatal)
- Conexões: -->|texto| ou apenas -->
- Subgraphs: "subgraph Nome" e "end" (sem chaves)
- Estilos: style NODEID fill:#cor,stroke:#cor,color:#fff
- Máximo 15 nós (clareza visual)
EXEMPLO VÁLIDO:
graph TD
  A[Usuário] -->|mensagem| B(WhatsApp API)
  B --> C{Make}
  C -->|qualifica| D[GPT-4]
  D --> E[(CRM)]
  style D fill:#3b82f6

🔴 DATA_FLOW_DIAGRAM (flowchart LR):
- Use "flowchart LR" (Left to Right)
- Subgraphs para agrupar componentes
- NUNCA use chaves { } isoladas
- Conexões com dados: A -->|nome_dado| B
- Máximo 12 nós
EXEMPLO VÁLIDO:
flowchart LR
  subgraph Frontend
    A[React]
  end
  subgraph Backend
    B[API]
  end
  A -->|request| B

🔴 USER_JOURNEY_MAP (journey):
- Formato exato: "journey" na linha 1
- "title Texto do Titulo" (sem dois pontos)
- Seções: "section Nome da Secao"
- Tarefas: "Nome Tarefa: SCORE: Ator1, Ator2"
- SCORE é UM NÚMERO de 1-5 (sem dois pontos depois do número)
- Máximo 4 seções, 5 tarefas/seção
EXEMPLO VÁLIDO:
journey
  title Jornada do Usuario
  section Inicio
    Acessa sistema: 5: Usuario
    Faz login: 4: Usuario
  section Uso
    Usa funcao: 5: Usuario, Sistema

🔴 TECHNICAL_STACK_DIAGRAM (graph TB):
- Use "graph TB" (Top to Bottom)
- Subgraphs para camadas (Frontend, Backend, etc)
- NUNCA use chaves { }
- Máximo 10 componentes
EXEMPLO VÁLIDO:
graph TB
  subgraph Frontend
    A[React]
  end
  subgraph Backend
    B[Node]
  end
  A --> B

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
      "description": "Estratégia de IA 2025: modelos state-of-the-art, prompts otimizados, custos reais e casos de uso práticos.",
      "items": [
        "🎯 PRIORIDADE: Lovable AI (Google Gemini 2.5 Flash) - gateway pré-configurado, sem setup de API key, ideal para MVPs",
        "🧠 Modelo específico para caso de uso: [Nome do modelo] - prompt otimizado, temperatura X, custo estimado por 1M tokens",
        "📊 Pipeline completo: input → pré-processamento → modelo → pós-processamento → output com validação",
        "🔄 Estratégia de fallback: modelo principal + alternativa caso falhe (ex: Gemini Flash → GPT-5 Mini)"
      ],
      "tool_names": ["Lovable AI", "Claude Sonnet 4.5", "GPT-5", "Gemini 2.5 Pro"],
      "ai_strategy": "🚀 PRIORIDADE 1: Lovable AI (gateway pré-configurado)\n  - google/gemini-2.5-flash (padrão - balanceado)\n  - google/gemini-2.5-pro (casos complexos)\n  - openai/gpt-5-mini (alternativa GPT)\n  - openai/gpt-5 (casos premium)\n\n💡 PRIORIDADE 2: APIs Diretas\n  - Claude Sonnet 4.5 (reasoning superior, 200K)\n  - GPT-5 (multimodal, produção)\n  - Gemini 2.5 Pro (2M tokens, multilingual)\n\n📋 Estratégia:\n  1. Sempre usar Lovable AI via edge function\n  2. System prompt no backend\n  3. Rate limiting + erros 429/402\n  4. Cache de respostas (60-80% economia)\n  5. Logging + analytics\n  6. A/B testing modelos\n\n📊 Benchmarks:\n  - Latência: Flash(1.5s) < Mini(2.5s) < Claude(3.5s)\n  - Custo: Flash($0.15/1M) < Mini($0.30/1M) < Pro($1.25/1M)\n  - Qualidade: Claude > GPT-5 > Gemini Pro > Mini > Flash\n\n🎯 Casos de uso:\n  - Chatbots: Gemini Flash via Lovable AI\n  - Análise complexa: Claude Sonnet 4.5\n  - Multimodal: GPT-5 ou Gemini Pro\n  - Documentos longos: Gemini 2.5 Pro (2M)\n  - Prototipagem: Lovable AI (zero setup)\n\n⚡ Quick Start Lovable AI:\n  - Edge function em supabase/functions/\n  - Endpoint: https://ai.gateway.lovable.dev/v1/chat/completions\n  - LOVABLE_API_KEY auto-configurada\n  - Modelo padrão: google/gemini-2.5-flash\n  - Streaming para UX responsiva"
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
  
  ⚠️ IMPORTANTE SOBRE LOVABLE:
  - Se a solução envolve criar uma aplicação web, dashboard, interface de usuário, sistema web, plataforma online, SEMPRE considere incluir Lovable.dev nas ferramentas essenciais ou opcionais
  - Lovable é ideal para: frontend React, dashboards, CRMs, sistemas web, MVPs, protótipos
  - Razão para incluir: "Plataforma de desenvolvimento rápido com IA para criar aplicações web completas (frontend + backend) sem código, ideal para MVPs e protótipos validados."
  
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

⚠️ INSTRUÇÕES CRÍTICAS PARA O TÍTULO (CAMPO OBRIGATÓRIO):
- O campo "title" no JSON NUNCA pode ser: undefined, null, "undefined", "null", "" (vazio) ou menor que 10 caracteres
- Analise a DOR CENTRAL e o OBJETIVO FINAL do usuário (não o processo, mas o resultado)
- **SINTETIZE**: Não copie o início da ideia literalmente - EXTRAIA a essência e reformule profissionalmente
- Tamanho ideal: 30-60 caracteres (mínimo 20, máximo 60)
- FORMATO: [Tecnologia/Sistema] + [Resultado Específico] OU [Benefício] + [Método]
- **PROIBIDO ABSOLUTO**: Começar com "Implementar", "Criar", "Fazer", "Quero", "Preciso", "Desenvolver"
- **PROIBIDO ABSOLUTO**: Copiar palavra por palavra o início da ideia do usuário
- **OBRIGATÓRIO**: Título deve ser sintético, profissional e auto-explicativo

EXEMPLOS DE SÍNTESE PROFISSIONAL:
Ideia: "Quero implementar uma inteligência artificial para resumir o atendimento dos corredores e me mandar por e-mail no fim do dia"
✅ CORRETO: "Resumo Automático de Atendimentos via IA + E-mail"
✅ CORRETO: "Sistema de Resumo IA para Atendimentos Diários"
❌ ERRADO: "Implementar uma inteligência artificial para resumir o atendimento dos cor" (cópia literal truncada)

Ideia: "automatizar qualificação de leads no whatsapp usando IA"
✅ CORRETO: "Qualificação Automática de Leads via WhatsApp + IA"
✅ CORRETO: "Sistema de Qualificação de Leads com IA no WhatsApp"
❌ ERRADO: "Automatizar qualificação de leads no whatsapp" (cópia literal)

Ideia: "dashboard para acompanhar vendas da loja online em tempo real"
✅ CORRETO: "Dashboard Analytics em Tempo Real para E-commerce"
✅ CORRETO: "Painel de Vendas Online com Atualização Instantânea"
❌ ERRADO: "Dashboard para acompanhar vendas da loja online" (cópia literal)

Ideia: "criar um chatbot que responde dúvidas dos clientes 24 horas"
✅ CORRETO: "Chatbot Atendimento 24/7 com IA"
✅ CORRETO: "Assistente Virtual Inteligente para Suporte Contínuo"
❌ ERRADO: "Criar um chatbot que responde dúvidas dos clientes" (cópia literal)

MAIS EXEMPLOS DE TÍTULOS EXCELENTES:
✅ "CRM Automático com Sincronização Make"
✅ "Pipeline de Dados via Airtable + Google Sheets"
✅ "Notificações Inteligentes de Estoque Baixo"
✅ "Gerador de Relatórios Automatizado com IA"

EXEMPLOS DE TÍTULOS RUINS (NÃO FAZER):
❌ "undefined" ou qualquer variação (NUNCA retorne isso)
❌ "Solução de IA" (genérico demais)
❌ "Projeto Builder" (sem contexto)
❌ "Sistema Inteligente" (vago)
❌ "" (vazio - PROIBIDO)
❌ Qualquer título que comece com verbos de ação no infinitivo

🔴 REGRAS OBRIGATÓRIAS:
1. **SINTETIZE**: Extraia conceitos-chave, não copie palavras literais da ideia
2. Seja ESPECÍFICO sobre o que a solução FAZ (resultado final, não processo)
3. Mencione a TECNOLOGIA principal se relevante (IA, WhatsApp, CRM, etc)
4. O título deve fazer sentido SEM ler a descrição
5. O campo "title" no JSON DEVE ter pelo menos 10 caracteres de conteúdo válido
6. **NUNCA** comece com: "Implementar", "Criar", "Fazer", "Quero", "Preciso", "Gostaria"
7. **TESTE MENTAL**: Se o título parece uma cópia do início da ideia, REESCREVA

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
            title: { type: "string", description: "Título SINTÉTICO, PROFISSIONAL e CURTO (20-60 chars). NUNCA copie o início da ideia literalmente. EXTRAIA a essência e reformule. Formato: [Tecnologia/Sistema] + [Resultado]. PROIBIDO começar com: Implementar, Criar, Fazer, Quero, Preciso, Desenvolver" },
            short_description: { type: "string", description: "Descrição em 3-5 frases" },
            tags: { type: "array", items: { type: "string" }, description: "3-5 tags relevantes (ex: IA Generativa, Automação, WhatsApp, CRM, Dashboard). Evite tags genéricas demais" },
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

    // Call Lovable AI com modo QUICK (apenas essencial)
    const isQuickMode = true; // Primeira geração é sempre rápida
    
    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 64000, // Geração completa
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(180000), // 3 minutos para geração completa
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

    // 🔍 VALIDAÇÃO DE SINTAXE MERMAID
    const validateMermaidSyntax = (code: string, type: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (!code || code.trim() === '') {
        errors.push('Código Mermaid vazio');
        return { valid: false, errors };
      }
      
      const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Validar tipo de diagrama
      if (type === 'architecture' || type === 'stack') {
        if (!lines[0].match(/^graph\s+(TD|LR|TB|RL)/i)) {
          errors.push(`Primeira linha deve ser "graph TD/LR/TB/RL", encontrado: "${lines[0]}"`);
        }
        // Detectar uso incorreto de chaves
        if (code.includes('{') && !code.match(/\{\s*\}/)) {
          errors.push('Uso inválido de chaves {} em graph (use apenas para decisões vazias ou remova)');
        }
      }
      
      if (type === 'dataflow') {
        if (!lines[0].match(/^flowchart\s+(LR|TD|TB|RL)/i) && !lines[0].match(/^sequenceDiagram/i)) {
          errors.push(`Primeira linha deve ser "flowchart LR/TD" ou "sequenceDiagram", encontrado: "${lines[0]}"`);
        }
      }
      
      if (type === 'journey') {
        if (lines[0].toLowerCase() !== 'journey') {
          errors.push(`Primeira linha deve ser "journey", encontrado: "${lines[0]}"`);
        }
        
        // Validar formato de tarefas: "Task: SCORE: Actor"
        const taskLines = lines.filter(l => !l.startsWith('title') && !l.startsWith('section') && l.includes(':'));
        for (const taskLine of taskLines) {
          const parts = taskLine.split(':');
          if (parts.length >= 2) {
            const scorePart = parts[1].trim();
            if (!/^\d+$/.test(scorePart)) {
              errors.push(`Journey: score deve ser número de 1-5, encontrado "${scorePart}" em: "${taskLine}"`);
            }
          }
        }
      }
      
      return { valid: errors.length === 0, errors };
    };

    // Validar cada diagrama
    if (solutionData.architecture_flowchart?.mermaid_code) {
      const validation = validateMermaidSyntax(solutionData.architecture_flowchart.mermaid_code, 'architecture');
      if (!validation.valid) {
        console.warn('[BUILDER] ⚠️ Erros em architecture_flowchart:', validation.errors);
      } else {
        console.log('[BUILDER] ✅ architecture_flowchart: sintaxe válida');
      }
    }

    if (solutionData.data_flow_diagram?.mermaid_code) {
      const validation = validateMermaidSyntax(solutionData.data_flow_diagram.mermaid_code, 'dataflow');
      if (!validation.valid) {
        console.warn('[BUILDER] ⚠️ Erros em data_flow_diagram:', validation.errors);
      } else {
        console.log('[BUILDER] ✅ data_flow_diagram: sintaxe válida');
      }
    }

    if (solutionData.user_journey_map?.mermaid_code) {
      const validation = validateMermaidSyntax(solutionData.user_journey_map.mermaid_code, 'journey');
      if (!validation.valid) {
        console.warn('[BUILDER] ⚠️ Erros em user_journey_map:', validation.errors);
      } else {
        console.log('[BUILDER] ✅ user_journey_map: sintaxe válida');
      }
    }

    if (solutionData.technical_stack_diagram?.mermaid_code) {
      const validation = validateMermaidSyntax(solutionData.technical_stack_diagram.mermaid_code, 'stack');
      if (!validation.valid) {
        console.warn('[BUILDER] ⚠️ Erros em technical_stack_diagram:', validation.errors);
      } else {
        console.log('[BUILDER] ✅ technical_stack_diagram: sintaxe válida');
      }
    }

    // 🔧 FUNÇÃO DE SANITIZAÇÃO MERMAID
    const sanitizeMermaidCode = (code: string): string => {
      // Remover quebras de linha no meio de definições de conexões
      return code
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        // Corrigir conexões com label quebradas: -->|label|\n  B[Node]
        .replace(/-->\|([^|]+)\|\s*\n\s*([A-Z]\[)/g, '-->|$1| $2')
        // Corrigir setas simples quebradas: -->\n  B[Node]
        .replace(/-->\s*\n\s*([A-Z][\[\(])/g, '--> $1')
        // Corrigir setas com estilo quebradas: -.->|\n  B[Node]
        .replace(/\.->\|([^|]*)\|\s*\n\s*([A-Z][\[\(])/g, '.->|$1| $2');
    };

    // Aplicar sanitização em architecture_flowchart antes de salvar
    if (solutionData.architecture_flowchart?.mermaid_code) {
      const originalCode = solutionData.architecture_flowchart.mermaid_code;
      solutionData.architecture_flowchart.mermaid_code = sanitizeMermaidCode(originalCode);
      console.log('[BUILDER] 🔧 Mermaid sanitizado com sucesso');
    }

    // 🔧 VALIDAÇÃO ROBUSTA E INTELIGENTE DO TÍTULO
    const invalidTitles = [undefined, null, 'undefined', 'null', ''];
    const titleString = solutionData.title ? String(solutionData.title).trim() : '';
    
    // Detectar cópias literais da ideia (primeiros 50 chars da ideia)
    const ideaStart = idea.substring(0, 50).toLowerCase().trim();
    const titleLower = titleString.toLowerCase();
    const isLiteralCopy = titleLower.startsWith(ideaStart.substring(0, 30));
    
    // Detectar títulos que começam com verbos de ação proibidos
    const startsWithForbiddenVerb = /^(implementar|criar|fazer|quero|preciso|gostaria|desenvolver)/i.test(titleString);
    
    // Detectar título truncado no meio de palavra (termina com palavra incompleta)
    const endsWithIncompleteWord = titleString.length > 40 && !titleString.match(/[\s\-][\w]{3,}$/);
    
    // Validação mais rigorosa: título muito longo também é inválido
    const titleTooLong = titleString.length > 60;
    
    const titleIsInvalid = 
      invalidTitles.includes(solutionData.title) || 
      titleString === '' ||
      titleString.length < 20 || // Título muito curto (mínimo 20 chars)
      titleTooLong || // Título muito longo (máximo 60 chars)
      /^[A-Z][a-z]*(\s[A-Z][a-z]*){0,2}\.$/.test(titleString) || // Palavras isoladas com ponto
      isLiteralCopy || // Cópia literal da ideia
      startsWithForbiddenVerb || // Começa com verbo proibido
      endsWithIncompleteWord; // Truncado no meio de palavra
    
    if (titleIsInvalid) {
      console.warn("[BUILDER] ⚠️ Título inválido detectado:", {
        received: solutionData.title,
        type: typeof solutionData.title,
        length: titleString.length,
        isLiteralCopy,
        startsWithForbiddenVerb,
        endsWithIncompleteWord
      });
      
      // 🧠 FALLBACK INTELIGENTE: Extrair palavras-chave e sintetizar
      
      // Remover palavras comuns (stopwords)
      const stopwords = ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 
                         'para', 'com', 'por', 'que', 'e', 'um', 'uma', 'eu', 'meu', 'minha',
                         'quero', 'preciso', 'gostaria', 'criar', 'fazer', 'implementar', 'desenvolver'];
      
      // Extrair palavras significativas (substantivos, tecnologias)
      const words = idea
        .toLowerCase()
        .replace(/[^\w\sáéíóúâêôãõç]/g, ' ') // Remove pontuação
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopwords.includes(w));
      
      // Identificar tecnologias/palavras-chave importantes
      const techKeywords = ['whatsapp', 'crm', 'email', 'chatbot', 'dashboard', 'ia', 'inteligencia', 'artificial',
                           'automatico', 'automacao', 'sistema', 'relatorio', 'notificacao', 'analise', 'dados',
                           'lead', 'cliente', 'atendimento', 'vendas', 'estoque', 'pedido'];
      
      const foundTech = words.filter(w => techKeywords.some(tk => w.includes(tk) || tk.includes(w)));
      const mainWords = foundTech.length > 0 ? foundTech.slice(0, 3) : words.slice(0, 3);
      
      // Construir título profissional
      let fallbackTitle = '';
      
      if (mainWords.length >= 2) {
        // Capitalizar palavras
        const capitalizedWords = mainWords.map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        );
        
        // Formato: "Sistema de [palavra1] + [palavra2]"
        fallbackTitle = `Sistema de ${capitalizedWords[0]}`;
        if (capitalizedWords[1]) {
          fallbackTitle += ` + ${capitalizedWords[1]}`;
        }
      } else {
        // Fallback genérico mas profissional
        const shortId = crypto.randomUUID().substring(0, 6).toUpperCase();
        fallbackTitle = `Solução de Automação ${shortId}`;
      }
      
      // Limitar a 60 caracteres
      solutionData.title = fallbackTitle.length > 60 
        ? fallbackTitle.substring(0, 57) + '...'
        : fallbackTitle;
      
      console.log(`[BUILDER] 🔧 Título fallback inteligente: "${solutionData.title}"`);
      console.log(`[BUILDER] 📝 Palavras-chave extraídas: ${mainWords.join(', ')}`);
    } else {
      // Garantir que título não exceda 60 caracteres
      if (titleString.length > 60) {
        solutionData.title = titleString.substring(0, 57) + '...';
        console.log(`[BUILDER] ✂️ Título truncado para 60 chars: "${solutionData.title}"`);
      }
    }

    console.log(`[BUILDER] ✅ Título final validado: "${solutionData.title}"`);

    // ========== 🆕 INJETAR LOVABLE NAS FERRAMENTAS AUTOMATICAMENTE ==========
    console.log('[BUILDER] 🚀 Verificando se Lovable está nas ferramentas...');

    // Verificar se Lovable já está na lista
    const lovableExists = solutionData.required_tools?.essential?.some(
      (tool: any) => tool.name?.toLowerCase().includes('lovable')
    ) || solutionData.required_tools?.optional?.some(
      (tool: any) => tool.name?.toLowerCase().includes('lovable')
    );

    if (!lovableExists) {
      console.log('[BUILDER] ➕ Lovable não encontrado, adicionando como ferramenta recomendada');
      
      // Buscar dados do Lovable no catálogo de tools
      const { data: lovableTool } = await supabase
        .from('tools')
        .select('*')
        .ilike('name', '%lovable%')
        .eq('status', true)
        .limit(1)
        .maybeSingle();
      
      const lovableToolData = {
        name: lovableTool?.name || 'Lovable',
        logo_url: lovableTool?.logo_url || 'https://lovable.dev/logo.png',
        category: lovableTool?.category || 'No-Code Development',
        reason: 'Plataforma ideal para desenvolvimento rápido de aplicações web modernas com IA. Permite criar frontend + backend completo sem código, integrando facilmente com APIs externas e automações. Perfeita para MVPs e protótipos validados.',
        setup_complexity: 'easy',
        setup_steps: '1. Criar conta gratuita\n2. Descrever sua aplicação em linguagem natural\n3. A IA gera código React + Supabase automaticamente\n4. Deploy instantâneo',
        cost_estimate: 'Gratuito (com limites) / A partir de $20/mês para projetos profissionais',
        alternatives: ['Bubble.io (mais visual, menos flexível)', 'Webflow (foco em sites, não em apps)']
      };
      
      // Adicionar como primeira ferramenta essencial ou opcional
      if (!solutionData.required_tools) {
        solutionData.required_tools = { essential: [], optional: [] };
      }
      if (!solutionData.required_tools.essential) {
        solutionData.required_tools.essential = [];
      }
      if (!solutionData.required_tools.optional) {
        solutionData.required_tools.optional = [];
      }
      
      // Adicionar como opcional (recomendada) por padrão
      solutionData.required_tools.optional.unshift(lovableToolData);
      console.log('[BUILDER] ✅ Lovable adicionado como ferramenta recomendada');
    } else {
      console.log('[BUILDER] ✓ Lovable já está na lista de ferramentas');
    }

    // Salvar no banco (SOLUÇÃO COMPLETA)
    const generationTime = Date.now() - startTime;

    const { data: insertedSolution, error: saveError } = await supabase
      .from("ai_generated_solutions")
      .insert({
        user_id: userId,
        original_idea: idea,
        title: solutionData.title,
        short_description: solutionData.short_description,
        tags: solutionData.tags || ['IA Generativa'], // Tags dinâmicas com fallback
        framework_mapping: solutionData.framework_quadrants,
        mind_map: solutionData.mind_map,
        required_tools: solutionData.required_tools,
        implementation_checklist: solutionData.implementation_checklist,
        architecture_flowchart: solutionData.architecture_flowchart,
        data_flow_diagram: solutionData.data_flow_diagram,
        user_journey_map: solutionData.user_journey_map,
        technical_stack_diagram: solutionData.technical_stack_diagram,
        generation_model: "google/gemini-2.5-flash",
        generation_time_ms: generationTime,
        generation_status: mode === "quick" ? "quick" : "complete",
        is_complete: mode === "complete"
      })
    .select()
    .single();

    // Assign to outer scope for timeout handler
    savedSolution = insertedSolution;

    if (saveError) {
      console.error("[BUILDER] ❌ Erro ao salvar solução no banco:");
      console.error("[BUILDER] 📋 Detalhes do erro:", JSON.stringify(saveError, null, 2));
      console.error("[BUILDER] 📊 Dados tentados:", {
        user_id: userId,
        title: solutionData.title,
        hasFramework: !!solutionData.framework_quadrants,
        hasMindMap: !!solutionData.mind_map,
        hasTools: !!solutionData.required_tools
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Falha ao salvar solução no banco de dados",
          code: "SAVE_ERROR",
          details: saveError.message || "Erro desconhecido",
          suggestion: "Verifique se todas as colunas necessárias existem na tabela"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Incrementar contador
    await supabase.rpc("increment_ai_solution_usage", { p_user_id: userId });

    console.log(`[BUILDER] ✅ === GERAÇÃO COMPLETA CONCLUÍDA ===`);
    console.log(`[BUILDER] ⏱️ Tempo total: ${(generationTime / 1000).toFixed(1)}s`);
    console.log(`[BUILDER] 💾 Solution ID: ${savedSolution.id}`);
    console.log(`[BUILDER] 📊 Tags: ${solutionData.tags?.join(', ') || 'IA Generativa'}`);
    
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.warn(`[BUILDER][${requestId}] ⚠️ LOVABLE_API_KEY não configurada, pulando prompt Lovable`);
    } else if (savedSolution?.id) {
      try {
        const lovablePromptStart = Date.now();
        
        const lovablePromptSystemPrompt = `Você é um especialista em engenharia de prompts para Lovable.dev.

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional antes ou depois.

Estrutura OBRIGATÓRIA:
{
  "prompt": "string com o prompt Lovable completo e profissional",
  "complexity": "low|medium|high",
  "estimated_time": "tempo estimado de implementação"
}

NÃO adicione explicações, comentários ou markdown. APENAS o JSON puro.

IMPORTANTE PARA DIAGRAMAS MERMAID: 
Se você incluir código Mermaid no prompt, cada conexão (-->) DEVE estar COMPLETA na mesma linha.
❌ ERRADO: A[Node] -->|label|
            B[Node]
✅ CORRETO: A[Node] -->|label| B[Node]

Sua missão: transformar a solução Builder gerada em um PROMPT LOVABLE COMPLETO, PROFISSIONAL e PRONTO PARA COPIAR dentro do campo "prompt" do JSON.

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

# 🔄 WORKFLOWS DE AUTOMAÇÃO

## Workflow 1: [Nome específico - ex: Qualificação de Leads]
\`\`\`
TRIGGER: [evento específico - ex: Novo lead via WhatsApp]
↓
AÇÃO 1: [webhook, API call, transformação]
  └─ Configuração: [detalhes exatos]
↓
AÇÃO 2: [ação da IA ou processamento]
  └─ Modelo: [modelo específico, parâmetros]
↓
AÇÃO 3: [salvamento ou notificação]
  └─ Destino: [CRM, email, webhook]
↓
RESULTADO: [métrica observável]
\`\`\`

[repetir para 3-5 workflows principais]

# 🎨 DESIGN SYSTEM & UI/UX

## Paleta de Cores
- Primary: [cor + uso]
- Secondary: [cor + uso]
- Accent: [cor + uso]

## Componentes Principais
- [Componente 1]: [descrição e variantes]
- [Componente 2]: [descrição e variantes]

## Jornada do Usuário
1. [Passo 1]: [tela, ação esperada, feedback]
2. [Passo 2]: [tela, ação esperada, feedback]
[continuar fluxo completo]

# 🏗️ ARQUITETURA & DADOS

## Estrutura Supabase
\`\`\`sql
-- Tabela 1
CREATE TABLE [nome] (
  [campos com tipos, constraints, indexes]
);

-- RLS Policies
[políticas de segurança detalhadas]
\`\`\`

## Edge Functions
- **[nome-funcao-1]**: [propósito, inputs, outputs, erros]
- **[nome-funcao-2]**: [propósito, inputs, outputs, erros]

# 📊 KPIs & MÉTRICAS

## Objetivos Mensuráveis
- [Métrica 1]: baseline → meta (prazo)
- [Métrica 2]: baseline → meta (prazo)
- [Métrica 3]: baseline → meta (prazo)

# 🗓️ ROADMAP DE IMPLEMENTAÇÃO

## Semana 1: Fundação
- [ ] Setup Lovable project + Supabase
- [ ] Database schema + RLS policies
- [ ] Autenticação configurada
- [ ] [tarefas específicas]

## Semana 2: Features Core
- [ ] [Feature 1]: [subtarefas]
- [ ] [Feature 2]: [subtarefas]
- [ ] [testes]

## Semana 3: Integrações
- [ ] [Integração 1]: [passos específicos]
- [ ] [Integração 2]: [passos específicos]
- [ ] [workflows Make/N8N]

## Semana 4: Polimento & Deploy
- [ ] UI refinements
- [ ] Testes end-to-end
- [ ] Deploy produção
- [ ] Monitoramento + alertas

---

**REGRAS CRÍTICAS:**
- Seja ULTRA-ESPECÍFICO (URLs, comandos exatos, configurações reais)
- Inclua snippets SQL, código real, configurações exatas
- Workflows Make/N8N com módulos reais e configurações
- Roadmap em semanas com checkboxes e tarefas acionáveis
- KPIs com números reais e prazos realistas
- SEMPRE mencione segurança (RLS, validação, sanitização)
- Tom: técnico, direto, sem filler words`;

        const contextFromAnswers = answers?.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n') || '';

        console.log(`[BUILDER][${requestId}] 📝 Gerando prompt com Lovable AI (Gemini 2.5 Pro)...`);
        
        const lovableAIResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              {
                role: "system",
                content: lovablePromptSystemPrompt
              },
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
            ],
            temperature: 0.7,
            max_completion_tokens: 16000
          }),
          signal: AbortSignal.timeout(240000) // 4 minutos (Gemini Pro pode ser mais lento)
        });

        if (!lovableAIResponse.ok) {
          const errorText = await lovableAIResponse.text();
          console.error(`[BUILDER][${requestId}] ❌ Erro Lovable AI: ${lovableAIResponse.status}`, errorText);
          
          if (lovableAIResponse.status === 429) {
            throw new Error(`Rate limit Lovable AI atingido`);
          } else if (lovableAIResponse.status === 402) {
            throw new Error(`Créditos insuficientes no Lovable AI`);
          }
          
          throw new Error(`Lovable AI error: ${lovableAIResponse.status}`);
        }

        const lovableAIData = await lovableAIResponse.json();
        const lovablePromptTime = Date.now() - lovablePromptStart;
        
        const rawContent = lovableAIData.choices[0].message.content;
        
        // 🔧 FASE 1: Extração robusta de JSON
        const cleanJsonResponse = (text: string): string => {
          // Remover markdown code blocks
          let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Procurar pelo primeiro { até o último }
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          
          if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('JSON não encontrado na resposta');
          }
          
          return cleaned.substring(firstBrace, lastBrace + 1);
        };
        
        let lovablePrompt: string;
        
        try {
          const cleanedJson = cleanJsonResponse(rawContent);
          const parsed = JSON.parse(cleanedJson);
          
          // Extrair o campo "prompt" do JSON
          if (parsed.prompt && typeof parsed.prompt === 'string') {
            lovablePrompt = parsed.prompt;
            console.log(`[BUILDER][${requestId}] ✅ JSON parseado com sucesso`);
            console.log(`[BUILDER][${requestId}] 📊 Complexidade: ${parsed.complexity || 'N/A'}`);
            console.log(`[BUILDER][${requestId}] ⏱️  Tempo estimado: ${parsed.estimated_time || 'N/A'}`);
          } else {
            throw new Error('Campo "prompt" não encontrado no JSON');
          }
        } catch (parseError) {
          console.error(`[BUILDER][${requestId}] ❌ Erro ao parsear JSON do Lovable AI:`, parseError);
          console.error(`[BUILDER][${requestId}] 📄 Resposta raw (primeiros 500 chars):`, rawContent.substring(0, 500));
          
          // Fallback: usar resposta raw como prompt (melhor que nada)
          lovablePrompt = rawContent;
          console.warn(`[BUILDER][${requestId}] ⚠️  Usando resposta raw como fallback`);
        }
        
        console.log(`[BUILDER][${requestId}] ✅ Prompt Lovable gerado em ${(lovablePromptTime / 1000).toFixed(1)}s`);
        console.log(`[BUILDER][${requestId}] 📏 Tamanho: ${lovablePrompt.length} caracteres (~${Math.floor(lovablePrompt.length / 4)} tokens)`);
        console.log(`[BUILDER][${requestId}] 💰 Tokens Gemini Pro: ${lovableAIData.usage?.total_tokens || 'N/A'}`);
        
        // Atualizar solução no banco com o prompt
        const { error: updateError } = await supabase
          .from("ai_generated_solutions")
          .update({ lovable_prompt: lovablePrompt })
          .eq("id", savedSolution.id);
        
        if (updateError) {
          console.error(`[BUILDER][${requestId}] ❌ Erro ao salvar prompt no banco:`, updateError);
        } else {
          console.log(`[BUILDER][${requestId}] ✅ Prompt Lovable salvo no banco com sucesso`);
        }
      } catch (lovableError) {
        console.error(`[BUILDER][${requestId}] ❌ ERRO ao gerar prompt Lovable:`, {
          message: lovableError?.message || 'Erro desconhecido',
          name: lovableError?.name || 'Unknown',
          stack: lovableError?.stack,
          lovableApiKeyExists: !!Deno.env.get("LOVABLE_API_KEY"),
          solutionId: savedSolution?.id
        });
        
        if (lovableError?.message?.includes('timeout')) {
          console.error(`[BUILDER][${requestId}]   → Timeout (>180s ao chamar Lovable AI Gemini Pro)`);
        } else if (lovableError?.message?.includes('401')) {
          console.error(`[BUILDER][${requestId}]   → LOVABLE_API_KEY não configurada ou inválida`);
        } else if (lovableError?.message?.includes('429')) {
          console.error(`[BUILDER][${requestId}]   → Rate limit Lovable AI atingido`);
        } else if (lovableError?.message?.includes('402')) {
          console.error(`[BUILDER][${requestId}]   → Créditos insuficientes no Lovable AI`);
        } else if (lovableError?.message?.includes('fetch')) {
          console.error(`[BUILDER][${requestId}]   → Erro de rede ao conectar com ai.gateway.lovable.dev`);
        }
        
        console.warn(`[BUILDER][${requestId}] ⚠️ Continuando sem Lovable Prompt - solução será retornada com outros dados`);
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
    
    // 🔧 FASE 3: Log detalhado e mensagens descritivas
    console.error(`[BUILDER][${requestId}] ❌ Erro interno:`, {
      requestId,
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      timestamp: new Date().toISOString(),
      executionTime: `${errorTime}ms`
    });
    
    // Determinar mensagem apropriada baseada no erro
    let userMessage = "Ops! Algo deu errado ao gerar a solução.";
    let errorDetails = error.message;
    
    if (error.message?.includes('JSON inválido') || error.message?.includes('JSON não encontrado')) {
      userMessage = "A IA teve dificuldade em formatar a resposta. Por favor, tente novamente.";
      errorDetails = "Erro ao processar resposta da IA";
    } else if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
      userMessage = "A geração demorou muito. Por favor, tente novamente com uma descrição mais simples.";
      errorDetails = "Timeout na geração";
    } else if (error.message?.includes('429')) {
      userMessage = "Limite de requisições atingido. Aguarde alguns minutos.";
      errorDetails = "Rate limit atingido";
    } else if (error.message?.includes('402')) {
      userMessage = "Créditos insuficientes. Entre em contato com o suporte.";
      errorDetails = "Créditos insuficientes";
    }
    
    // Mensagem descritiva para o cliente
    return new Response(
      JSON.stringify({ 
        error: errorDetails,
        userMessage: userMessage,
        code: "GENERATION_FAILED",
        requestId,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
