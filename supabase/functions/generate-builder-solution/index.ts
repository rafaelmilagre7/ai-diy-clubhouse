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

// 🎯 FUNÇÃO ASSÍNCRONA PARA GERAR PROMPT LOVABLE OTIMIZADO
async function generateLovablePromptAsync(
  solutionId: string,
  solutionData: any,
  idea: string,
  requestId: string,
  supabase: any,
  lovableApiKey: string
) {
  try {
    const promptStart = Date.now();
    console.log(`[BUILDER-ASYNC][${requestId}] 🚀 Gerando prompt Lovable otimizado...`);
    
    const lovablePromptSystemPrompt = `Você é um especialista em Lovable Cloud - plataforma de desenvolvimento fullstack com IA.

🎯 MISSÃO: Gerar um PROMPT EXECUTÁVEL que o Lovable possa usar para construir uma aplicação web fullstack completa.

⚠️ LIMITAÇÕES CRÍTICAS DO LOVABLE - LEIA ANTES DE GERAR O PROMPT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚫 O LOVABLE NÃO PODE (bloqueios de arquitetura):
❌ Rodar Node.js, Express, NestJS, Fastify ou qualquer servidor backend tradicional
❌ Usar AWS Lambda, Google Cloud Functions, Azure Functions ou serverless externo
❌ Instalar bibliotecas Python (pandas, numpy, scikit-learn, etc)
❌ Executar scripts shell, cron jobs do sistema operacional ou workers background
❌ Conectar diretamente a bancos MySQL, MongoDB, Redis externos (sem proxy)
❌ Usar SendGrid, Mailgun ou serviços de email externos (use Resend via Edge Function)
❌ Fazer deploy de Docker containers ou microservices customizados

✅ O LOVABLE PODE (stack nativa 100% funcional):
✅ Supabase Edge Functions (Deno/TypeScript) para TODA lógica de backend
✅ Supabase PostgreSQL + Row Level Security (RLS) para banco de dados
✅ Supabase Auth (email/senha, OAuth Google/GitHub, magic links)
✅ Supabase Storage para upload e armazenamento de arquivos
✅ Lovable AI Gateway (Gemini 2.5 Flash/Pro, GPT-5) para IA integrada
✅ Resend para envio de emails (via Edge Function)
✅ Stripe para pagamentos (via Edge Function)
✅ Integrar APIs REST externas VIA Edge Functions (fetch do Deno)
✅ Webhooks recebidos via Edge Functions públicas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ ARQUITETURA LOVABLE CLOUD (STACK OBRIGATÓRIA):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRONTEND:
- React 18 + TypeScript + Vite
- Tailwind CSS com design tokens semânticos (index.css)
- shadcn/ui para componentes (personalizáveis)
- React Router para navegação
- TanStack Query para state management e cache
- React Hook Form + Zod para formulários e validação

BACKEND (ÚNICA OPÇÃO = Supabase Edge Functions):
- Edge Functions (Deno/TypeScript) para TODA lógica de servidor
- PostgreSQL (Supabase) como banco de dados relacional
- Supabase Auth para autenticação nativa
- Row Level Security (RLS) para segurança dos dados
- Supabase Storage para arquivos e imagens
- Resend (via Edge Function) para emails

INTEGRAÇÕES:
- Lovable AI Gateway: google/gemini-2.5-flash (padrão) ou google/gemini-2.5-pro
- Stripe (via Edge Function) para pagamentos
- APIs externas via fetch() dentro de Edge Functions
- Make.com ou N8N APENAS para orquestrações complexas multi-sistema (raro)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ REGRAS CRÍTICAS:
1. SEMPRE use Supabase PostgreSQL para dados (NUNCA Google Sheets como banco)
2. Backend = SEMPRE Supabase Edge Functions (Deno) - SEM Node.js/Express/Lambda
3. Emails = SEMPRE Resend via Edge Function - SEM SendGrid/Mailgun/SMTP direto
4. Implemente RLS policies em TODAS as tabelas sensíveis
5. Use Supabase Auth para autenticação (não Auth0, Firebase Auth, etc)
6. Seja EXTREMAMENTE ESPECÍFICO sobre estrutura de banco de dados
7. Inclua migrations SQL completas no prompt
8. Especifique políticas RLS detalhadas para cada tabela
9. Mencione quando usar Lovable AI (classificação, análise, geração de texto)

ESTRUTURA OBRIGATÓRIA do JSON:

{
  "lovable_prompt": {
    "title": "Título executável e claro (ex: Sistema de CRM com Pipeline de Vendas)",
    "context": "Contexto do negócio, problema a resolver e público-alvo (2-3 parágrafos detalhados)",
    "core_features": [
      "Feature 1 com detalhes técnicos (ex: Dashboard com KPIs em tempo real usando React Query)",
      "Feature 2 com detalhes técnicos (ex: CRUD de clientes com busca full-text no PostgreSQL)",
      "Feature 3 com detalhes técnicos (ex: Sistema de notificações via Edge Function + email)"
    ],
    "technical_requirements": {
      "frontend": "Componentes React necessários com hooks e estado (ex: useClientList, ClientCard, ClientModal)",
      "backend": "OBRIGATÓRIO: Liste APENAS Supabase Edge Functions (Deno/TypeScript) e suas funções (ex: create-invoice.ts, send-notification.ts, process-payment.ts). NUNCA mencione Node.js, Express, Lambda ou outro backend.",
      "database": "Estrutura COMPLETA: tabelas, campos com tipos, relações FK, índices, triggers, RLS policies",
      "authentication": "Tipo de auth (email/senha, OAuth Google/GitHub, magic link) + roles de usuário",
      "external_apis": ["APIs externas APENAS se necessário (ex: Stripe API via Edge Function, API Correios via Edge Function)"]
    },
    "ui_ux_guidelines": {
      "design_style": "Estilo visual específico (ex: dashboard corporativo, landing page vibrante, portal minimalista)",
      "color_scheme": "Paleta HSL para design tokens (ex: primary: 220 60% 50%, accent: 280 70% 60%)",
      "key_interactions": ["Interações principais com feedback visual (ex: drag-and-drop cards, modal de confirmação, toast de sucesso)"]
    },
    "success_criteria": [
      "Critério mensurável 1 (ex: Usuário consegue criar cliente em menos de 30 segundos)",
      "Critério mensurável 2 (ex: Dashboard carrega em menos de 2 segundos com 1000 registros)"
    ],
    "full_prompt": "PROMPT COMPLETO E EXECUTÁVEL. Use comandos diretos, estruturação clara com TÍTULOS, sub-seções, bullets, código SQL quando relevante. Seja ultra-específico sobre o que construir."
  }
}

📌 EXEMPLOS DE STACK CORRETA vs INCORRETA:

❌ ERRADO (NÃO FUNCIONA NO LOVABLE):
Backend: Node.js com Express.js
Orquestração: AWS Lambda com SQS
Banco de dados: MongoDB Atlas
Email: SendGrid API direta
Processamento: Python com pandas

✅ CORRETO (FUNCIONA NO LOVABLE):
Backend: Supabase Edge Function (Deno/TypeScript)
Orquestração: Edge Function agendada (cron)
Banco de dados: Supabase PostgreSQL com RLS
Email: Resend via Edge Function
Processamento: Edge Function com lógica TypeScript

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 TEMPLATE DE FULL_PROMPT (COPIE ESTA ESTRUTURA):

"Crie um [TIPO DE APLICAÇÃO] com [OBJETIVO PRINCIPAL].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FUNCIONALIDADES PRINCIPAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [FEATURE 1]
   - Descrição técnica detalhada
   - Componentes React: [lista]
   - Estado gerenciado com TanStack Query

2. [FEATURE 2]
   - Descrição técnica detalhada
   - Edge Function necessária: [nome-da-function]
   - Validação com Zod

3. [FEATURE 3]
   - Descrição técnica detalhada
   - Integração com [API externa ou Lovable AI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️ BANCO DE DADOS (Supabase PostgreSQL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TABELA: [nome_tabela_1]
- id (uuid, PK, default: gen_random_uuid())
- user_id (uuid, FK -> auth.users, NOT NULL)
- campo_1 (tipo, constraints)
- campo_2 (tipo, constraints)
- created_at (timestamptz, default: now())
- updated_at (timestamptz, default: now())

RLS POLICIES:
  ✅ Enable RLS
  ✅ Policy: Users can view their own records
     (auth.uid() = user_id)
  ✅ Policy: Users can insert their own records
     (auth.uid() = user_id)
  ✅ Policy: Users can update their own records
     (auth.uid() = user_id)

ÍNDICES:
- CREATE INDEX idx_[tabela]_user_id ON [tabela](user_id);
- CREATE INDEX idx_[tabela]_created_at ON [tabela](created_at DESC);

TRIGGERS:
- Trigger para atualizar updated_at automaticamente

[Repetir para cada tabela necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ EDGE FUNCTIONS (ÚNICA OPÇÃO DE BACKEND NO LOVABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANTE: Supabase Edge Functions (Deno/TypeScript) é a ÚNICA forma de backend no Lovable.
NÃO mencione Node.js, Express, AWS Lambda, Google Cloud Functions ou qualquer outro backend.

FUNCTION: [nome-da-function]
Objetivo: [Descrição clara do que faz]
Entrada: { campo1: tipo, campo2: tipo }
Saída: { success: boolean, data?: objeto, error?: string }
Tecnologia: Deno (TypeScript) - runtime nativo das Edge Functions
Lógica:
  1. Validar entrada com Zod
  2. [Passo específico da lógica de negócio]
  3. Chamar Lovable AI se necessário (model: google/gemini-2.5-flash)
  4. Salvar no banco via Supabase Client (TypeScript)
  5. Enviar email via Resend (se necessário)
  6. Retornar resposta JSON

[Repetir para cada Edge Function]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTENTICAÇÃO E SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIPO: [Email/Senha | OAuth (Google/GitHub) | Magic Link]

ROLES DE USUÁRIO:
- [role_1]: Permissões específicas
- [role_2]: Permissões específicas

RLS: Todas as tabelas de dados do usuário devem ter RLS habilitado.
Protected Routes: Usar AuthContext + ProtectedRoute component.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 INTEGRAÇÕES COM IA (Lovable AI Gateway)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USE CASO: [Classificação de texto | Análise de sentimento | Geração de conteúdo | etc]
MODELO: google/gemini-2.5-flash (padrão) ou google/gemini-2.5-pro (tarefas complexas)
IMPLEMENTAÇÃO:
  - Edge Function chama https://ai.gateway.lovable.dev/v1/chat/completions
  - Header Authorization: Bearer LOVABLE_API_KEY (já configurado)
  - System prompt específico
  - Processar resposta e salvar no banco

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 ENVIO DE EMAILS (Resend via Edge Function)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANTE: NO LOVABLE, use APENAS Resend para emails.
NÃO mencione SendGrid, Mailgun, Nodemailer, AWS SES ou SMTP direto.

IMPLEMENTAÇÃO:
  - Edge Function importa: import { Resend } from "npm:resend@2.0.0"
  - Usa RESEND_API_KEY (secret configurado no Lovable)
  - Exemplo de código:
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    await resend.emails.send({
      from: "Seu App <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Assunto do email",
      html: templateHTML
    });

USE CASES: Confirmação de cadastro, redefinição de senha, notificações, relatórios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 UI/UX E DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTILO: [Corporativo | Moderno | Minimalista | Vibrante]

DESIGN TOKENS (index.css):
  --primary: [HSL value]
  --secondary: [HSL value]
  --accent: [HSL value]
  --background: [HSL value]
  --foreground: [HSL value]

COMPONENTES PRINCIPAIS:
  - [ComponentName]: Descrição e funcionalidade
  - [ComponentName]: Descrição e funcionalidade

INTERAÇÕES:
  - [Interação 1]: Feedback visual (toast, loading state, etc)
  - [Interação 2]: Feedback visual

RESPONSIVIDADE: Mobile-first, breakpoints Tailwind (sm, md, lg, xl)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CRITÉRIOS DE SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [Critério mensurável específico]
2. [Critério mensurável específico]
3. Performance: Lighthouse score > 90
4. Segurança: Todas as tabelas com RLS habilitado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CHECKLIST FINAL - ANTES DE GERAR O PROMPT:

✅ Confirmei que NÃO mencionei Node.js, Express, NestJS ou similar
✅ Confirmei que NÃO mencionei AWS Lambda, Google Cloud Functions ou serverless externo
✅ Confirmei que TODO backend está usando Supabase Edge Functions (Deno)
✅ Confirmei que emails estão usando Resend via Edge Function (não SendGrid/Mailgun)
✅ Confirmei que banco de dados é Supabase PostgreSQL (não MongoDB, MySQL, Sheets)
✅ Confirmei que todas as APIs externas são chamadas VIA Edge Functions
✅ Confirmei que todas as tabelas têm RLS policies especificadas
✅ Confirmei que o prompt é 100% executável no Lovable sem necessidade de ajustes

O prompt gerado deve ser TÃO ESPECÍFICO que o usuário possa COPIAR E COLAR no Lovable e obter um app funcional imediatamente."`;



    const userPrompt = `Ideia do usuário: ${idea}

Dados da solução gerada:
- Título: ${solutionData.title}
- Descrição: ${solutionData.short_description}
- Stack principal: ${solutionData.technical_overview?.main_stack || 'N/A'}
- Ferramentas essenciais: ${solutionData.required_tools?.essential?.map((t: any) => t.name).join(', ') || 'N/A'}

Gere um prompt Lovable otimizado e executável.`;

    console.log(`[BUILDER-ASYNC][${requestId}] 🤖 Chamando Lovable AI...`);
    
    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    
    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: lovablePromptSystemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 8000
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro na API:`, errorText);
      throw new Error(`Erro ${aiResponse.status}: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const lovablePrompt = aiData.choices?.[0]?.message?.content;

    if (!lovablePrompt) {
      throw new Error("Resposta vazia da IA");
    }

    console.log(`[BUILDER-ASYNC][${requestId}] ✅ Prompt gerado (${lovablePrompt.length} chars)`);

    // Extrair JSON do prompt
    let parsedPrompt;
    try {
      const jsonMatch = lovablePrompt.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedPrompt = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch (parseError) {
      console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro ao parsear JSON:`, parseError);
      parsedPrompt = {
        lovable_prompt: {
          title: solutionData.title,
          full_prompt: lovablePrompt
        }
      };
    }

    // Salvar no banco
    const { error: updateError } = await supabase
      .from('ai_generated_solutions')
      .update({ 
        lovable_prompt: parsedPrompt.lovable_prompt,
        updated_at: new Date().toISOString()
      })
      .eq('id', solutionId);

    if (updateError) {
      console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro ao salvar:`, updateError);
      throw updateError;
    }

    const promptTime = Date.now() - promptStart;
    console.log(`[BUILDER-ASYNC][${requestId}] 🎉 Prompt Lovable salvo! (${(promptTime / 1000).toFixed(1)}s)`);
    
  } catch (error) {
    console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro fatal:`, {
      message: error?.message || 'Erro desconhecido',
      solutionId
    });
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

    // Verificar limite COM LOG DETALHADO
    console.log(`[BUILDER][${requestId}] 🔍 Verificando limite de gerações...`);
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      "check_ai_solution_limit",
      { p_user_id: userId }
    );

    if (limitError) {
      console.error(`[BUILDER][${requestId}] ❌ Erro ao verificar limite:`, {
        message: limitError.message,
        code: limitError.code,
        details: limitError.details,
        hint: limitError.hint
      });
      return new Response(
        JSON.stringify({ error: "Erro ao verificar limite de gerações" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER][${requestId}] 📊 Limite check:`, {
      can_generate: limitCheck?.can_generate,
      generations_used: limitCheck?.generations_used,
      monthly_limit: limitCheck?.monthly_limit,
      remaining: limitCheck?.remaining
    });

    if (!limitCheck || !limitCheck.can_generate) {
      console.warn(`[BUILDER][${requestId}] ⚠️ Limite mensal atingido`);
      return new Response(
        JSON.stringify({ error: "Limite mensal atingido" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER][${requestId}] ✅ Limite OK: ${limitCheck.remaining} gerações restantes`);


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

    const systemPrompt = `🎯 VOCÊ É O RAFAEL MILAGRE - ESPECIALISTA EM AUTOMAÇÃO NO-CODE

📦 FERRAMENTAS DISPONÍVEIS NA PLATAFORMA (USE NOMES EXATOS):
${toolsContext}

⚠️ REGRA CRÍTICA: COPIE E COLE nomes EXATOS da lista acima. NÃO reformate ou invente variações.

🚀 FILOSOFIA CORE: "NÃO PROGRAMAR, CONFIGURAR"
- ✅ Conectar ferramentas visuais (Make, N8N, ManyChat)
- ✅ Configurar módulos drag-and-drop
- ✅ APIs via interface gráfica
- ❌ NUNCA mencionar: código, SQL, TypeScript, React, Edge Functions, programação

🎯 PÚBLICO-ALVO:
Empreendedores e gestores SEM conhecimento técnico que querem automatizar processos usando ferramentas visuais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔥 FRAMEWORK RAFAEL MILAGRE - 4 PILARES NO-CODE

### 1️⃣ AUTOMAÇÃO VISUAL (Prioridade #1)

**HIERARQUIA OBRIGATÓRIA:**
1. **Make.com** (PRIMEIRA ESCOLHA - automação principal):
   - Conecta qualquer API/sistema via módulos visuais
   - Processa dados com lógica visual (routers, filters)
   - Webhooks para receber/enviar dados
   - Transforma dados sem código
   
2. **N8N** (alternativa open-source):
   - Self-hosted, mesmas capacidades do Make
   - Quando precisa privacidade total dos dados
   
3. **ManyChat** (chatbots WhatsApp/Instagram):
   - Fluxos conversacionais visuais
   - Captura dados e envia para Make via webhook
   
4. **Typebot** (chatbots web):
   - Formulários interativos em sites
   - Integra com Make via webhook
   
5. **Lovable** (APENAS quando precisa dashboard web):
   - Interface para visualizar dados
   - Painéis administrativos
   - Backend via Lovable Cloud (mas priorize Sheets/Airtable)

**LINGUAGEM CORRETA:**
✅ "Configure cenário Make: adicione módulo WhatsApp → conecte com módulo OpenAI → salve em Google Sheets"
❌ "Desenvolva API REST", "Crie edge function", "Programe webhook handler"

### 2️⃣ INTELIGÊNCIA ARTIFICIAL (Via APIs Comerciais)

**COMO USAR IA SEM CÓDIGO:**
- Make tem módulo HTTP para chamar qualquer API de IA
- Basta configurar URL, headers, body JSON visualmente
- Não precisa programar NADA

**MODELOS DISPONÍVEIS (via Make/N8N):**
- **GPT-5** (OpenAI): Análise texto, conversas, resumos
- **Gemini 2.5** (Google): Multimodal (texto+imagem), contexto longo
- **Claude Sonnet** (Anthropic): Raciocínio complexo
- **Grok** (xAI): Dados em tempo real

**FERRAMENTAS PRONTAS (uso direto sem integração):**
- **ChatGPT web**: Time usa manualmente para rascunhar
- **Claude web**: Análise de documentos
- **Manus**: Tarefas específicas

**INTEGRAÇÃO VISUAL:**
1. Make módulo "HTTP > Make a Request"
2. URL: https://api.openai.com/v1/chat/completions
3. Headers: {"Authorization": "Bearer SEU_TOKEN"}
4. Body: JSON com prompt
5. Parse resposta e use em próximo módulo

**CUSTOS TÍPICOS:**
- GPT-5: ~$0.03/1k tokens (~$3 para 100 análises)
- Gemini Flash: ~$0.01/1k tokens (~$1 para 100 análises)
- Cache respostas comuns em Sheets = economia 60-70%

### 3️⃣ ARMAZENAMENTO DE DADOS (Lovable Cloud = Supabase integrado)

**HIERARQUIA PARA LOVABLE:**

1. **Lovable Cloud (Supabase PostgreSQL)** - PRIMEIRA ESCOLHA:
   - Banco de dados relacional completo incluído no Lovable
   - Ideal para aplicações web com autenticação, CRUD, relações entre tabelas
   - Escalável até milhões de registros
   - RLS (Row Level Security) nativo para segurança
   - Queries SQL otimizadas
   - Integração automática com React Query
   - **Use quando**: precisa persistir dados, múltiplos usuários, autenticação, relações complexas

2. **Lovable Storage (Supabase Storage)** - PARA ARQUIVOS:
   - Armazenamento de imagens, PDFs, vídeos
   - Integrado com Lovable Cloud
   - Buckets públicos e privados
   - **Use quando**: precisa upload/download de arquivos

3. **APIs Externas (quando necessário)**:
   - Google Sheets via API: apenas para integração com planilhas existentes
   - Airtable: quando cliente já usa e precisa sincronizar
   - Outros: quando integração externa é requisito de negócio

**PADRÃO LOVABLE:**
Frontend (React) ↔ Supabase Client ↔ Database/Storage ↔ Edge Functions (quando necessário) ↔ APIs externas

### 4️⃣ INTERFACES E INTEGRAÇÕES (Como usuário interage)

**PRIORIZAR LOVABLE PARA INTERFACES WEB:**

**TIPOS DE INTERFACE:**
1. **Dashboard Web (Lovable)** - PRIMEIRA OPÇÃO:
   - Aplicação React completa com autenticação
   - Painel administrativo para gestão de dados
   - Visualização de métricas e relatórios
   - CRUD completo (Create, Read, Update, Delete)
   - Responsivo (desktop + mobile)
   - Tema claro/escuro
   - **Use quando**: precisa interface web para usuários internos ou externos

2. **WhatsApp Business API** - PARA ATENDIMENTO:
   - Integração via webhooks (Edge Functions)
   - Recebe e envia mensagens programaticamente
   - Armazena histórico no Lovable Cloud
   - Dashboard Lovable para gerenciar conversas
   - **Use quando**: atendimento ao cliente, notificações, automação de conversas

3. **APIs de Terceiros**:
   - Integrações via Edge Functions (backend seguro)
   - Exemplos: Stripe (pagamentos), Resend (emails), OpenAI (IA)
   - Credenciais armazenadas em Secrets (Lovable Cloud)
   - **Use quando**: funcionalidade externa é necessária

4. **Automações (Make/N8N)** - APENAS QUANDO NECESSÁRIO:
   - Para conectar sistemas legados que não têm API REST
   - Sincronizações agendadas com sistemas externos
   - **Use quando**: Lovable Edge Functions não são suficientes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 FOCO: GERAR SOLUÇÕES LOVABLE EXECUTÁVEIS

**LINGUAGEM TÉCNICA CORRETA:**
- ✅ "Criar componentes React para dashboard administrativo"
- ✅ "Implementar autenticação com Supabase Auth"
- ✅ "Estruturar banco de dados com tabelas X, Y, Z"
- ✅ "Edge Functions para integrar com API externa"
- ✅ "Lovable AI (Gemini Flash) para análise de sentimento"
- ✅ "RLS policies para segurança multi-tenant"
- ✅ "React Query para cache e sincronização"
- ✅ "Shadcn/UI components com Tailwind CSS"

**QUANDO MENCIONAR NO-CODE:**
- ✅ Use Make/N8N APENAS quando cliente já usa ou quando precisa conectar sistemas legados
- ✅ Priorize SEMPRE Lovable Cloud + Edge Functions para lógica de backend
- ✅ Se precisar automação externa, explique POR QUE Edge Functions não bastam

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📐 INSTRUÇÕES PARA DIAGRAMAS MERMAID:

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
    "quadrant1_frontend": {
      "title": "🎨 Frontend (Lovable React)",
      "description": "Interface web construída com React, TypeScript, Tailwind CSS e Shadcn/UI",
      "items": [
        "COMPONENTES PRINCIPAIS: [liste 3-5 componentes React principais - ex: 'DashboardLayout (sidebar + header)', 'TicketList (grid de tickets)', 'TicketDetailModal (visualização completa)', 'ChatInterface (histórico de mensagens)', 'FilterBar (filtros de status/prioridade)']",
        "PÁGINAS/ROTAS: [liste rotas principais - ex: '/dashboard (home)', '/tickets (lista)', '/tickets/:id (detalhe)', '/settings (configurações)', '/login (autenticação)']",
        "ESTADOS E DADOS: [como gerenciar dados - ex: 'React Query para cache de tickets', 'Zustand para estado global (user, theme)', 'Real-time subscriptions Supabase para novos tickets']",
        "UI/UX: [detalhes visuais - ex: 'Design moderno com cards glassmorphism', 'Animações Framer Motion', 'Loading skeletons', 'Toast notifications', 'Tema dark/light com next-themes']",
        "RESPONSIVIDADE: [como adaptar - ex: 'Mobile-first com Tailwind breakpoints', 'Sidebar colapsável em mobile', 'Tabelas viram cards em mobile']"
      ],
      "tool_names": ["React", "TypeScript", "Tailwind CSS", "Shadcn/UI", "React Query", "Zustand", "Framer Motion"],
      "integration_details": "FLUXO DE DADOS: Como o frontend se comunica com backend. Ex: 'Componente TicketList → useQuery hook → Supabase client.from(tickets).select() → cache em React Query → re-fetch a cada 30s ou ao receber evento real-time'"
    },
    "quadrant2_backend": {
      "title": "⚙️ Backend (Lovable Cloud)",
      "description": "Banco de dados, autenticação, storage e edge functions via Supabase integrado",
      "items": [
        "DATABASE SCHEMA: [estrutura de tabelas - ex: 'tickets (id, customer_name, status, priority, created_at)', 'messages (id, ticket_id, content, sender_type, sent_at)', 'profiles (id, user_id, full_name, role, avatar_url)']",
        "AUTENTICAÇÃO: [tipo de auth - ex: 'Supabase Auth com email/senha', 'Login social (Google OAuth)', 'Magic links', 'RLS policies por role (admin/agent/customer)']",
        "EDGE FUNCTIONS: [funções serverless - ex: 'receive-whatsapp-webhook (POST /whatsapp)', 'classify-ticket-priority (chamada interna)', 'send-email-notification (via Resend API)', 'generate-report (scheduled daily)']",
        "STORAGE: [buckets e arquivos - ex: 'avatars (público)', 'ticket-attachments (privado com RLS)', 'reports (privado admin-only)']",
        "REAL-TIME: [subscriptions - ex: 'Supabase real-time subscription em tickets para atualizar dashboard ao vivo', 'Broadcast para notificar agentes online']"
      ],
      "tool_names": ["Supabase PostgreSQL", "Supabase Auth", "Edge Functions", "Supabase Storage", "Supabase Realtime"],
      "backend_strategy": "ARQUITETURA BACKEND DETALHADA:\n\n🗄️ DATABASE:\n- Tabelas com relações (foreign keys)\n- Indexes para queries otimizadas (ex: index em tickets.status para filtros)\n- Triggers para updated_at automático\n- RLS policies granulares (ex: agentes só veem tickets assigned_to = auth.uid())\n\n🔐 SEGURANÇA:\n- Row Level Security (RLS) em TODAS as tabelas\n- Policies separadas para SELECT, INSERT, UPDATE, DELETE\n- API keys em Secrets (Lovable Cloud)\n- Validação de dados no Edge Functions\n\n⚡ EDGE FUNCTIONS:\n- Criadas em /supabase/functions/nome-funcao/index.ts\n- Deploy automático ao fazer commit\n- CORS configurado para chamadas do frontend\n- Error handling robusto com try/catch\n- Logs estruturados para debugging\n\n💾 CUSTOS:\n- Lovable Cloud free tier: 500MB database, 1GB storage, 500k edge function invocations/mês\n- Escalável até milhões de registros sem mudar código"
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
    
    if (!lovableAIKey) {
      console.error(`[BUILDER][${requestId}] ❌ LOVABLE_API_KEY não configurada!`);
      throw new Error("LOVABLE_API_KEY não está configurada no ambiente");
    }
    
    console.log(`[BUILDER][${requestId}] ✅ LOVABLE_API_KEY encontrada (${lovableAIKey.substring(0, 8)}...)`);

    const aiCallStart = Date.now();

    // Definir tool definition baseado no modo
    let toolDefinition: any;
    
    if (mode === "quick") {
      // MODO QUICK: Gera capa + ferramentas essenciais - 5-10s
      toolDefinition = {
        type: "function",
        function: {
          name: "create_quick_solution",
          description: "Criar capa da solução com título, descrição, tags e ferramentas essenciais",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Título SINTÉTICO e PROFISSIONAL (OBRIGATÓRIO: 20-60 chars). NUNCA copie literalmente. NUNCA truncar no meio de palavra. NUNCA começar com verbos (Criar, Implementar, Fazer). EXTRAIA essência. Formato: [Tecnologia] + [Resultado]. PROIBIDO: undefined, null, vazio, cópia literal da ideia, verbos infinitivos, truncamento." },
              short_description: { type: "string", description: "Descrição objetiva em 3-5 frases sobre O QUE é e COMO funciona" },
              tags: { type: "array", items: { type: "string" }, description: "3-5 tags relevantes (ex: IA Generativa, Automação, WhatsApp)" },
              required_tools: {
                type: "object",
                description: "Ferramentas essenciais e opcionais necessárias",
                properties: {
                  essential: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome EXATO da ferramenta da lista de ferramentas cadastradas" },
                        reason: { type: "string", description: "Por que essa ferramenta é essencial (1-2 frases)" },
                        setup_complexity: { type: "string", enum: ["easy", "medium", "hard"] },
                        cost_estimate: { type: "string" }
                      },
                      required: ["name", "reason", "setup_complexity", "cost_estimate"]
                    }
                  },
                  optional: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome EXATO da ferramenta da lista de ferramentas cadastradas" },
                        reason: { type: "string" },
                        setup_complexity: { type: "string", enum: ["easy", "medium", "hard"] },
                        cost_estimate: { type: "string" }
                      },
                      required: ["name", "reason", "setup_complexity", "cost_estimate"]
                    }
                  }
                },
                required: ["essential", "optional"]
              }
            },
            required: ["title", "short_description", "tags", "required_tools"]
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
              title: { type: "string", description: "Título SINTÉTICO, PROFISSIONAL e COMPLETO (OBRIGATÓRIO: 20-60 chars). NUNCA truncar no meio de palavra. NUNCA copiar ideia literalmente." },
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
    console.log(`[BUILDER][${requestId}] 🚀 Iniciando chamada para Lovable AI Gateway...`);
    console.log(`[BUILDER][${requestId}] ⏱️ Timeout configurado: ${mode === "quick" ? 60 : 180}s`);
    
    let aiResponse;
    try {
      aiResponse = await fetch(lovableAIUrl, {
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
      
      console.log(`[BUILDER][${requestId}] ✅ Resposta recebida da AI (status: ${aiResponse.status})`);
    } catch (fetchError: any) {
      console.error(`[BUILDER][${requestId}] ❌ Erro na chamada fetch:`, {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause
      });
      
      if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
        console.error(`[BUILDER][${requestId}] ⏱️ TIMEOUT na chamada AI (limite: ${mode === "quick" ? 60 : 180}s)`);
        throw new Error('TIMEOUT: A geração está demorando muito. Tente novamente.');
      }
      
      throw new Error(`Erro ao chamar Lovable AI: ${fetchError.message}`);
    }

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

    let aiData;
    try {
      console.log(`[BUILDER][${requestId}] 📥 Fazendo parse do JSON da resposta...`);
      aiData = await aiResponse.json();
      console.log(`[BUILDER][${requestId}] ✅ JSON parsed com sucesso`);
    } catch (jsonError: any) {
      console.error(`[BUILDER][${requestId}] ❌ Erro ao fazer parse do JSON:`, jsonError);
      throw new Error('Erro ao processar resposta da IA');
    }
    
    const aiResponseTime = Date.now() - aiCallStart;

    console.log(`[BUILDER][${requestId}] ⚡ Tempo de resposta: ${(aiResponseTime / 1000).toFixed(1)}s`);
    console.log(`[BUILDER][${requestId}] 📊 Tokens: ${aiData.usage?.total_tokens || 'N/A'}`);

    // Extrair dados do tool_calls (não content)
    const message = aiData.choices?.[0]?.message;
    if (!message || !message.tool_calls?.[0]) {
      console.error(`[BUILDER][${requestId}] ❌ Resposta não contém tool_calls`);
      console.error(`[BUILDER][${requestId}] 📋 Estrutura da resposta:`, JSON.stringify(aiData, null, 2).substring(0, 500));
      throw new Error("Resposta inválida da IA");
    }

    let solutionData;
    try {
      console.log(`[BUILDER][${requestId}] 🔍 Extraindo tool call arguments...`);
      const toolCall = message.tool_calls[0];
      console.log(`[BUILDER][${requestId}] 📦 Tool call encontrado: ${toolCall.function.name}`);
      
      solutionData = JSON.parse(toolCall.function.arguments);
      console.log(`[BUILDER][${requestId}] ✅ Arguments parsed com sucesso`);
    } catch (parseError: any) {
      console.error(`[BUILDER][${requestId}] ❌ Erro ao fazer parse do JSON:`, {
        error: parseError.message,
        toolCall: message.tool_calls?.[0]
      });
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

    // ========== 🔧 VALIDAÇÃO E FILTRO DE FERRAMENTAS ==========
    const validateAndFilterTools = async (requiredTools: any): Promise<any> => {
      if (!requiredTools) return null;
      
      console.log('[BUILDER-TOOLS] 🔍 Iniciando validação de ferramentas...');
      
      const validateToolsList = async (toolsList: any[], category: 'essential' | 'optional') => {
        if (!toolsList || !Array.isArray(toolsList)) return [];
        
        console.log(`[BUILDER-TOOLS] 📋 Validando ${toolsList.length} ferramentas ${category}...`);
        
        const validatedTools = [];
        const invalidTools = [];
        
        for (const tool of toolsList) {
          const suggestedName = tool.name?.trim();
          if (!suggestedName) {
            console.warn('[BUILDER-TOOLS] ⚠️ Ferramenta sem nome, ignorando');
            continue;
          }
          
          // Buscar ferramenta cadastrada (case-insensitive, fuzzy match)
          const { data: matchedTools, error } = await supabase
            .from('tools')
            .select('*')
            .eq('status', true)
            .or(`name.ilike.%${suggestedName}%,name.ilike.%${suggestedName.replace(/\s+/g, '%')}%`);
          
          if (error) {
            console.error('[BUILDER-TOOLS] ❌ Erro ao buscar ferramenta:', error);
            continue;
          }
          
          if (matchedTools && matchedTools.length > 0) {
            // Usar a primeira correspondência (melhor match)
            const matchedTool = matchedTools[0];
            
            validatedTools.push({
              ...tool,
              name: matchedTool.name, // Nome EXATO da plataforma
              logo_url: matchedTool.logo_url,
              category: matchedTool.category,
              official_url: matchedTool.official_url
            });
            
            console.log(`[BUILDER-TOOLS] ✅ ${category}: "${suggestedName}" → "${matchedTool.name}" (VALIDADO)`);
          } else {
            invalidTools.push(suggestedName);
            console.warn(`[BUILDER-TOOLS] ❌ ${category}: "${suggestedName}" NÃO ENCONTRADO na plataforma (ignorado)`);
          }
        }
        
        if (invalidTools.length > 0) {
          console.warn(`[BUILDER-TOOLS] ⚠️ Total de ferramentas ${category} ignoradas: ${invalidTools.length}`);
          console.warn(`[BUILDER-TOOLS] 📝 Ferramentas não encontradas: ${invalidTools.join(', ')}`);
        }
        
        console.log(`[BUILDER-TOOLS] ✅ ${category}: ${validatedTools.length}/${toolsList.length} ferramentas validadas`);
        return validatedTools;
      };
      
      const validatedEssential = await validateToolsList(requiredTools.essential || [], 'essential');
      const validatedOptional = await validateToolsList(requiredTools.optional || [], 'optional');
      
      const totalSuggested = (requiredTools.essential?.length || 0) + (requiredTools.optional?.length || 0);
      const totalValidated = validatedEssential.length + validatedOptional.length;
      const matchRate = totalSuggested > 0 ? Math.round((totalValidated / totalSuggested) * 100) : 0;
      
      console.log(`[BUILDER-TOOLS] 📊 RESUMO: ${totalValidated}/${totalSuggested} ferramentas validadas (${matchRate}%)`);
      
      if (matchRate < 50) {
        console.error(`[BUILDER-TOOLS] 🚨 ATENÇÃO: Taxa de correspondência muito baixa (${matchRate}%) - IA ignorando instruções!`);
      }
      
      return {
        essential: validatedEssential,
        optional: validatedOptional
      };
    };
    
    // Aplicar validação se houver ferramentas
    if (solutionData.required_tools) {
      console.log('[BUILDER-TOOLS] 🔧 Aplicando validação de ferramentas...');
      solutionData.required_tools = await validateAndFilterTools(solutionData.required_tools);
      console.log('[BUILDER-TOOLS] ✅ Validação concluída');
    }

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

    // Campos opcionais (mode complete = todos os campos, mode quick = apenas required_tools)
    if (mode === "complete") {
      insertData.mind_map = solutionData.mind_map;
      insertData.required_tools = solutionData.required_tools;
      insertData.implementation_checklist = solutionData.implementation_checklist;
      insertData.architecture_flowchart = solutionData.architecture_flowchart;
      insertData.data_flow_diagram = solutionData.data_flow_diagram;
      insertData.user_journey_map = solutionData.user_journey_map;
      insertData.technical_stack_diagram = solutionData.technical_stack_diagram;
      insertData.lovable_prompt = solutionData.lovable_prompt;
    } else if (mode === "quick") {
      // Modo quick agora salva ferramentas também
      insertData.required_tools = solutionData.required_tools;
      console.log(`[BUILDER] ⚡ MODO QUICK: Salvando ferramentas validadas`);
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

    // Incrementar contador COM TRATAMENTO DE ERRO
    console.log(`[BUILDER][${requestId}] 🔢 Incrementando contador de uso...`);
    const { error: incrementError } = await supabase.rpc("increment_ai_solution_usage", { p_user_id: userId });
    
    if (incrementError) {
      console.error(`[BUILDER][${requestId}] ❌ Erro ao incrementar contador:`, {
        message: incrementError.message,
        code: incrementError.code,
        details: incrementError.details
      });
      // NÃO falhar a requisição se só o contador falhou - solução já foi salva!
      console.warn(`[BUILDER][${requestId}] ⚠️ Continuando mesmo com erro no contador...`);
    } else {
      console.log(`[BUILDER][${requestId}] ✅ Contador incrementado com sucesso`);
    }

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
    
    // 🚀 GERAR PROMPT LOVABLE OTIMIZADO EM BACKGROUND (NÃO BLOQUEIA RESPOSTA)
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.warn(`[BUILDER][${requestId}] ⚠️ LOVABLE_API_KEY não configurada, pulando geração de prompt`);
    } else if (savedSolution?.id && mode === "complete") {
      console.log(`[BUILDER][${requestId}] 🚀 Iniciando geração de Prompt Lovable em BACKGROUND`);
      
      EdgeRuntime.waitUntil(
        generateLovablePromptAsync(
          savedSolution.id,
          solutionData,
          idea,
          requestId,
          supabase,
          lovableApiKey
        ).catch(err => {
          console.error(`[BUILDER-ASYNC][${requestId}] ❌ Erro background Prompt Lovable:`, err);
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
