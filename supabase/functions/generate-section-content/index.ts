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
      systemPrompt = `Você é um gerente de projetos especializado em criar checklists executáveis.

Crie um checklist COMPLETO com 15-30 steps sequenciais.

Cada step deve incluir:
- step_number, title, description (tipo tutorial com 10+ frases)
- estimated_time, difficulty, dependencies
- validation_criteria (4+ critérios testáveis)
- common_pitfalls (5+ erros comuns)
- resources (URLs de tutoriais/docs)

Organize por fases: Setup, Desenvolvimento, Testes, Deploy.

Retorne JSON:
{
  "implementation_checklist": [...]
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
      contextualInfo += '\n\n🏗️ FRAMEWORK JÁ MAPEADO:\n';
      const fw = solution.framework_mapping;
      Object.keys(fw).forEach(key => {
        if (fw[key]?.title) {
          contextualInfo += `- ${fw[key].title}: ${fw[key].tool_names?.join(', ') || 'N/A'}\n`;
        }
      });
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
      const unifiedItems = parsedContent.implementation_checklist.map((step: any, index: number) => ({
        id: `step-${step.step_number || index + 1}`,
        title: step.title,
        description: step.description,
        completed: false,
        column: 'todo',
        order: index,
        notes: '',
        metadata: {
          step_number: step.step_number,
          estimated_time: step.estimated_time,
          difficulty: step.difficulty,
          dependencies: step.dependencies,
          validation_criteria: step.validation_criteria,
          common_pitfalls: step.common_pitfalls,
          resources: step.resources
        }
      }));
      
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