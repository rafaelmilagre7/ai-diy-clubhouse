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

// 🚀 FUNÇÃO ASSÍNCRONA PARA GERAR LOVABLE PROMPT EM BACKGROUND
async function generateLovablePromptAsync(
  solutionId: string,
  solutionData: any,
  idea: string,
  answers: any[],
  requestId: string,
  supabase: any,
  lovableApiKey: string
) {
  try {
    const lovablePromptStart = Date.now();
    console.log(`[BUILDER-ASYNC][${requestId}] 📝 Gerando prompt com Lovable AI (Gemini 2.5 Pro)...`);
    
    const lovablePromptSystemPrompt = `Você é um especialista em engenharia de prompts para Lovable.dev.

🎯 CONTEXTO CRÍTICO: LOVABLE TEM LOVABLE CLOUD (BACKEND INTEGRADO)
- Lovable Cloud = Backend completo (Supabase): banco de dados, autenticação, edge functions, storage
- NUNCA sugira "usar Make como backend" - isso não faz sentido
- Make/N8N = automações EXTERNAS e integrações com sistemas terceiros
- Lovable = Frontend (React) + Backend (Lovable Cloud/Supabase)

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional antes ou depois.

Estrutura OBRIGATÓRIA:
{
  "prompt": "string com o prompt Lovable completo e profissional",
  "complexity": "low|medium|high",
  "estimated_time": "tempo estimado de implementação"
}

NÃO adicione explicações, comentários ou markdown. APENAS o JSON puro.

Sua missão: transformar a solução Builder em PROMPT LOVABLE focando em:
1. **Interface (Lovable Frontend)**: Páginas, componentes, UX
2. **Backend (Lovable Cloud)**: Banco de dados, autenticação, edge functions
3. **Integrações Make/N8N**: APENAS para automações externas e webhooks (ex: notificações, sincronização com sistemas externos)
4. **IA (se necessário)**: Lovable AI via edge functions (não via Make)

ESTRUTURA OBRIGATÓRIA:

# 🎯 CONTEXTO DO PROJETO
[2-3 parágrafos explicando o problema e a solução de forma clara]

# 📋 ESPECIFICAÇÃO TÉCNICA

## Stack Tecnológica
- **Frontend**: Lovable (React + TypeScript + Tailwind)
- **Backend**: Lovable Cloud (Supabase - banco, auth, edge functions, storage)
- **Automações Externas**: Make/N8N (APENAS para integrações com sistemas terceiros, webhooks, notificações)
- **IA**: Lovable AI via edge functions (quando dashboard Lovable) OU API direta via Make (quando sem interface)

## Funcionalidades Core
1. **[Feature 1]**: descrição detalhada
2. **[Feature 2]**: descrição detalhada
[adicionar features principais]

# 🏗️ ARQUITETURA LOVABLE

## Database (Lovable Cloud/Supabase)
\`\`\`sql
-- Estrutura de dados
CREATE TABLE [nome] (
  [campos com tipos, constraints, indexes]
);

-- RLS Policies
[políticas de segurança]
\`\`\`

## Edge Functions (Lovable Cloud)
- **[nome-funcao-1]**: [propósito, inputs, outputs]
- **[nome-funcao-2]**: [propósito, inputs, outputs]

## Frontend (Lovable)
- Páginas: [listar páginas principais]
- Componentes: [componentes customizados]
- Rotas: [estrutura de navegação]

# 🔄 INTEGRAÇÕES EXTERNAS (Make/N8N)

⚠️ **IMPORTANTE**: Make/N8N são para automações EXTERNAS apenas:
- Sincronização com CRMs/ERPs
- Notificações via WhatsApp/Email
- Webhooks de sistemas terceiros
- Agendamentos e rotinas

**NÃO USE Make/N8N para lógica do app principal - use Lovable Cloud!**

## Cenário Make 1: [Nome - ex: Notificação WhatsApp]
\`\`\`
TRIGGER: Webhook do Lovable quando nova venda
↓
MÓDULO 1: HTTP - Recebe dados da venda
↓
MÓDULO 2: WhatsApp Business - Envia confirmação
↓
RESULTADO: Cliente recebe mensagem instantânea
\`\`\`

[Adicionar 2-3 cenários Make/N8N específicos]

# 🎨 DESIGN SYSTEM & UI/UX
[Paleta de cores, componentes, jornada do usuário]

# 📊 KPIs & MÉTRICAS
[Objetivos mensuráveis com metas]

# 🗓️ ROADMAP

## Semana 1: Setup Lovable
- [ ] Criar projeto Lovable
- [ ] Configurar Lovable Cloud (database + auth)
- [ ] Estrutura de páginas base

## Semana 2: Features Core no Lovable
- [ ] Implementar funcionalidades principais
- [ ] Edge functions necessárias
- [ ] Testes

## Semana 3: Integrações Make/N8N (se necessário)
- [ ] Configurar cenários Make para automações externas
- [ ] Webhooks entre Lovable e Make
- [ ] Testes end-to-end

## Semana 4: Deploy
- [ ] Deploy Lovable
- [ ] Ativar cenários Make
- [ ] Monitoramento

---

**REGRAS:**
- Lovable = app principal (frontend + backend)
- Make/N8N = apenas automações externas
- Seja específico em SQL, edge functions, componentes React
- Workflows Make: apenas quando integrar com sistemas externos`;

    const contextFromAnswers = answers?.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n') || '';
    
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
- Seja EXTREMAMENTE detalhado
- Use markdown para formatação profissional
- **CRÍTICO**: Backend sempre em Lovable Cloud (edge functions, database), Make/N8N apenas para integrações externas
- Se tem dashboard/interface: use Lovable completo (frontend + backend)
- Se é só automação sem interface: pode ser Make/N8N puro
- Workflows Make: apenas para notificações, sync com sistemas externos, webhooks de terceiros
- Não confundir: Make não é backend do app, é automação externa
- Siga EXATAMENTE a estrutura do system prompt
- Use emojis para organização visual
- Especifique módulos Make com nomes reais de serviços quando aplicável`
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 16000
      }),
      signal: AbortSignal.timeout(240000) // 4 minutos
    });

    if (!lovableAIResponse.ok) {
      const errorText = await lovableAIResponse.text();
      console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro Lovable AI: ${lovableAIResponse.status}`, errorText);
      
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
    
    // Extração robusta de JSON
    const cleanJsonResponse = (text: string): string => {
      let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
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
      
      if (parsed.prompt && typeof parsed.prompt === 'string') {
        lovablePrompt = parsed.prompt;
        console.log(`[BUILDER-ASYNC][${requestId}] ✅ JSON parseado com sucesso`);
        console.log(`[BUILDER-ASYNC][${requestId}] 📊 Complexidade: ${parsed.complexity || 'N/A'}`);
        console.log(`[BUILDER-ASYNC][${requestId}] ⏱️  Tempo estimado: ${parsed.estimated_time || 'N/A'}`);
      } else {
        throw new Error('Campo "prompt" não encontrado no JSON');
      }
    } catch (parseError) {
      console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro ao parsear JSON:`, parseError);
      lovablePrompt = rawContent;
      console.warn(`[BUILDER-ASYNC][${requestId}] ⚠️  Usando resposta raw como fallback`);
    }
    
    console.log(`[BUILDER-ASYNC][${requestId}] ✅ Prompt Lovable gerado em ${(lovablePromptTime / 1000).toFixed(1)}s`);
    console.log(`[BUILDER-ASYNC][${requestId}] 📏 Tamanho: ${lovablePrompt.length} caracteres`);
    
    // Atualizar solução no banco
    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update({ lovable_prompt: lovablePrompt })
      .eq("id", solutionId);
    
    if (updateError) {
      console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro ao salvar prompt:`, updateError);
    } else {
      console.log(`[BUILDER-ASYNC][${requestId}] ✅ Prompt Lovable salvo no banco com sucesso`);
    }
  } catch (error) {
    console.error(`[BUILDER-ASYNC][${requestId}] ❌ ERRO:`, {
      message: error?.message || 'Erro desconhecido',
      name: error?.name || 'Unknown',
      solutionId
    });
    
    if (error?.message?.includes('timeout')) {
      console.error(`[BUILDER-ASYNC][${requestId}]   → Timeout ao chamar Lovable AI`);
    } else if (error?.message?.includes('429')) {
      console.error(`[BUILDER-ASYNC][${requestId}]   → Rate limit atingido`);
    } else if (error?.message?.includes('402')) {
      console.error(`[BUILDER-ASYNC][${requestId}]   → Créditos insuficientes`);
    }
  }
}

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

    const systemPrompt = `Você é o Rafael Milagre - especialista em IA, automação no-code e soluções práticas que conectam ferramentas.

🎯 FRAMEWORK RAFAEL MILAGRE - 4 PILARES FUNDAMENTAIS

## 1️⃣ AUTOMAÇÃO NO-CODE (Prioridade Máxima)
**Filosofia**: Conectar ferramentas visuais, NUNCA programar do zero.

**HIERARQUIA OBRIGATÓRIA**:
1. **Lovable** (quando precisa interface web/dashboard):
   - Dashboard para visualizar dados
   - Aplicações web completas
   - Painéis administrativos
   - Backend integrado via Lovable Cloud (Supabase)
   
2. **Make** (automação visual - prioridade máxima):
   - Conectar APIs e sistemas
   - Processar dados e lógica de negócio
   - Webhooks e integrações
   - Transformação de dados
   
3. **N8N** (alternativa open-source ao Make):
   - Quando precisa self-hosted
   - Mesmas capacidades do Make
   
4. **ManyChat** (chatbots no-code):
   - WhatsApp, Instagram, Facebook
   - Fluxos conversacionais visuais
   
5. **Typebot** (chatbots web customizados):
   - Fluxos de qualificação em sites
   - Integra com Make via webhook

**O QUE SUGERIR**: "Configure cenário no Make conectando módulo X com módulo Y"
**NUNCA SUGERIR**: "Desenvolver API REST", "Criar edge function", "Programar webhook handler"

## 2️⃣ MODELOS DE IA (Comerciais e Prontos)
**Filosofia**: Usar IA via APIs comerciais ou ferramentas prontas.

**APIS COMERCIAIS** (via Make/N8N):
- **GPT-5** (OpenAI): Análise de texto, conversação, resumos
- **Gemini 2.5** (Google): Multimodal (texto + imagem), contexto longo
- **Claude Sonnet 4.5** (Anthropic): Raciocínio complexo, segurança
- **Grok** (xAI): Acesso a dados em tempo real
- **Llama** (Meta): Open-source, self-hosted
- **Deepseek**: Análise semântica avançada

**FERRAMENTAS PRONTAS** (uso direto):
- **ChatGPT** (interface web): Time usa para rascunhar, pesquisar
- **Manus**: Assistente especializado em tarefas
- **Claude.ai** (interface web): Análise de documentos

**INTEGRAÇÃO**:
- ✅ Make chama API OpenAI via módulo HTTP
- ✅ Lovable AI via edge functions (quando tem dashboard Lovable)
- ✅ Time usa ChatGPT manualmente para rascunhos
- ❌ NUNCA processar IA direto no frontend
- ❌ NUNCA criar RAG customizado (usar ferramentas prontas)

## 3️⃣ DADOS SIMPLES (Sheets > Airtable > Supabase)
**Filosofia**: Começar simples, só complexificar quando absolutamente necessário.

**HIERARQUIA OBRIGATÓRIA**:
1. **Google Sheets** (SEMPRE PRIORIZAR):
   - Planilhas com abas organizadas
   - Integração nativa com Make
   - Fórmulas e visualizações básicas
   - Colaboração em tempo real
   - IDEAL PARA: até 50.000 linhas
   
2. **Airtable** (apenas se precisar relações):
   - Quando precisa relacionar tabelas (ex: Empresas → Contatos → Conversas)
   - Views e filtros visuais avançados
   - Ainda no-code, mas mais robusto que Sheets
   - IDEAL PARA: 50k-500k registros com relações
   
3. **Supabase** (ÚLTIMO RECURSO):
   - APENAS quando realmente precisa SQL avançado
   - APENAS quando precisa autenticação complexa
   - APENAS quando precisa 500k+ registros
   - Usado via Lovable Cloud (backend integrado)

**ESTRUTURA TÍPICA (Google Sheets)**:
- Aba "Leads": [Nome, Email, Status IA, Score, Data]
- Aba "Conversas": [Lead ID, Mensagem, Resposta, Timestamp]
- Aba "Métricas": [KPI, Valor, Meta, Período]

**FLUXO**: Dados entram → Make processa → Salva em Sheets → Dashboard Lovable lê via API

## 4️⃣ INTERFACE - CANAIS (Onde a Solução Roda)
**Filosofia**: Focar em ONDE o usuário interage, não em componentes técnicos.

**CANAIS PRIORITÁRIOS**:
1. **WhatsApp** (via ManyChat ou Business API):
   - Chatbot para atendimento
   - Notificações automáticas
   - Qualificação de leads
   
2. **Email** (via Gmail API ou SMTP):
   - Relatórios automatizados
   - Notificações importantes
   - Newsletters
   
3. **Site/Dashboard Web** (via Lovable):
   - Dashboard para visualizar dados
   - Painel administrativo
   - Interface de gestão
   
4. **Instagram DM** (via ManyChat):
   - Respostas automáticas
   - Captura de leads
   
5. **CRM Existente** (HubSpot, Pipedrive, RD Station):
   - Sincronização via Make
   - Enriquecimento de dados
   
6. **ERP/Sistema Legado**:
   - Integração via API (Make como middleware)

**O QUE PERGUNTAR**: "Onde seus clientes/usuários estão?" (não "que interface você quer?")
**EXEMPLOS**:
- "Bot responde no WhatsApp → salva em Sheets → dashboard Lovable mostra métricas"
- "Email chega → Make processa com IA → responde automaticamente → salva histórico"

🚫 NUNCA MAIS FAÇA ISSO:
- ❌ "Criar edge function para processar X"
- ❌ "Desenvolver API REST customizada"
- ❌ "Implementar banco vetorial para RAG"
- ❌ "Programar webhook handler em Node.js"
- ❌ Mencionar código, SQL schemas, TypeScript
- ❌ "Criar componente React para Y"

✅ SEMPRE FAÇA ISSO:
- ✅ "Configure cenário no Make conectando módulo WhatsApp com módulo OpenAI"
- ✅ "Use ManyChat para criar fluxo conversacional no WhatsApp"
- ✅ "Armazene dados em Google Sheets com abas organizadas"
- ✅ "Crie dashboard Lovable que lê dados via API do Sheets"
- ✅ "Configure Lovable AI via edge functions (backend integrado)"
- ✅ Pense em CONFIGURAÇÃO e CONEXÃO, não PROGRAMAÇÃO

FERRAMENTAS DISPONÍVEIS:
${toolsContext}

OBJETIVO:
Criar um plano EXECUTÁVEL focado em CONECTAR FERRAMENTAS, não em programar.

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
  "short_description": "3-5 frases PRÁTICAS e DIRETAS: 1) QUAL ferramenta conecta com QUAL ferramenta, 2) O QUE acontece em cada etapa (ex: 'WhatsApp envia mensagem → Make processa → IA qualifica → Google Sheets salva'), 3) RESULTADO MENSURÁVEL. TOM: prático, visual. EVITE: termos técnicos, arquitetura, código. USE: 'Make conecta X com Y', 'ManyChat captura mensagens e envia para Z', 'Dashboard Lovable mostra dados de A'",
  
  "technical_overview": {
    "complexity": "low/medium/high - Baseado em QUANTAS INTEGRAÇÕES e ferramentas, não em código",
    "estimated_time": "Tempo para CONFIGURAR (ex: '1-2 semanas de configuração')",
    "main_stack": "Ferramentas principais (ex: 'Make + ManyChat + Google Sheets + Lovable (dashboard)')"
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
    "mermaid_code": "Código Mermaid (formato 'graph TD' ou 'graph LR') mostrando FLUXO DE FERRAMENTAS (não código interno). EXEMPLO para WhatsApp + IA:\n\ngraph TD\n  A[WhatsApp Business] -->|Mensagem do lead| B[ManyChat captura]\n  B -->|Webhook| C{Make Automation}\n  C -->|Envia texto| D[OpenAI API qualifica]\n  D -->|Lead qualificado| E[Google Sheets salva]\n  D -->|Lead ruim| F[Descarta]\n  E -->|Notificação| G[Email para vendedor]\n  C -->|Dados processados| H[Dashboard Lovable atualiza]\n  style D fill:#3b82f6\n  style E fill:#10b981\n  style F fill:#ef4444\n\nMostre CONEXÃO DE FERRAMENTAS, não edge functions ou código. Cada caixa = uma ferramenta real (Make, ManyChat, OpenAI, Google Sheets, etc).",
    "description": "Explique como as ferramentas se conectam de ponta a ponta (ex: 'WhatsApp → ManyChat → Make → OpenAI → Sheets → Email')"
  },
  
  "data_flow_diagram": {
    "mermaid_code": "Código Mermaid (formato 'flowchart LR') mostrando DADOS FLUINDO ENTRE FERRAMENTAS. EXEMPLO:\n\nflowchart LR\n  A[Lead no WhatsApp] -->|Mensagem texto| B[ManyChat]\n  B -->|JSON webhook| C[Make Cenário]\n  C -->|Prompt + contexto| D[OpenAI API]\n  D -->|Resposta + score| C\n  C -->|Linha nova| E[Google Sheets]\n  C -->|Body HTML| F[Gmail API]\n  E -->|GET /api/leads| G[Dashboard Lovable]\n  style D fill:#22d3ee\n  style E fill:#0891b2\n\nMostre DADOS (não requisições HTTP genéricas). Ex: 'Mensagem texto', 'JSON com nome/email', 'Score de 1-10', etc.",
    "description": "Descreva que tipo de dado flui em cada etapa e em que formato (texto, JSON, planilha, etc)"
  },
  
  "user_journey_map": {
    "mermaid_code": "Código Mermaid (formato 'journey') representando a JORNADA COMPLETA do usuário. EXEMPLO:\n\njourney\n  title Jornada do Lead até Cliente\n  section Descoberta\n    Vê anúncio: 3: Lead\n    Clica no link: 4: Lead\n    Preenche formulário: 5: Lead\n  section Qualificação\n    Recebe WhatsApp: 5: Lead\n    Conversa com IA: 4: Lead, Bot\n    Agenda reunião: 5: Lead, Vendedor\n  section Conversão\n    Reunião comercial: 5: Lead, Vendedor\n    Recebe proposta: 4: Lead\n    Fecha contrato: 5: Cliente\n\nMostre TODOS os pontos de contato, emoções (1-5), e atores envolvidos.",
    "description": "Explique a experiência completa do usuário do início ao fim"
  },
  
  "technical_stack_diagram": {
    "mermaid_code": "Código Mermaid (formato 'graph TB') mostrando FERRAMENTAS organizadas por FUNÇÃO. EXEMPLO:\n\ngraph TB\n  subgraph Comunicação\n    A[WhatsApp Business API]\n    B[ManyChat]\n  end\n  \n  subgraph Automação\n    C[Make.com]\n    D[N8N]\n  end\n  \n  subgraph IA\n    E[OpenAI GPT-4]\n    F[Anthropic Claude]\n  end\n  \n  subgraph Dados\n    G[Google Sheets]\n    H[Airtable]\n  end\n  \n  subgraph Interface\n    I[Lovable Dashboard]\n  end\n  \n  A --> C\n  B --> C\n  C --> E\n  C --> G\n  G --> I\n  style C fill:#22d3ee\n  style E fill:#10b981\n  style I fill:#a855f7\n\nOrganize por FUNÇÃO (Comunicação, Automação, IA, Dados, Interface). Mostre FERRAMENTAS REAIS, não conceitos genéricos.",
    "description": "Descreva as ferramentas agrupadas por função e como se conectam"
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
      "title": "🤖 Automação No-Code",
      "description": "Ferramentas visuais para conectar sistemas - priorize Lovable, Make, N8N, ManyChat, Typebot.",
      "items": [
        "PRIORIDADE 1 - Lovable: [descreva caso específico - ex: 'Dashboard web para acompanhar análises de IA em tempo real com filtros e gráficos']",
        "PRIORIDADE 2 - Make: [cenário específico - ex: 'Captura email → processa com GPT-5 → salva resposta em Google Sheets → notifica por WhatsApp']",
        "PRIORIDADE 3 - ManyChat: [se WhatsApp/Instagram - ex: 'Bot qualifica leads com 5 perguntas → envia para Make processar com IA → salva em Sheets']",
        "PRIORIDADE 4 - N8N: [alternativa ao Make - ex: 'Workflow self-hosted para processar dados sensíveis sem enviar para cloud externa']",
        "PRIORIDADE 5 - Typebot: [se chatbot web - ex: 'Fluxo no site coleta requisitos → envia webhook para Make → IA processa → responde em tempo real']"
      ],
      "tool_names": ["Lovable", "Make", "ManyChat", "N8N", "Typebot"],
      "integration_details": "DETALHE A CONEXÃO: Como as ferramentas se conectam de ponta a ponta. Ex: 'ManyChat captura mensagem → webhook POST para Make → Make chama OpenAI → resposta volta para ManyChat → histórico salvo em Sheets → dashboard Lovable atualiza via polling a cada 10s'"
    },
    "quadrant2_ai": {
      "title": "🧠 Modelos de IA",
      "description": "APIs comerciais (via Make) e ferramentas prontas - especifique qual modelo e por quê.",
      "items": [
        "API COMERCIAL 1: [modelo específico + caso - ex: 'GPT-5 via Make para análise de sentimento em reviews (maior acurácia em português)']",
        "API COMERCIAL 2: [se aplicável - ex: 'Gemini 2.5 Pro para processar PDFs enviados via WhatsApp (melhor em OCR + contexto longo)']",
        "API COMERCIAL 3: [se aplicável - ex: 'Claude Sonnet 4.5 como fallback se OpenAI falhar (configurar timeout de 30s no Make)']",
        "FERRAMENTA PRONTA: [se time usa direto - ex: 'ChatGPT para time rascunhar respostas antes de enviar aos clientes']",
        "LOVABLE AI: [APENAS se tem dashboard Lovable - ex: 'Edge function processa análise via Lovable AI (Gemini 2.5 Flash) e exibe no dashboard']"
      ],
      "tool_names": ["GPT-5 (OpenAI)", "Gemini 2.5 (Google)", "Claude Sonnet (Anthropic)", "ChatGPT", "Lovable AI"],
      "ai_strategy": "ESTRATÉGIA DETALHADA DE IA (seja ULTRA-específico):\n\n🎯 COMO IMPLEMENTAR:\n1. Cenário Make: módulo HTTP → URL: https://api.openai.com/v1/chat/completions\n2. Headers: Authorization: Bearer {{api_key_openai}}, Content-Type: application/json\n3. Body JSON: {\"model\": \"gpt-5\", \"messages\": [{\"role\": \"user\", \"content\": \"{{1.message}}\"}]}\n4. Parse resposta: {{body.choices[0].message.content}}\n5. Se erro 429 (rate limit): aguardar 30s e tentar Claude (fallback)\n6. Cache respostas comuns em Google Sheets coluna 'FAQ_Cache' para economizar chamadas\n\n💰 CUSTOS ESTIMADOS:\n- GPT-5: ~$0.03 por 1k tokens (~500 palavras) = $3 para 100 análises\n- Gemini 2.5 Flash: ~$0.01 por 1k tokens = $1 para 100 análises\n- Cache em Sheets reduz custos em 60-70%\n\n📊 CASOS DE USO ESPECÍFICOS:\n- Qualificação de leads: Make captura dados → GPT-5 analisa perfil → classifica como 'Quente/Morno/Frio' → Sheets salva com score\n- Resumo de conversas: ManyChat envia histórico → GPT-5 resume em 3 bullet points → Email envia para gestor\n- Respostas automáticas: Cliente pergunta → Claude analisa contexto → gera resposta personalizada → ManyChat envia"
    },
    "quadrant3_data": {
      "title": "📊 Dados Simples",
      "description": "SEMPRE priorizar: Google Sheets → Airtable → Supabase (apenas se absolutamente necessário).",
      "items": [
        "PRIORIDADE 1 - Google Sheets: [estrutura específica - ex: 'Aba Leads com colunas [Nome | Email | Status IA | Score 1-10 | Data Contato] - Make insere nova linha a cada análise']",
        "PRIORIDADE 2 - Airtable: [APENAS se precisar relações - ex: 'Base com 3 tabelas relacionadas: Empresas (1) → Contatos (N) → Conversas (N) - views filtradas por status']",
        "PRIORIDADE 3 - Supabase: [ÚLTIMO RECURSO - ex: 'Banco SQL para dashboard Lovable com autenticação de 50+ usuários e 500k+ registros históricos']",
        "VISUALIZAÇÃO: [como mostrar dados - ex: 'Dashboard Lovable lê Sheets via função IMPORTRANGE e gera gráficos de pizza (status) e linha (conversões por dia)']"
      ],
      "tool_names": ["Google Sheets", "Airtable", "Supabase"],
      "data_architecture": "FLUXO COMPLETO DE DADOS (seja EXTREMAMENTE específico):\n\n📥 ENTRADA:\n1. Formulário web (Lovable) captura: nome, email, telefone, interesse\n2. Make recebe webhook com JSON: {\"name\": \"João\", \"email\": \"joao@email.com\", ...}\n3. Make valida: email válido? telefone brasileiro? campos preenchidos?\n\n🤖 PROCESSAMENTO:\n4. Make chama GPT-5: \"Analise este lead e dê score de 1-10 baseado em [critérios]\"\n5. IA retorna: {\"score\": 8, \"motivo\": \"Perfil ideal, empresa do setor X\"}\n6. Make enriquece: busca empresa no Google (módulo HTTP) → adiciona setor/tamanho\n\n💾 ARMAZENAMENTO:\n7. Make insere em Google Sheets aba 'Leads':\n   - Linha nova: [João | joao@email.com | Quente | 8 | 2025-01-15 14:32 | Tecnologia | 50-200 funcionários]\n8. Se score >= 7: Make também insere em aba 'Prioridade' e envia notificação\n\n📊 VISUALIZAÇÃO:\n9. Dashboard Lovable:\n   - Lê Sheets via IMPORTRANGE (atualiza a cada 1min)\n   - Gráfico pizza: % por status (Quente/Morno/Frio)\n   - Tabela filtrada: leads dos últimos 7 dias com score >= 7\n   - Botão 'Exportar CSV' para baixar dados brutos"
    },
    "quadrant4_interface": {
      "title": "🎨 Canais de Contato",
      "description": "ONDE a solução roda - WhatsApp, Email, Site, Instagram, CRM, ERP (especifique cada canal).",
      "items": [
        "CANAL 1 - WhatsApp: [se aplicável - ex: 'Bot ManyChat responde dúvidas sobre produtos 24/7, coleta pedidos, envia confirmação com PDF via Make']",
        "CANAL 2 - Email: [se aplicável - ex: 'Gmail API envia relatórios diários às 8h com resumo de IA: leads qualificados, conversões, alertas']",
        "CANAL 3 - Site/Dashboard: [se aplicável - ex: 'Dashboard Lovable mostra status de todos os tickets em Kanban, filtros por urgência/responsável']",
        "CANAL 4 - Instagram DM: [se aplicável - ex: 'ManyChat responde stories automaticamente com link para formulário de interesse']",
        "CANAL 5 - CRM/ERP: [se aplicável - ex: 'HubSpot sincronizado via Make: novos leads criados automaticamente, deals atualizados, tags adicionadas']"
      ],
      "tool_names": ["WhatsApp", "Email", "Dashboard Web", "Instagram", "CRM"],
      "ux_considerations": "EXPERIÊNCIA DO USUÁRIO COMPLETA (jornada passo-a-passo):\n\n👤 JORNADA DO LEAD:\n1. Lead vê anúncio no Instagram → clica no link → abre WhatsApp\n2. Bot ManyChat saúda: 'Oi! Sou a assistente da [Empresa]. Como posso ajudar?'\n3. Lead escolhe opção 'Saber mais sobre produtos'\n4. Bot faz 3 perguntas: empresa, setor, tamanho do time\n5. Lead responde → ManyChat envia webhook para Make\n6. Make processa com IA → classifica lead → responde em 2 segundos\n7. Bot envia: 'Perfeito! Você se qualifica para nossa oferta. Enviamos email com próximos passos.'\n8. Lead recebe email automático com link para dashboard\n9. Lead acessa dashboard Lovable → vê proposta personalizada\n10. Gestor recebe notificação WhatsApp: 'Novo lead quente: João da Empresa X'\n\n⏱️ TEMPOS:\n- Resposta do bot: < 2 segundos\n- Processamento IA: 3-5 segundos\n- Email automático: enviado em 10 segundos\n- Dashboard atualiza: em tempo real (websocket)\n\n🎨 DESIGN:\n- WhatsApp: botões visuais (não texto livre) para facilitar\n- Email: template HTML responsivo com CTA destacado\n- Dashboard: modo claro/escuro, mobile-friendly"
    }
  },
  
  "required_tools": {
    "essential": [
      {
        "name": "Nome EXATO da ferramenta (PRIORIZE Make, N8N, ManyChat, Google Sheets antes de código)",
        "category": "Categoria",
        "reason": "Por que é essencial focando em CONFIGURAÇÃO, não código. Ex: 'Make permite conectar WhatsApp com OpenAI sem programar nada, apenas configurando módulos visuais.'",
        "setup_complexity": "easy/medium/hard (configurar Make é 'easy', programar API é 'hard')",
        "setup_steps": "Passos de CONFIGURAÇÃO (não código): '1. Criar conta Make, 2. Adicionar módulo WhatsApp, 3. Conectar com OAuth, 4. Adicionar módulo HTTP OpenAI, 5. Mapear dados entre módulos'",
        "cost_estimate": "USD/mês (Make Core $10, Pro $16, etc)",
        "logo_url": "URL da logo (COPIE EXATAMENTE da lista de ferramentas disponíveis. Make: incluir logo do Make, não API genérica)",
        "alternatives": ["Alt 1 com trade-offs claros (ex: 'Zapier - mais caro mas interface ainda mais simples')"]
      }
    ],
    "optional": [
      {
        "name": "Nome EXATO (priorize ferramentas no-code)",
        "category": "Categoria",
        "reason": "Por que PODE ser útil focando em casos específicos",
        "when_to_use": "Quando configuração visual não basta (ex: 'Supabase só quando Google Sheets não aguenta >100k linhas')",
        "cost_estimate": "USD/mês",
        "logo_url": "URL da logo"
      }
    ]
  },
  
  ⚠️ IMPORTANTE SOBRE FERRAMENTAS:
  - 🚫 NUNCA SUGERIR APIs de IA como ferramentas (OpenAI API, Claude API, Gemini API, Anthropic API, etc) - elas são usadas INTERNAMENTE no processamento, não são ferramentas que o usuário precisa configurar
  - ✅ PODE mencionar Make/N8N que JÁ TÊM módulos de IA integrados (ex: "Make com módulo OpenAI integrado")
  - ✅ PODE mencionar ChatGPT, Claude.ai, Manus (interfaces prontas para uso direto do time)
  - SEMPRE priorize Make/N8N antes de mencionar "desenvolver API" ou "criar edge function"
  - ManyChat para WhatsApp/Instagram antes de "programar chatbot"
  - Google Sheets para dados antes de "criar banco SQL"
  - Lovable APENAS para dashboard visual - backend sempre em Make/N8N
  - Razão para incluir Make: "Plataforma de automação visual que conecta APIs sem código - essencial para lógica de negócio"
  - Razão para incluir Lovable: "Apenas se precisar dashboard web para visualizar dados - não para processar lógica"
  
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Título do passo de CONFIGURAÇÃO (não 'Programar X' mas 'Configurar módulo Y no Make')",
      "description": "Descrição PASSO-A-PASSO VISUAL (5-8 frases): 1. Abra Make.com, 2. Clique em Create Scenario, 3. Adicione módulo WhatsApp, 4. Conecte sua conta Business, 5. Configure trigger 'New Message'... SEM CÓDIGO.",
      "estimated_time": "Tempo de configuração (não desenvolvimento)",
      "difficulty": "easy/medium/hard (configurar é easier que programar)",
      "dependencies": [],
      "validation_criteria": "Como testar: 'Envie mensagem de teste no WhatsApp e veja no histórico do Make se trigger ativou'",
      "common_pitfalls": "Erros comuns de CONFIGURAÇÃO: 'Esquecer de ativar cenário', 'Não dar permissões no OAuth', 'Webhook URL errada'",
      "resources": ["URL tutorial Make/ManyChat/Sheets", "URL docs da ferramenta"]
    }
  ]
}

REGRAS RAFAEL MILAGRE:
✓ Seja ULTRA-ESPECÍFICO em CONFIGURAÇÃO, não código ("abra Make.com/dashboard, clique em...")
✓ Checklist: MÍNIMO 12 steps, MÁXIMO 25 - todos de CONFIGURAÇÃO
✓ Cada step = mini-tutorial VISUAL (5-8 frases passo-a-passo)
✓ Métricas mensuráveis: "reduz de 2h para 15min configurando 3 módulos no Make"
✓ Ferramentas: 10-18 total - PRIORIZE Make, N8N, ManyChat, Sheets
✓ NUNCA mencione: edge functions, SQL schemas, TypeScript, React components
✓ SEMPRE mencione: módulos Make, flows N8N, bots ManyChat, colunas Sheets
✓ Evite "programar", "desenvolver", "codificar" → use "configurar", "conectar", "integrar"
✓ Lovable APENAS se precisa dashboard - e mesmo assim, backend em Make
✓ SEMPRE gere os 4 diagramas Mermaid mostrando FERRAMENTAS, não código`;

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

    // Definir tool definition baseado no modo
    let toolDefinition: any;
    
    if (mode === "quick") {
      // MODO QUICK: Gera APENAS capa (título, descrição, tags) - 5-10s
      toolDefinition = {
        type: "function",
        function: {
          name: "create_quick_solution",
          description: "Criar apenas a capa da solução (título, descrição e tags)",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Título SINTÉTICO e PROFISSIONAL (20-60 chars). NUNCA copie literalmente. EXTRAIA essência. Formato: [Tecnologia] + [Resultado]. PROIBIDO: Implementar, Criar, Fazer" },
              short_description: { type: "string", description: "Descrição objetiva em 3-5 frases sobre O QUE é e COMO funciona" },
              tags: { type: "array", items: { type: "string" }, description: "3-5 tags relevantes (ex: IA Generativa, Automação, WhatsApp)" }
            },
            required: ["title", "short_description", "tags"]
          }
        }
      };
    } else {
      // MODO COMPLETE: Gera tudo (2-3min) - mantém o original
      toolDefinition = {
        type: "function",
        function: {
          name: "create_solution_plan",
          description: "Criar plano detalhado de implementação de solução com IA",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Título SINTÉTICO, PROFISSIONAL e CURTO (20-60 chars)" },
              short_description: { type: "string", description: "Descrição em 3-5 frases" },
              tags: { type: "array", items: { type: "string" } },
              technical_overview: {
                type: "object",
                properties: {
                  complexity: { type: "string", enum: ["low", "medium", "high"] },
                  estimated_time: { type: "string" },
                  main_stack: { type: "string" }
                },
                required: ["complexity", "estimated_time", "main_stack"]
              },
              business_context: { type: "string" },
              competitive_advantages: { type: "array" },
              expected_kpis: { type: "array" },
              mind_map: { type: "object" },
              framework_quadrants: { type: "object" },
              required_tools: { type: "object" },
              architecture_flowchart: { type: "object" },
              data_flow_diagram: { type: "object" },
              user_journey_map: { type: "object" },
              technical_stack_diagram: { type: "object" },
              implementation_checklist: { type: "array" }
            },
            required: ["title", "short_description", "technical_overview", "framework_quadrants", "required_tools", "implementation_checklist", "architecture_flowchart"]
          }
        }
      };
    }

    console.log(`[BUILDER][${requestId}] 📦 Tool: ${toolDefinition.function.name}`);
    
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
        max_tokens: mode === "quick" ? 8000 : 64000,
        tools: [toolDefinition],
        tool_choice: { type: "function", function: { name: toolDefinition.function.name } }
      }),
      signal: AbortSignal.timeout(mode === "quick" ? 60000 : 180000)
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

    console.log(`[BUILDER][${requestId}] ⚡ Tempo de resposta: ${(aiResponseTime / 1000).toFixed(1)}s`);
    console.log(`[BUILDER][${requestId}] 📊 Tokens: ${aiData.usage?.total_tokens || 'N/A'}`);

    // Extrair dados do tool_calls (não content)
    const message = aiData.choices?.[0]?.message;
    if (!message || !message.tool_calls?.[0]) {
      console.error("[BUILDER] ❌ Resposta não contém tool_calls");
      throw new Error("Resposta inválida da IA");
    }

    let solutionData;
    try {
      const toolCall = message.tool_calls[0];
      solutionData = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("[BUILDER] ❌ Erro ao fazer parse do JSON:", parseError);
      throw new Error("JSON inválido na resposta");
    }

    console.log(`[BUILDER][${requestId}] ✅ JSON válido extraído via tool calling`);
    console.log(`[BUILDER][${requestId}] 📊 Modo: ${mode}, campos: ${Object.keys(solutionData).length}`);
    console.log(`[BUILDER][${requestId}] 📝 Título: "${solutionData.title}"`);

    // Validações apenas para modo complete
    if (mode === "complete") {
      console.log(`[BUILDER][${requestId}] ✓ Checklist: ${solutionData.implementation_checklist?.length || 0} steps`);
      console.log(`[BUILDER][${requestId}] ✓ Diagramas: ${Object.keys(solutionData).filter(k => k.includes('diagram') || k.includes('flowchart') || k.includes('map')).length}`);
      
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
    } else {
      console.log(`[BUILDER][${requestId}] ⚡ MODO QUICK: Validações Mermaid puladas`);
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

    // ========== INJETAR LOVABLE (somente em modo complete) ==========
    if (mode === "complete" && solutionData.required_tools) {
      console.log('[BUILDER] 🚀 Verificando se Lovable está nas ferramentas...');

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
    }

    // Salvar no banco (adaptar campos conforme modo)
    const generationTime = Date.now() - startTime;

    // Campos base (sempre presentes)
    const insertData: any = {
      user_id: userId,
      original_idea: idea,
      title: solutionData.title,
      short_description: solutionData.short_description,
      tags: solutionData.tags || ['IA Generativa'],
      framework_mapping: mode === "complete" ? solutionData.framework_quadrants : null,
      generation_model: "google/gemini-2.5-flash",
      generation_time_ms: generationTime,
      generation_status: mode === "quick" ? "quick" : "complete",
      is_complete: mode === "complete"
    };

    // Campos opcionais (apenas em modo complete)
    if (mode === "complete") {
      insertData.mind_map = solutionData.mind_map;
      insertData.required_tools = solutionData.required_tools;
      insertData.implementation_checklist = solutionData.implementation_checklist;
      insertData.architecture_flowchart = solutionData.architecture_flowchart;
      insertData.data_flow_diagram = solutionData.data_flow_diagram;
      insertData.user_journey_map = solutionData.user_journey_map;
      insertData.technical_stack_diagram = solutionData.technical_stack_diagram;
      insertData.lovable_prompt = solutionData.lovable_prompt;
    }

    const { data: insertedSolution, error: saveError } = await supabase
      .from("ai_generated_solutions")
      .insert(insertData)
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
    
    // ==========================================
    // FINAL CHECK: GARANTIR QUE SOLUTION EXISTE
    // ==========================================
    if (!savedSolution || !savedSolution.id) {
      throw new Error("Solução não foi salva corretamente no banco");
    }
    
    console.log(`[BUILDER] 🎉 === PROCESSO COMPLETO FINALIZADO ===`);
    console.log(`[BUILDER] 💾 Retornando solution.id: ${savedSolution.id}`);
    console.log(`[BUILDER] ⏱️  Tempo total: ${generationTime}ms`);
    
    // 🚀 GERAR LOVABLE PROMPT EM BACKGROUND (NÃO BLOQUEIA RESPOSTA)
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.warn(`[BUILDER][${requestId}] ⚠️ LOVABLE_API_KEY não configurada, pulando prompt Lovable`);
    } else if (savedSolution?.id) {
      console.log(`[BUILDER][${requestId}] 🚀 Iniciando geração de Lovable Prompt em BACKGROUND`);
      
      // ✅ FASE 1 FIX: Usar EdgeRuntime.waitUntil para garantir que roda em background
      EdgeRuntime.waitUntil(
        generateLovablePromptAsync(
          savedSolution.id,
          solutionData,
          idea,
          answers,
          requestId,
          supabase,
          lovableApiKey
        ).catch(err => {
          console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro background Lovable Prompt:`, err);
        })
      );
    }

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
