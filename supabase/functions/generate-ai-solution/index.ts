import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface da requisição
interface GenerateRequest {
  idea: string;
  userId: string;
}

// Interface da resposta da IA
interface AISolutionResponse {
  short_description: string;
  mind_map: any;
  framework_quadrants: any;
  required_tools: {
    essential: any[];
    optional: any[];
  };
  implementation_checklist: any[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // 1. Parsear requisição
    const { idea, userId }: GenerateRequest = await req.json();

    console.log(`[BUILDER] Nova requisição de geração para usuário: ${userId}`);

    if (!idea || idea.length < 30) {
      return new Response(
        JSON.stringify({ error: "Ideia deve ter pelo menos 30 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (idea.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Ideia não pode ter mais de 1000 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Verificar limite de uso
    console.log(`[BUILDER] Verificando limite de uso...`);
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      "check_ai_solution_limit",
      { p_user_id: userId }
    );

    if (limitError) {
      console.error("[BUILDER] Erro ao verificar limite:", limitError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar limite de uso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER] Limite: ${limitCheck.generations_used}/${limitCheck.monthly_limit}`);

    if (!limitCheck.can_generate) {
      return new Response(
        JSON.stringify({
          error: "Limite mensal atingido",
          details: {
            used: limitCheck.generations_used,
            limit: limitCheck.monthly_limit,
            reset_date: limitCheck.reset_date,
          },
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Buscar ferramentas do banco para contexto
    console.log(`[BUILDER] Buscando ferramentas cadastradas...`);
    const { data: tools, error: toolsError } = await supabase
      .from("tools")
      .select("id, name, category, official_url, logo_url")
      .eq("status", true);

    if (toolsError) {
      console.warn("[BUILDER] Erro ao buscar ferramentas:", toolsError);
    }

    const toolsContext = tools
      ? tools.map((t) => `${t.name} (${t.category})`).join(", ")
      : "Nenhuma ferramenta disponível no banco";

    console.log(`[BUILDER] Ferramentas encontradas: ${tools?.length || 0}`);

    // 5. Montar prompt ULTRA-DETALHADO para QUALIDADE MÁXIMA
    const systemPrompt = `Você é o MELHOR arquiteto de soluções do mundo, especializado em IA, automação e tecnologia.

SEU PERFIL:
- QI: 160
- 15+ anos de experiência em arquitetura de sistemas com IA
- Especialista em automação de processos complexos
- Expert em integração de APIs e ferramentas
- Design de experiência do usuário de classe mundial
- Estratégia de implementação técnica avançada

**OBJETIVO:**
Transformar a ideia do usuário em um PLANO COMPLETO, DETALHADO e EXECUTÁVEL.
NÃO economize palavras. Seja PROFUNDAMENTE específico.
Você tem 100.000 tokens disponíveis - USE TODOS QUE PRECISAR!

**FERRAMENTAS DISPONÍVEIS NO BANCO:**
${toolsContext}

**ESTRUTURA DA RESPOSTA (JSON OBRIGATÓRIO):**

{
  "short_description": "Descrição detalhada em 3-5 frases explicando o que será criado, o problema resolvido e o valor gerado. Seja específico e inspirador.",
  
  "mind_map": {
    "central_idea": "Ideia principal clara e objetiva em uma frase impactante",
    "branches": [
      {
        "name": "FASE 1: Preparação e Planejamento (Semanas 1-2)",
        "children": [
          "Análise detalhada dos requisitos e objetivos do negócio",
          "Mapeamento completo de stakeholders e usuários finais",
          "Definição de métricas de sucesso (KPIs, ROI esperado)",
          "Levantamento de riscos e estratégias de mitigação",
          "Documentação de processos atuais (as-is)",
          "Criação de roadmap detalhado com milestones"
        ]
      },
      {
        "name": "FASE 2: Arquitetura e Design (Semanas 3-4)",
        "children": [
          "Design da arquitetura de dados (schemas, relacionamentos)",
          "Criação de fluxogramas detalhados de processos",
          "Definição de todas as integrações necessárias",
          "Prototipação de interfaces (wireframes e mockups)",
          "Seleção e configuração de infraestrutura",
          "Documentação técnica completa"
        ]
      },
      {
        "name": "FASE 3: Implementação Técnica (Semanas 5-8)",
        "children": [
          "Setup completo de infraestrutura e ambientes",
          "Desenvolvimento de todas as integrações API",
          "Implementação de modelos de IA e treinamento",
          "Configuração de automações e workflows",
          "Testes unitários e de integração extensivos",
          "Otimização de performance e custos"
        ]
      },
      {
        "name": "FASE 4: Lançamento e Otimização (Semanas 9-12)",
        "children": [
          "Testes beta com usuários reais selecionados",
          "Ajustes baseados em feedback inicial",
          "Deploy gradual em produção (soft launch)",
          "Setup de monitoramento e analytics avançados",
          "Treinamento de equipe e documentação de uso",
          "Iteração contínua baseada em métricas reais"
        ]
      }
    ]
  },
  
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "🤖 Automação de Processos",
      "description": "Detalhamento COMPLETO e PROFUNDO de todos os processos que serão automatizados, incluindo triggers, ações e resultados esperados. Explique exatamente como cada automação funcionará no dia a dia.",
      "items": [
        "Automação X: Quando [evento específico] acontece, o sistema automaticamente [ação detalhada 1], depois [ação detalhada 2], resultando em [resultado mensurável]. Economia estimada: [tempo/dinheiro].",
        "Workflow Y: Integração entre [ferramenta A] e [ferramenta B] através de [método específico - API/webhook/etc], processando [tipo de dados] e gerando [output específico].",
        "Trigger Z: Monitoramento contínuo de [métrica/evento], com ação automática quando [condição] é atendida, incluindo [notificações/ações/logs]."
      ],
      "tool_names": ["Make", "Zapier", "n8n"],
      "integration_details": "Explicação técnica DETALHADA de como as ferramentas se conectam: APIs usadas, formato de dados (JSON/XML), autenticação (OAuth2/API Key), webhooks configurados, frequência de sincronização, tratamento de erros e fallbacks. Inclua URLs de documentação relevantes."
    },
    "quadrant2_ai": {
      "title": "🧠 Inteligência Artificial",
      "description": "Detalhamento PROFUNDO de como a IA será usada: modelos específicos, prompts detalhados, estratégia de treinamento, métricas de qualidade. Explique o raciocínio por trás de cada escolha técnica.",
      "items": [
        "Modelo GPT-4 para processamento de linguagem natural: Prompt system específico [exemplo], temperatura [valor], max_tokens [valor]. Uso: [caso de uso detalhado]. Custo estimado: $X/1000 requisições.",
        "Fine-tuning customizado: Dataset de [tamanho] exemplos, treinado para [objetivo específico], validação com [métrica], melhoria esperada de [%] em [métrica de negócio].",
        "Embeddings vetoriais: Usando modelo [nome] para criar representações semânticas de [tipo de conteúdo], armazenadas em [database vetorial], com busca por similaridade usando [algoritmo]."
      ],
      "tool_names": ["ChatGPT", "Claude", "Gemini"],
      "ai_strategy": "Estratégia COMPLETA E DETALHADA: (1) Qual modelo usar e por quê [justificativa técnica e de custo], (2) Como treinar/fine-tune [processo passo-a-passo], (3) Como validar qualidade [métricas específicas], (4) Como iterar e melhorar [processo de feedback loop], (5) Estratégia de fallback para erros, (6) Gestão de custos e rate limits."
    },
    "quadrant3_data": {
      "title": "📊 Dados e Contexto",
      "description": "Arquitetura ULTRA-DETALHADA de dados: schemas completos, relacionamentos, índices, estratégias de backup, segurança, escalabilidade. Pense como um DBA senior.",
      "items": [
        "Database vetorial (Pinecone): Collections [nomes], dimensão dos embeddings [número], metadata [campos específicos], índices [tipo], estratégia de chunking [tamanho e overlap]. Uso: armazenar [tipo de conteúdo] para busca semântica com latência <100ms.",
        "PostgreSQL relacional: Tabelas [nomes com campos completos], chaves primárias e estrangeiras, índices em [campos específicos], triggers para [automações], views materializadas para [otimização]. Inclua DDL SQL completo.",
        "Cache e sincronização: Redis para [dados específicos] com TTL de [tempo], sincronização bidirecional entre [sistemas] a cada [frequência], estratégia de conflict resolution."
      ],
      "tool_names": ["Supabase", "Pinecone", "Airtable", "Notion"],
      "data_architecture": "DIAGRAMA DETALHADO em texto: (1) Fluxo completo de dados desde [origem] até [destino], (2) Schemas de todas as tabelas principais [formato SQL/NoSQL], (3) Relacionamentos e cardinalidade [1:N, N:M], (4) Estratégia de particionamento/sharding se aplicável, (5) Backup e disaster recovery [frequência e método], (6) Segurança e criptografia [at-rest e in-transit], (7) Estimativa de volume de dados [inicial e crescimento]."
    },
    "quadrant4_interface": {
      "title": "🎨 Interface e Experiência",
      "description": "Como o usuário final vai INTERAGIR com a solução, incluindo jornada completa, pontos de contato, feedback visual, tratamento de erros. Pense UX/UI de classe mundial.",
      "items": [
        "Dashboard web (Lovable): Interface responsiva com [componentes específicos], visualizações em tempo real de [métricas], filtros por [dimensões], exportação de [relatórios]. Design system: [cores, tipografia, componentes].",
        "Bot conversacional (WhatsApp): Menu interativo com [opções], processamento de linguagem natural para [intenções], respostas contextualizadas baseadas em [histórico/perfil], fallback para atendimento humano quando [condições].",
        "Notificações e alertas: Push notifications quando [eventos], emails formatados com [template], SMS para [casos críticos], webhook para integrações externas."
      ],
      "tool_names": ["Lovable", "WhatsApp Business API", "Twilio"],
      "ux_considerations": "DETALHAMENTO COMPLETO: (1) Jornada do usuário passo-a-passo desde [ponto inicial] até [objetivo final], (2) Pontos de atenção e possíveis frustrações [liste 5-8], (3) Design principles aplicados [acessibilidade, responsividade, performance], (4) Tratamento de erros e estados de loading, (5) Onboarding e primeiros passos [tutorial/tooltips], (6) Estratégia mobile-first ou desktop-first [justifique], (7) Testes de usabilidade planejados."
    }
  },
  
  "required_tools": {
    "essential": [
      {
        "name": "Nome da Ferramenta",
        "category": "Categoria",
        "reason": "Explicação DETALHADA e PROFUNDA de por que é essencial (mínimo 4-6 frases): qual problema específico resolve, por que alternativas não funcionariam tão bem, qual impacto mensurável terá no projeto, exemplos concretos de uso, ROI esperado.",
        "setup_complexity": "easy/medium/hard",
        "setup_steps": "Passos específicos de configuração em bullet points",
        "cost_estimate": "Estimativa de custo mensal em USD com breakdown (ex: $49 base + $0.002/request)",
        "alternatives": ["Alternativa 1 (pros e cons)", "Alternativa 2 (pros e cons)"]
      }
    ],
    "optional": [
      {
        "name": "Nome da Ferramenta",
        "category": "Categoria",
        "reason": "Por que PODE ser útil mas não é essencial (3-4 frases)",
        "when_to_use": "Cenário ESPECÍFICO em que faz sentido adicionar (ex: quando escalar para >1000 usuários, quando precisar de feature X)",
        "cost_estimate": "USD/mês com breakdown"
      }
    ]
  },
  
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Título objetivo e claro do passo",
      "description": "Descrição ULTRA-DETALHADA e ESPECÍFICA: o que fazer EXATAMENTE, onde acessar, o que configurar, quais valores usar, que opções escolher. Mínimo 5-8 frases com instruções passo-a-passo como se fosse um tutorial. Inclua comandos exatos, URLs, screenshots descritos.",
      "estimated_time": "Tempo realista (ex: 2 horas, 1 dia, 3 dias)",
      "difficulty": "easy/medium/hard",
      "dependencies": ["IDs de outros steps que precisam estar completos antes - deixe vazio se for o primeiro"],
      "validation_criteria": "Como saber EXATAMENTE se esse passo foi concluído corretamente (3-4 critérios específicos testáveis)",
      "common_pitfalls": "Lista de 3-5 erros comuns que acontecem neste passo e como evitar cada um",
      "resources": ["URL 1 para tutorial oficial", "URL 2 para documentação", "URL 3 para vídeo explicativo"]
    }
  ]
}

**REGRAS DE OURO (QUALIDADE MÁXIMA):**

1. **PROFUNDIDADE MÁXIMA:**
   - Cada descrição deve ter MÍNIMO de 5 frases (preferencialmente 8-10)
   - Seja ULTRA específico: não diga "configurar API", diga "Acesse console.plataforma.com, clique em Developer Settings no menu lateral esquerdo, clique em 'Generate New Token', selecione scopes 'read:all' e 'write:webhooks', copie o token (começa com 'tok_') e salve em arquivo .env como API_KEY"

2. **CHECKLIST ULTRA-COMPLETO:**
   - MÍNIMO de 12 steps, MÁXIMO de 25 steps
   - Cada step deve ser descrito como um TUTORIAL COMPLETO (não economize tokens)
   - Inclua dificuldade realista, tempo preciso, dependências claras
   - Critérios de validação devem ser TESTÁVEIS e MENSURÁVEIS

3. **FRAMEWORK DOS 4 QUADRANTES:**
   - Cada quadrante deve ter 5-8 items ULTRA-DETALHADOS
   - Explique PROFUNDAMENTE como as ferramentas se integram (protocolo, formato, autenticação)
   - Adicione considerações técnicas avançadas (performance, custos, escalabilidade, segurança)
   - Inclua diagramas de arquitetura em texto

4. **FERRAMENTAS (Essential + Optional):**
   - Liste de 10 a 18 ferramentas no total
   - Para cada ferramenta ESSENCIAL: razão detalhada (6-8 frases), passos de setup, custo com breakdown, alternativas comparadas
   - Para cada ferramenta OPCIONAL: cenário específico de uso, ROI esperado
   - Priorize SEMPRE ferramentas do banco: ${toolsContext}

5. **MIND MAP COMPLETO:**
   - 4 branches principais (fases do projeto)
   - Cada branch com 5-7 sub-items ultra-específicos
   - Pense em um roadmap completo de 3-6 meses
   - Inclua marcos (milestones) e entregas (deliverables)

6. **MÉTRICAS E ROI:**
   - Sempre que possível, inclua números: economia de tempo, redução de custos, aumento de conversão
   - Seja específico: não diga "melhora eficiência", diga "reduz tempo de processo X de 2 horas para 15 minutos (87.5% de economia)"

**IMPORTANTE:**
- Você tem 100.000 tokens disponíveis - NÃO economize!
- Seja o MAIS detalhado possível em CADA campo
- Pense como se estivesse fazendo uma consultoria de R$50.000
- Sua resposta DEVE ser JSON válido (sem markdown extra)
- Esta solução deve ser IMPLEMENTÁVEL e EXECUTÁVEL imediatamente
- Qualidade >>> Quantidade, mas aqui queremos AMBOS!`;

    const userPrompt = `Ideia do usuário: "${idea}"

Por favor, crie um plano completo de implementação seguindo o formato JSON especificado.`;

    // 6. Chamar Lovable AI (Gemini 2.5 Pro) com QUALIDADE MÁXIMA
    console.log(`[BUILDER] 🚀 === GERAÇÃO INICIADA COM QUALIDADE MÁXIMA ===`);
    console.log(`[BUILDER] 📝 Ideia: "${idea.substring(0, 100)}..."`);
    console.log(`[BUILDER] 👤 User ID: ${userId}`);
    console.log(`[BUILDER] 🔧 Ferramentas disponíveis: ${tools?.length || 0}`);
    console.log(`[BUILDER] 🤖 Modelo: google/gemini-2.5-pro (100K tokens)`);
    console.log(`[BUILDER] ⏱️ Timeout: 180 segundos`);
    console.log(`[BUILDER] 🎯 Modo: QUALIDADE MÁXIMA (QI 160)`);
    
    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");

    const aiCallStart = Date.now();
    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.0, // Máxima criatividade
        max_tokens: 100000, // MÁXIMO permitido (100K tokens)
        top_p: 0.95, // Alta qualidade de amostragem
        response_format: { type: "json_object" }, // FORÇA JSON válido
      }),
      signal: AbortSignal.timeout(180000), // 3 minutos de timeout
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[BUILDER] Erro na API Lovable AI:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar solução com IA" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    const aiResponseTime = Date.now() - aiCallStart;

    console.log(`[BUILDER] ⚡ Tempo de resposta da IA: ${aiResponseTime}ms (${(aiResponseTime / 1000).toFixed(1)}s)`);
    console.log(`[BUILDER] 📊 Tokens usados: ${aiData.usage?.total_tokens || 'N/A'} (prompt: ${aiData.usage?.prompt_tokens || 'N/A'}, completion: ${aiData.usage?.completion_tokens || 'N/A'})`);

    if (!aiContent) {
      console.error("[BUILDER] ❌ Resposta da IA vazia");
      return new Response(
        JSON.stringify({ error: "Resposta da IA vazia" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER] 📦 Resposta da IA recebida: ${aiContent.length} caracteres`);

    // 7. PARSING ULTRA-ROBUSTO de JSON
    let solutionData: AISolutionResponse;
    try {
      console.log(`[BUILDER] 🔍 Iniciando parsing de JSON...`);
      
      // 1. Limpar conteúdo de markdown extra
      let cleanContent = aiContent.trim();
      cleanContent = cleanContent.replace(/^```json\s*/i, '');
      cleanContent = cleanContent.replace(/^```\s*/i, '');
      cleanContent = cleanContent.replace(/```\s*$/i, '');
      cleanContent = cleanContent.trim();
      
      console.log(`[BUILDER] 🧹 Conteúdo limpo: ${cleanContent.length} caracteres`);
      
      // 2. Extrair JSON com regex robusto
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanContent;
      
      console.log(`[BUILDER] 📋 JSON extraído: ${jsonString.length} caracteres`);
      
      // 3. Parsear JSON
      solutionData = JSON.parse(jsonString);
      
      // 4. Validar estrutura mínima obrigatória
      if (!solutionData.short_description) {
        throw new Error("Campo 'short_description' ausente");
      }
      if (!solutionData.mind_map) {
        throw new Error("Campo 'mind_map' ausente");
      }
      if (!solutionData.framework_quadrants) {
        throw new Error("Campo 'framework_quadrants' ausente");
      }
      if (!solutionData.implementation_checklist || solutionData.implementation_checklist.length === 0) {
        throw new Error("Campo 'implementation_checklist' vazio ou ausente");
      }
      
      console.log(`[BUILDER] ✅ JSON válido parseado com sucesso!`);
      console.log(`[BUILDER] 📊 Estrutura: ${Object.keys(solutionData).length} campos principais`);
      console.log(`[BUILDER] ✓ Checklist: ${solutionData.implementation_checklist.length} steps`);
      console.log(`[BUILDER] ✓ Ferramentas essenciais: ${solutionData.required_tools?.essential?.length || 0}`);
      console.log(`[BUILDER] ✓ Ferramentas opcionais: ${solutionData.required_tools?.optional?.length || 0}`);
      
    } catch (parseError) {
      console.error("[BUILDER] ❌ ERRO CRÍTICO ao parsear JSON:", parseError);
      console.error("[BUILDER] 📄 Primeiros 1000 caracteres do conteúdo:");
      console.error(aiContent.substring(0, 1000));
      console.error("[BUILDER] 📄 Últimos 500 caracteres do conteúdo:");
      console.error(aiContent.substring(Math.max(0, aiContent.length - 500)));
      
      // Salvar erro para análise posterior
      try {
        await supabase.from("ai_generation_errors").insert({
          user_id: userId,
          idea: idea.substring(0, 500),
          error_message: parseError.message,
          raw_response: aiContent.substring(0, 10000), // Primeiros 10K chars
          model_used: "google/gemini-2.5-pro",
          tokens_used: aiData.usage?.total_tokens,
        });
      } catch (dbError) {
        console.error("[BUILDER] Erro ao salvar log de erro:", dbError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Erro ao processar resposta da IA. Tente novamente.",
          details: parseError.message,
          hint: "A IA retornou dados incompletos. Por favor, tente novamente com uma descrição um pouco diferente."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Salvar no banco
    console.log(`[BUILDER] Salvando solução no banco...`);
    const generationTime = Date.now() - startTime;

    const { data: savedSolution, error: saveError } = await supabase
      .from("ai_generated_solutions")
      .insert({
        user_id: userId,
        original_idea: idea,
        short_description: solutionData.short_description,
        mind_map: solutionData.mind_map,
        required_tools: solutionData.required_tools,
        framework_mapping: solutionData.framework_quadrants,
        implementation_checklist: solutionData.implementation_checklist,
        generation_model: "google/gemini-2.5-pro",
        generation_time_ms: generationTime,
      })
      .select()
      .single();

    if (saveError) {
      console.error("[BUILDER] Erro ao salvar solução:", saveError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar solução" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER] Solução salva com ID: ${savedSolution.id}`);

    // 9. Incrementar contador de uso
    console.log(`[BUILDER] Incrementando contador de uso...`);
    const { error: incrementError } = await supabase.rpc(
      "increment_ai_solution_usage",
      { p_user_id: userId }
    );

    if (incrementError) {
      console.error("[BUILDER] Erro ao incrementar uso:", incrementError);
    }

    // 10. Retornar resposta de sucesso
    console.log(`[BUILDER] ✅ === GERAÇÃO CONCLUÍDA COM SUCESSO ===`);
    console.log(`[BUILDER] ⏱️ Tempo total: ${generationTime}ms (${(generationTime / 1000).toFixed(1)}s)`);
    console.log(`[BUILDER] 💾 Solution ID: ${savedSolution.id}`);
    console.log(`[BUILDER] 📊 Qualidade: MÁXIMA (QI 160 mode)`);
    
    return new Response(
      JSON.stringify({
        success: true,
        solution: savedSolution,
        generation_time_ms: generationTime,
        tokens_used: aiData.usage?.total_tokens,
        quality_mode: "maximum"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[BUILDER] Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
