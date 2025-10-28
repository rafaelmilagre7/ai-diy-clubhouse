import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  solutionId: z.string().uuid("ID de solução inválido"),
  sectionType: z.enum(["framework", "tools", "checklist", "architecture", "lovable"]),
  userId: z.string().uuid("ID de usuário inválido")
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { solutionId, sectionType, userId } = RequestSchema.parse(body);

    console.log(`[SECTION-GEN] 🚀 Gerando ${sectionType} para solução ${solutionId}`);

    // Buscar solução e verificar permissão
    const { data: solution, error: fetchError } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !solution) {
      return new Response(
        JSON.stringify({ error: "Solução não encontrada ou sem permissão" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mapear tipo de seção para campos do banco
    const fieldMapping: Record<string, string[]> = {
      framework: ["framework_mapping", "mind_map"],
      tools: ["required_tools"],
      checklist: ["implementation_checklist"],
      architecture: ["implementation_flows"],
      lovable: ["lovable_prompt"]
    };

    const fieldsToGenerate = fieldMapping[sectionType];
    const primaryField = fieldsToGenerate[0];

    // Verificar se já existe (cache)
    if (solution[primaryField]) {
      console.log(`[SECTION-GEN] ✅ ${sectionType} já existe, retornando cache`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          cached: true,
          content: solution[primaryField] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar conteúdo via Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const lovableUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";

    // Criar prompts específicos para cada tipo
    let systemPrompt = "";
    let model = "google/gemini-2.5-flash"; // 🚀 FASE 1: Flash é 2-3x mais rápido
    let maxTokens = 30000;

    if (sectionType === "framework") {
      systemPrompt = `Você é um arquiteto de soluções especializado no FRAMEWORK BY RAFAEL MILAGRE.

🏗️ METODOLOGIA DOS 4 QUADRANTES:

QUADRANTE 1 - Bancos de Dados e Armazenamento:
Ferramentas: Airtable, Google Sheets, Notion Database, Supabase, Firebase, PostgreSQL, MySQL, MongoDB
Use este quadrante para identificar onde os dados serão armazenados, estruturados e consultados.

QUADRANTE 2 - Inteligência Artificial:
- APIs de IA: OpenAI (GPT-5, DALL-E, Whisper), Anthropic (Claude), Google (Gemini), Grok, Deepseek, Manus, Agent GPT, Genspark
- Plataformas: ChatGPT, MidJourney, Stable Diffusion, ElevenLabs (síntese de voz)
- Visão Computacional: GPT-4 Vision, Google Vision API
Use este quadrante para toda lógica de processamento inteligente, análise, geração de conteúdo e decisões automatizadas.

QUADRANTE 3 - Automação e Integração:
Ferramentas: Lovable, Make, n8n, Zapier, Lindy AI, Integromat, Pipedream
Use este quadrante para orquestrar fluxos, conectar sistemas e automatizar processos entre ferramentas.

QUADRANTE 4 - Interfaces onde a IA atua:
Canais: WhatsApp, Site/Web App, Plataforma própria, CRM, ERP, Gmail, Chatbot, Twilio, Discord, Telegram, Slack, qualquer plataforma com API aberta
Use este quadrante para definir onde o usuário final interage com a solução.

📋 INSTRUÇÕES:
1. Analise a solução proposta considerando os 4 quadrantes
2. Para cada quadrante, identifique FERRAMENTAS ESPECÍFICAS (não genéricas)
3. Explique COMO cada ferramenta será usada no contexto da solução
4. Detalhe as INTEGRAÇÕES entre quadrantes (ex: "Zapier conecta WhatsApp ao Airtable")
5. Seja EXECUTÁVEL: cada item deve ser claro o suficiente para implementação

Retorne JSON com a estrutura:
{
  "framework_quadrants": {
    "quadrant1_data": {
      "title": "Bancos de Dados e Armazenamento",
      "description": "Como e onde os dados serão armazenados",
      "items": ["Item 1: [Ferramenta] - [Como será usada]", ...],
      "tool_names": ["Airtable", "Supabase", ...],
      "integration_details": "Detalhes de como as ferramentas se conectam"
    },
    "quadrant2_ai": {
      "title": "Inteligência Artificial",
      "description": "Modelos e APIs de IA para processamento inteligente",
      "items": ["Item 1: [API/Modelo] - [Caso de uso específico]", ...],
      "tool_names": ["OpenAI GPT-5", "Claude", ...],
      "integration_details": "Como a IA será integrada ao fluxo"
    },
    "quadrant3_automation": {
      "title": "Automação e Integração",
      "description": "Orquestração de fluxos e conexão entre sistemas",
      "items": ["Item 1: [Ferramenta] - [Fluxo automatizado]", ...],
      "tool_names": ["Make", "Zapier", ...],
      "integration_details": "Fluxos de automação específicos"
    },
    "quadrant4_interface": {
      "title": "Interfaces e Canais",
      "description": "Onde o usuário interage com a solução",
      "items": ["Item 1: [Canal] - [Experiência do usuário]", ...],
      "tool_names": ["WhatsApp", "Web App", ...],
      "integration_details": "Como os canais se conectam ao backend"
    }
  },
  "mind_map": {
    "central_idea": "Título da solução",
    "branches": [{"name": "Branch", "children": ["Sub-item 1", ...]}]
  }
}

Seja DETALHADO, ESPECÍFICO e EXECUTÁVEL em cada campo.`;
      maxTokens = 20000;
    } else if (sectionType === "tools") {
      systemPrompt = `Você é especialista em identificação de ferramentas SaaS e APIs para implementação de soluções.

🎯 MISSÃO: Analisar a solução e retornar APENAS os NOMES das ferramentas necessárias.

📋 INSTRUÇÕES CRÍTICAS:
1. Analise o contexto completo da solução (ideia, framework, perguntas/respostas)
2. Identifique TODAS as ferramentas necessárias para implementar
3. Categorize em:
   - essential: Ferramentas SEM as quais a solução NÃO funciona
   - optional: Ferramentas que MELHORAM mas não são obrigatórias

4. Para cada ferramenta, retorne APENAS o NOME OFICIAL:
   ✅ CORRETO: "Make.com", "OpenAI", "Supabase", "WhatsApp Business API"
   ❌ ERRADO: "Uma ferramenta de automação", "API de IA", "Banco de dados"

5. Use nomes EXATOS e RECONHECÍVEIS das ferramentas do mercado
6. Priorize ferramentas que estejam no contexto do framework fornecido

⚠️ ATENÇÃO: Retorne APENAS o objeto JSON especificado, SEM descrições adicionais.

Retorne JSON:
{
  "required_tools": {
    "essential": ["Nome Ferramenta 1", "Nome Ferramenta 2", ...],
    "optional": ["Nome Ferramenta 3", "Nome Ferramenta 4", ...]
  }
}`;
      maxTokens = 8000;
    } else if (sectionType === "checklist") {
      systemPrompt = `Você é um gerente de projetos especializado em criar checklists executáveis seguindo o FRAMEWORK BY RAFAEL MILAGRE.

🏗️ METODOLOGIA DOS 4 QUADRANTES (sua base de trabalho):

QUADRANTE 1 - Bancos de Dados e Armazenamento:
Ferramentas: Airtable, Google Sheets, Notion Database, Supabase, Firebase, PostgreSQL, MySQL, MongoDB
Foco: Estruturação, armazenamento e consulta de dados

QUADRANTE 2 - Inteligência Artificial:
APIs: OpenAI (GPT-5, DALL-E, Whisper), Anthropic (Claude), Google (Gemini), Grok, Deepseek, Manus, Agent GPT, Genspark
Plataformas: ChatGPT, MidJourney, Stable Diffusion, ElevenLabs (síntese de voz)
Visão Computacional: GPT-4 Vision, Google Vision API
Foco: Processamento inteligente, análise, geração de conteúdo e decisões automatizadas

QUADRANTE 3 - Automação e Integração:
Ferramentas: Lovable, Make, n8n, Zapier, Lindy AI, Integromat, Pipedream
Foco: Orquestração de fluxos, conexão entre sistemas e automação de processos

QUADRANTE 4 - Interfaces onde a IA atua:
Canais: WhatsApp, Site/Web App, Plataforma própria, CRM, ERP, Gmail, Chatbot, Twilio, Discord, Telegram, Slack
Foco: Interação do usuário final com a solução

📋 INSTRUÇÕES PARA CRIAR O PLANO DE AÇÃO:

1. **Analise o contexto fornecido:**
   - Framework já mapeado (4 quadrantes preenchidos)
   - Arquitetura e fluxos (diagramas Mermaid criados)
   - Ferramentas identificadas (essenciais e opcionais)
   - Perguntas e respostas da validação técnica

2. **Crie um plano de ação sequencial seguindo esta estrutura em 5 FASES:**

   **FASE 1: Setup de Dados (Quadrante 1)**
   - Configuração de bancos de dados
   - Estruturação de schemas/tabelas
   - Setup inicial de armazenamento
   - Steps: 3-5 tarefas executáveis

   **FASE 2: Integração de IA (Quadrante 2)**
   - Configuração de APIs de IA
   - Criação de prompts e fluxos de IA
   - Testes de modelos
   - Steps: 4-6 tarefas executáveis

   **FASE 3: Automação de Fluxos (Quadrante 3)**
   - Setup de ferramentas de automação
   - Criação de workflows conectando Q1 e Q2
   - Integrações entre sistemas
   - Steps: 4-6 tarefas executáveis

   **FASE 4: Implementação de Interfaces (Quadrante 4)**
   - Desenvolvimento de interfaces de usuário
   - Conexão de canais ao backend
   - Experiência do usuário final
   - Steps: 3-5 tarefas executáveis

   **FASE 5: Testes e Deploy**
   - Testes de ponta a ponta
   - Validação de integrações
   - Deploy em produção
   - Steps: 3-4 tarefas executáveis

 3. **Cada step DEVE incluir (estrutura completa):**
   - \`step_number\`: Número sequencial (1, 2, 3...)
   - \`title\`: Título claro e executável (ex: "Configurar tabela users no Supabase")
   - \`description\`: Tutorial detalhado com 10+ frases explicando COMO fazer, incluindo comandos, endpoints, configurações
   - \`quadrant\`: Qual quadrante está sendo implementado ("Q1", "Q2", "Q3", "Q4", "Geral")
   - \`estimated_time\`: Tempo estimado (ex: "2 horas", "1 dia", "30 minutos")
   - \`difficulty\`: "easy", "medium", "hard"
   - \`dependencies\`: Array de step_numbers dependentes (ex: [1, 2])
   - \`validation_criteria\`: Array com 4+ critérios testáveis (ex: ["Tabela criada no Supabase", "RLS habilitado"])
   - \`common_pitfalls\`: Array com 5+ erros comuns a evitar (ex: ["Esquecer de habilitar RLS"])
   - \`resources\`: Array de URLs de tutoriais/documentação relevantes (URLs reais quando possível)
   - \`tools_required\`: Array de ferramentas necessárias para este step (ex: ["Supabase", "Make.com"])

⚠️ ATENÇÃO CRÍTICA - ESTRUTURA DE DADOS:
NÃO aninhe os campos acima dentro de "metadata"! Todos devem estar no PRIMEIRO NÍVEL do objeto step.
Exemplo CORRETO de JSON:
{
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Configurar Ambiente Supabase",
      "description": "Acesse o dashboard do Supabase... [tutorial com 10+ frases]",
      "quadrant": "Q1",
      "estimated_time": "2 horas",
      "difficulty": "easy",
      "tools_required": ["Supabase", "PostgreSQL"],
      "dependencies": [],
      "validation_criteria": ["Banco criado", "Tabelas migradas", "RLS ativo", "Auth configurado"],
      "common_pitfalls": ["Esquecer de ativar RLS", "Não configurar secrets"],
      "resources": ["https://supabase.com/docs/guides/database"]
    }
  ]
}

4. **Seja ESPECÍFICO e EXECUTÁVEL:**
   - Mencione ferramentas CONCRETAS do framework fornecido
   - Inclua comandos SQL, endpoints de API, configurações quando possível
   - Explique integrações entre quadrantes (ex: "Usar Zapier para conectar WhatsApp ao Supabase")
   - Use dados da arquitetura fornecida (fluxos Mermaid, tempo estimado)

5. **Total de Steps:** 15-25 steps bem detalhados distribuídos pelas 5 fases

⚠️ ATENÇÃO CRÍTICA:
- O plano DEVE seguir a sequência lógica dos 4 quadrantes
- NÃO crie um plano genérico ou abstrato
- USE as ferramentas específicas mencionadas no contexto fornecido
- Referencie os fluxos da arquitetura quando aplicável
- Cada descrição deve ser um mini-tutorial executável

Retorne JSON (sem markdown, sem code blocks):
{
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Exemplo: Configurar banco Supabase",
      "description": "Acesse o dashboard do Supabase... [10+ frases detalhadas]",
      "quadrant": "Q1",
      "estimated_time": "2 horas",
      "difficulty": "medium",
      "dependencies": [],
      "validation_criteria": ["Tabela criada", "RLS habilitado", "Políticas configuradas", "Índices criados"],
      "common_pitfalls": ["Esquecer RLS", "Não validar permissões", "Índices faltando", "Timestamps ausentes", "Relacionamentos incorretos"],
      "resources": ["https://supabase.com/docs/guides/database", "https://supabase.com/docs/guides/auth"],
      "tools_required": ["Supabase", "PostgreSQL"]
    }
  ]
}`;
      maxTokens = 40000;
    } else if (sectionType === "architecture") {
      systemPrompt = `Você é arquiteto de sistemas especializado em Mermaid.

Gere 1-3 fluxos visuais diferentes usando código Mermaid:
1. Fluxo de Implementação (graph TD)
2. Fluxo de Dados/APIs (sequenceDiagram)
3. Jornada do Usuário (journey)

REGRAS CRÍTICAS DO MERMAID:
- Use setas com espaços: " --> "
- IDs sem espaços (use underscore)
- Labels entre colchetes
- Máximo 20 nós por diagrama
- Português nos labels

Retorne JSON:
{
  "implementation_flows": {
    "flows": [
      {
        "id": "...",
        "title": "...",
        "description": "...",
        "mermaid_code": "graph TD...",
        "estimated_time": "...",
        "complexity": "..."
      }
    ],
    "total_estimated_time": "...",
    "prerequisites": "..."
  }
}`;
      maxTokens = 20000;
    } else if (sectionType === "lovable") {
      systemPrompt = `Você é o LOVABLE, a plataforma de desenvolvimento AI-first. Você está gerando um prompt para VOCÊ MESMO implementar uma solução.

🎯 MISSÃO:
Criar um PROMPT INICIAL COMPLETO que permita implementar essa solução no Lovable de forma eficiente, usando as melhores práticas e funcionalidades nativas da plataforma.

📋 ESTRUTURA DO PROMPT (use TODOS os tópicos):

## 1. CONTEXTO E OBJETIVO (2-3 parágrafos)
- Descreva o problema de negócio
- Explique a solução proposta
- Defina o público-alvo

## 2. STACK TECNOLÓGICA RECOMENDADA
- Frontend: React + TypeScript + shadcn/ui (componentes prontos)
- Backend: Supabase (database, auth, edge functions, storage)
- Integrações: Liste APIs necessárias (Lovable AI, Stripe, Twilio, etc)
- Mencione Lovable Cloud se precisar de backend escalável

## 3. FUNCIONALIDADES PRINCIPAIS
Liste cada feature detalhadamente:
- Nome da funcionalidade
- Comportamento esperado (passo-a-passo do usuário)
- Regras de negócio
- Validações necessárias

## 4. ESTRUTURA DE DADOS (Database Schema)
Defina tabelas com:
- Nome da tabela
- Colunas (tipo, nullable, defaults)
- Relacionamentos
- Políticas RLS (Row Level Security)
- Índices para performance

## 5. AUTENTICAÇÃO E PERMISSÕES
- Tipo de auth (email/senha, Google, etc)
- Níveis de acesso (admin, user)
- Fluxos de onboarding

## 6. INTEGRAÇÕES EXTERNAS
Para cada integração:
- API/Serviço necessário
- Endpoint específico
- Autenticação (API keys via Supabase secrets)
- Exemplo de payload/resposta
- Edge function necessária para segurança

## 7. DESIGN E UX
- Estilo visual (moderno, minimalista, etc)
- Cores principais (use semantic tokens)
- Layout responsivo (mobile-first)
- Componentes UI necessários

## 8. FLUXOS CRÍTICOS
Descreva os 2-3 fluxos mais importantes:
- Fluxo de cadastro/onboarding
- Fluxo principal da aplicação
- Fluxo de pagamento/conversão (se aplicável)

## 9. CRITÉRIOS DE ACEITE
Liste 8-12 critérios mensuráveis:
- [ ] Funcionalidade X está operacional
- [ ] Performance < 2s para ação Y
- [ ] Mobile responsivo em telas 320px+

## 10. OBSERVAÇÕES TÉCNICAS
- Mencione se precisa de rate limiting
- Considere caching para queries pesadas
- Sugira otimizações de performance
- Alerte sobre possíveis gargalos

🚀 DIFERENCIAIS LOVABLE:
- Use Lovable AI (google/gemini-2.5-flash por padrão) para features de IA
- Mencione edge functions para lógica backend
- Configure RLS policies para segurança
- Use shadcn/ui para UI consistente e profissional
- Integre Supabase Realtime se precisar de updates em tempo real

⚠️ IMPORTANTE:
- Seja ESPECÍFICO: evite "criar dashboard", diga "dashboard com cards de métricas X, Y, Z"
- Seja EXECUTÁVEL: cada instrução deve ser clara o suficiente para implementação direta
- Seja COMPLETO: não deixe funcionalidades críticas implícitas

Retorne JSON:
{
  "lovable_prompt": "# [Título da Solução]\n\n## 1. Contexto...",
  "complexity": "low/medium/high",
  "estimated_time": "1-2 semanas / 2-4 semanas / 1-2 meses"
}`;
      maxTokens = 40000; // 🚀 Aumentado para suportar prompts mais completos
    }

    // 🎯 Incluir CONTEXTO COMPLETO para TODAS as seções
    let contextualInfo = '';
    
    // Buscar perguntas e respostas da validação
    const questionsAsked = solution.questions_asked || [];
    const userAnswers = solution.user_answers || [];
    
    if (questionsAsked.length > 0 && userAnswers.length > 0) {
      contextualInfo = '\n\n📝 CONTEXTO ADICIONAL (Validação Técnica):\n';
      questionsAsked.forEach((q: string, idx: number) => {
        const answer = userAnswers[idx] || 'Não respondido';
        contextualInfo += `\nPergunta ${idx + 1}: ${q}\nResposta: ${answer}\n`;
      });
    }
    
    // Adicionar dados estruturados da solução se existirem
    if (solution.required_tools) {
      contextualInfo += '\n\n🛠️ FERRAMENTAS IDENTIFICADAS:\n';
      const tools = solution.required_tools;
      if (tools.essential) {
        contextualInfo += `Essential: ${tools.essential.map((t: any) => t.name).join(', ')}\n`;
      }
      if (tools.optional) {
        contextualInfo += `Optional: ${tools.optional.map((t: any) => t.name).join(', ')}\n`;
      }
    }
    
    if (solution.framework_mapping && sectionType !== 'framework') {
      contextualInfo += '\n\n🏗️ FRAMEWORK JÁ MAPEADO (4 Quadrantes Rafael Milagre):\n';
      const fw = solution.framework_mapping;
      Object.keys(fw).forEach(key => {
        if (fw[key]?.title) {
          contextualInfo += `- ${fw[key].title}: ${fw[key].tool_names?.join(', ') || 'N/A'}\n`;
        }
      });
    }
    
    // 🆕 CRÍTICO: Adicionar arquitetura/fluxos se existir e for geração de checklist
    if (solution.implementation_flows && sectionType === 'checklist') {
      contextualInfo += '\n\n🌊 ARQUITETURA E FLUXOS DA SOLUÇÃO:\n';
      
      const flows = solution.implementation_flows;
      
      if (flows.flows && Array.isArray(flows.flows)) {
        flows.flows.forEach((flow: any, idx: number) => {
          contextualInfo += `\nFluxo ${idx + 1}: ${flow.title}\n`;
          contextualInfo += `Descrição: ${flow.description}\n`;
          contextualInfo += `Complexidade: ${flow.complexity}\n`;
          contextualInfo += `Tempo Estimado: ${flow.estimated_time}\n`;
          
          // Adicionar código Mermaid resumido (primeiras 10 linhas)
          if (flow.mermaid_code) {
            const lines = flow.mermaid_code.split('\n').slice(0, 10).join('\n');
            contextualInfo += `Estrutura: ${lines}...\n`;
          }
        });
      }
      
      if (flows.total_estimated_time) {
        contextualInfo += `\nTempo Total Estimado: ${flows.total_estimated_time}\n`;
      }
      
      if (flows.prerequisites) {
        contextualInfo += `Pré-requisitos: ${flows.prerequisites}\n`;
      }
    }

    const userPrompt = `Analise esta solução e gere o conteúdo solicitado:

IDEIA ORIGINAL: ${solution.original_idea}
TÍTULO: ${solution.title}
DESCRIÇÃO: ${solution.short_description || 'Não especificada'}
PÚBLICO-ALVO: ${solution.target_audience || 'Não especificado'}
${contextualInfo}

Retorne APENAS o objeto JSON especificado (sem markdown, sem code blocks).`;

    console.log(`[SECTION-GEN] 🤖 Modelo: ${model}`);
    console.log(`[SECTION-GEN] 📊 Max tokens: ${maxTokens}`);
    console.log(`[SECTION-GEN] 🚀 Chamando Lovable AI...`);
    
    const startTime = Date.now(); // 🚀 FASE 1: Tracking de tempo

    const aiResponse = await fetch(lovableUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(180000)
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[SECTION-GEN] ❌ Erro na AI: ${aiResponse.status} - ${errorText}`);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit atingido. Aguarde alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[SECTION-GEN] 📥 Resposta recebida (${content.length} chars)`);
    console.log(`[SECTION-GEN] ⚡ Tempo de geração: ${elapsedTime}s`);

    // Parse do JSON retornado
    let parsedContent;
    try {
      // Limpar markdown code blocks e whitespace
      let cleanContent = content.trim();
      
      // Remover code blocks markdown se existir
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      }
      
      parsedContent = JSON.parse(cleanContent);
      
      // Validar que tem o campo esperado
      if (sectionType === 'lovable' && !parsedContent.lovable_prompt) {
        throw new Error('Campo lovable_prompt ausente na resposta');
      }
      if (sectionType === 'framework' && !parsedContent.framework_quadrants) {
        throw new Error('Campo framework_quadrants ausente na resposta');
      }
      
    } catch (parseError) {
      console.error("[SECTION-GEN] ❌ Erro ao fazer parse:", content.substring(0, 800));
      console.error("[SECTION-GEN] ❌ Parse error:", parseError);
      throw new Error(`JSON inválido retornado pela IA: ${parseError.message}`);
    }

    // 🛡️ FASE 3: VALIDAÇÃO DE RESPOSTA
    if (sectionType === 'checklist' && parsedContent.implementation_checklist) {
      const firstItem = parsedContent.implementation_checklist[0];
      
      if (firstItem) {
        console.log('[VALIDATION] 🔍 Estrutura do primeiro item retornado pela IA:', {
          hasStepNumber: 'step_number' in firstItem,
          hasQuadrant: 'quadrant' in firstItem,
          hasEstimatedTime: 'estimated_time' in firstItem,
          hasDifficulty: 'difficulty' in firstItem,
          hasToolsRequired: 'tools_required' in firstItem,
          hasMetadata: 'metadata' in firstItem,
          keys: Object.keys(firstItem),
          sample: {
            step_number: firstItem.step_number,
            quadrant: firstItem.quadrant,
            estimated_time: firstItem.estimated_time,
            difficulty: firstItem.difficulty,
            tools_required: firstItem.tools_required
          }
        });
        
        // Avisar se campos estiverem no lugar errado
        if (firstItem.metadata?.step_number && !firstItem.step_number) {
          console.warn('⚠️ [VALIDATION] IA colocou step_number dentro de metadata! Normalizando...');
        }
        if (firstItem.metadata?.quadrant && !firstItem.quadrant) {
          console.warn('⚠️ [VALIDATION] IA colocou quadrant dentro de metadata! Normalizando...');
        }
        if (firstItem.metadata?.tools_required && !firstItem.tools_required) {
          console.warn('⚠️ [VALIDATION] IA colocou tools_required dentro de metadata! Normalizando...');
        }
      } else {
        console.error('❌ [VALIDATION] IA não retornou nenhum item no checklist!');
      }
    }

    // Preparar update baseado no tipo de seção
    const updateData: Record<string, any> = {};
    
    if (sectionType === "framework") {
      updateData.framework_mapping = parsedContent.framework_quadrants;
      updateData.mind_map = parsedContent.mind_map;
    } else if (sectionType === "tools") {
      updateData.required_tools = parsedContent.required_tools;
    } else if (sectionType === "checklist") {
      updateData.implementation_checklist = parsedContent.implementation_checklist;
      
      // 🆕 Salvar também em unified_checklists para acesso rápido
      // 🔥 FASE 1: PARSING ROBUSTO - Extrair campos de onde a IA colocou
      const unifiedItems = parsedContent.implementation_checklist.map((step: any, index: number) => {
        // Extrair campos do objeto retornado (primeiro nível OU metadata)
        const stepNumber = step.step_number ?? step.metadata?.step_number ?? index + 1;
        const estimatedTime = step.estimated_time ?? step.metadata?.estimated_time;
        const difficulty = step.difficulty ?? step.metadata?.difficulty;
        const quadrant = step.quadrant ?? step.metadata?.quadrant ?? 'Geral';
        const toolsRequired = step.tools_required ?? step.metadata?.tools_required ?? [];
        
        return {
          id: `step-${stepNumber}`,
          title: step.title,
          description: step.description,
          completed: false,
          column: 'todo',
          order: index,
          notes: '',
          // ✅ Campos SEMPRE no primeiro nível (garantido)
          step_number: stepNumber,
          estimated_time: estimatedTime,
          difficulty: difficulty,
          quadrant: quadrant,
          tools_required: toolsRequired,
          // Metadados opcionais
          metadata: {
            dependencies: step.dependencies ?? step.metadata?.dependencies ?? [],
            validation_criteria: step.validation_criteria ?? step.metadata?.validation_criteria ?? [],
            common_pitfalls: step.common_pitfalls ?? step.metadata?.common_pitfalls ?? [],
            resources: step.resources ?? step.metadata?.resources ?? []
          }
        };
      });
      
      // Verificar se já existe um checklist para esta solução
      const { data: existing } = await supabase
        .from('unified_checklists')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .maybeSingle();

      let unifiedError = null;

      if (existing) {
        // Atualizar checklist existente e marcar como template
        const { error } = await supabase
          .from('unified_checklists')
          .update({
            is_template: true,
            checklist_data: {
              items: unifiedItems,
              lastUpdated: new Date().toISOString()
            },
            total_items: unifiedItems.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        unifiedError = error;
        if (!error) {
          console.log('[SECTION-GEN] 🔄 Checklist existente atualizado e marcado como template');
        }
      } else {
        // Inserir novo checklist como template
        const { error } = await supabase
          .from('unified_checklists')
          .insert({
            user_id: userId,
            solution_id: solutionId,
            checklist_type: 'implementation',
            is_template: true,
            checklist_data: {
              items: unifiedItems,
              lastUpdated: new Date().toISOString()
            },
            total_items: unifiedItems.length
          });
        
        unifiedError = error;
      }
      
      if (unifiedError) {
        console.error('[SECTION-GEN] ❌ ERRO CRÍTICO ao salvar unified_checklists:', {
          error: unifiedError,
          solutionId,
          userId,
          itemsCount: unifiedItems.length
        });
        // Não falhar a requisição por isso, apenas logar
      } else {
        console.log('[SECTION-GEN] ✅ Checklist salvo em unified_checklists com sucesso!');
        console.log('[SECTION-GEN] 📝 Timestamp de criação:', new Date().toISOString());
      }
    } else if (sectionType === "architecture") {
      updateData.implementation_flows = parsedContent.implementation_flows;
    } else if (sectionType === "lovable") {
      updateData.lovable_prompt = parsedContent.lovable_prompt;
    }

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update(updateData)
      .eq("id", solutionId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[SECTION-GEN] ❌ Erro ao atualizar:", updateError);
      throw new Error("Erro ao salvar conteúdo gerado");
    }

    console.log(`[SECTION-GEN] ✅ ${sectionType} gerado e salvo com sucesso!`);
    console.log(`[SECTION-GEN] 📊 Tamanho do conteúdo: ${JSON.stringify(parsedContent).length} caracteres`);
    console.log(`[SECTION-GEN] 🎯 Solution ID: ${solutionId}`);
    console.log(`[SECTION-GEN] 📤 Retornando resposta de sucesso ao cliente`);
    console.log(`[SECTION-GEN] ⏰ Timestamp: ${new Date().toISOString()}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cached: false,
        content: parsedContent,
        solutionId: solutionId,
        sectionType: sectionType,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SECTION-GEN] ❌ Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao gerar conteúdo",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});