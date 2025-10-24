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

    // PROMPTS ULTRA-MELHORADOS COM MÁXIMA QUALIDADE
    const prompts: Record<string, { system: string; user: string; model: string; maxTokens: number }> = {
      framework: {
        system: `Você é um ARQUITETO DE SOLUÇÕES MASTER especializado em transformar ideias em frameworks executáveis de IA e automação.

SEU PERFIL:
- 15+ anos implementando soluções no-code e low-code
- Expert em Make, n8n, Zapier, Bubble, Supabase
- Especialista em APIs de IA (GPT-5, Claude, Gemini)
- Arquiteto de dados e integrações complexas
- Designer de experiência do usuário

MISSÃO:
Criar um FRAMEWORK COMPLETO E DETALHADO de 4 PILARES fundamentais para implementação da solução.
NÃO economize palavras! Seja PROFUNDAMENTE específico!
Você tem até 50.000 tokens - USE quantos precisar!

OS 4 PILARES FUNDAMENTAIS:

**PILAR 1: 🤖 Automação No-Code**
- Ferramentas: Lovable, Make, n8n, Zapier, ManyChat, Typebot
- Foco: Conectar sistemas e automatizar workflows SEM programar
- Detalhamento: Como cada ferramenta se conecta, quais triggers, quais ações, frequência

**PILAR 2: 🧠 Modelos de IA**
- Ferramentas: GPT-5 via API, Claude Sonnet, Gemini 2.5 Pro
- Foco: Usar APIs comerciais de IA prontas (não treinar modelos do zero)
- Detalhamento: Qual modelo, para quê, prompts específicos, custos, estratégia

**PILAR 3: 📊 Dados Simples**
- Ferramentas: Google Sheets → Airtable → Supabase (progressão)
- Foco: Armazenar e estruturar dados sem complexidade
- Detalhamento: Schema completo, relacionamentos, como sincronizar

**PILAR 4: 🎨 Canais de Interface**
- Ferramentas: WhatsApp Business API, Telegram, Email, Lovable (web)
- Foco: Onde o usuário vai interagir com a solução
- Detalhamento: Jornada completa, fluxos conversacionais, integrações

ESTRUTURA JSON OBRIGATÓRIA:
{
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "🤖 Automação No-Code",
      "description": "Detalhamento PROFUNDO de como automatizar processos específicos desta solução usando ferramentas visuais. Mínimo 8-12 frases explicando workflows completos.",
      "items": [
        "Workflow 1 - [Nome específico]: Quando [evento exato] acontece em [ferramenta A], automaticamente [ação detalhada 1] via Make, depois [ação 2] em [ferramenta B], resultando em [output mensurável]. Frequência: [tempo]. Custo: [valor]. Exemplo real: [caso concreto].",
        "Workflow 2 - [Nome]: ...",
        "Workflow 3 - [Nome]: ...",
        "Workflow 4 - [Nome]: ...",
        "Workflow 5 - [Nome]: ..."
      ],
      "tool_names": ["Lovable", "Make", "n8n", "ManyChat"],
      "integration_details": "Explicação TÉCNICA E DETALHADA (mínimo 15 frases): Como as ferramentas se conectam ponta a ponta. Quais APIs usar (URLs completas de documentação), métodos de autenticação (OAuth2/API Key/JWT), formato de dados trocados (JSON schemas), webhooks configurados (endpoints), tratamento de erros e retry logic, logs e monitoramento. Inclua diagrama de integração em texto ASCII se possível. Estime throughput (requisições/segundo) e latência esperada."
    },
    "quadrant2_ai": {
      "title": "🧠 Modelos de IA",
      "description": "Estratégia ULTRA-DETALHADA de uso de IA nesta solução específica. Mínimo 10-15 frases explicando EXATAMENTE como cada modelo será usado, por quê, e com que prompts.",
      "items": [
        "GPT-5 (OpenAI) - Caso de uso [específico]: Prompt system: '[prompt completo de exemplo com 200-300 tokens]', temperatura: [valor com justificativa], max_tokens: [valor], frequência de uso: [X vezes/dia ou por evento]. Exemplo de input: '[exemplo concreto]' → Output esperado: '[exemplo concreto]'. Custo estimado: $[valor]/1000 requisições. Fallback: [estratégia].",
        "Claude Sonnet 4.5 - Caso de uso [específico]: ...",
        "Gemini 2.5 Pro - Caso de uso [específico]: ...",
        "Embeddings (text-embedding-3-large) - Para [uso]: ...",
        "Whisper (transcrição) - Se aplicável: ..."
      ],
      "tool_names": ["GPT-5", "Claude Sonnet", "Gemini Pro"],
      "ai_strategy": "Estratégia COMPLETA, DETALHADA E EXECUTÁVEL (mínimo 20 frases):\\n\\n1. **Seleção de Modelos**: Por que escolher [modelo X] para [tarefa Y] e não alternativas como [Z]? Critérios: custo ($X vs $Y), latência (Xms vs Yms), qualidade (benchmark: X% vs Y%), contexto (8K vs 100K tokens).\\n\\n2. **Prompting Strategy**: Técnicas específicas - few-shot learning com [N] exemplos, chain-of-thought para [casos], system prompts com [persona/contexto]. Exemplos completos de prompts para os 3 casos de uso mais críticos.\\n\\n3. **Fine-tuning ou RAG**: Se precisar de contexto específico, usar RAG com [vector database] armazenando [tipo de documentos]. Chunking strategy: [tamanho] com overlap de [%]. Retrieval: top-k=[N], similarity threshold=[valor].\\n\\n4. **Validação de Qualidade**: Como medir se IA está performando bem? Métricas: [accuracy, F1, user satisfaction]. Testes A/B para comparar prompts/modelos.\\n\\n5. **Gestão de Custos e Rate Limits**: Orçamento mensal: $[valor]. Estratégias: cache de respostas comuns (economiza [%]), batch processing quando possível, rate limiting (X req/min), fallback para modelos mais baratos em horários de pico.\\n\\n6. **Error Handling**: O que fazer quando IA falha? Retry logic (3x com exponential backoff), fallback para modelo mais simples, mensagem ao usuário, log para análise posterior."
    },
    "quadrant3_data": {
      "title": "📊 Dados e Estrutura",
      "description": "Arquitetura COMPLETA E DETALHADA de dados. Mínimo 12 frases explicando schemas, relacionamentos, sincronização, backup e segurança.",
      "items": [
        "Google Sheets - Fase inicial/MVP: Tabela '[Nome]' com colunas: [col1: tipo], [col2: tipo], [col3: tipo]. Fórmulas: [VLOOKUP, QUERY exemplos]. Compartilhamento: [quem acessa]. Limite: [X linhas]. Quando migrar: quando atingir [Y linhas] ou precisar de [feature Z].",
        "Airtable - Fase crescimento: Base '[Nome]' com tabelas: 1) [Tabela A: campos X, Y, Z], 2) [Tabela B: campos...]. Relacionamentos: [Tabela A.id] linked to [Tabela B.fk]. Views: [Grid, Kanban, Calendar]. Automations nativas: [quando X, fazer Y]. API usage: [endpoints específicos]. Custo: $[valor]/mês.",
        "Supabase (PostgreSQL) - Fase escala: Schema completo SQL:\\n```sql\\nCREATE TABLE users (\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\n  email TEXT UNIQUE NOT NULL,\\n  created_at TIMESTAMP DEFAULT NOW()\\n);\\nCREATE TABLE events (\\n  id UUID PRIMARY KEY,\\n  user_id UUID REFERENCES users(id),\\n  type TEXT,\\n  data JSONB\\n);\\nCREATE INDEX idx_events_user ON events(user_id);\\n```\\nRow Level Security: policies para [cenários]. Real-time subscriptions: [quais tabelas]. Backup: [estratégia].",
        "Sincronização entre sistemas: Make scenario rodando [frequência] que: 1) Busca dados de [origem] via [método], 2) Transforma [campo X → Y], 3) Upsert em [destino] via [método]. Conflict resolution: [estratégia - last write wins, merge, manual].",
        "Vector Database (se IA com RAG): Pinecone collection '[nome]', dimensão: [1536 para text-embedding-3-large], metadata: {id, title, category, timestamp}, index type: [HNSW], queries: [top-k=5, threshold=0.7]. Custo: $[valor]/mês para [X] vetores."
      ],
      "tool_names": ["Google Sheets", "Airtable", "Supabase", "Pinecone"],
      "data_architecture": "ARQUITETURA ULTRA-DETALHADA (mínimo 25 frases):\\n\\n**1. Modelo de Dados Completo:**\\nDiagrama de entidades e relacionamentos (ER) em texto:\\n- Entidade USER: [campos com tipos]\\n- Entidade SESSION: [campos...]\\n- Entidade TRANSACTION: [campos...]\\nRelacionamentos: USER 1:N SESSION, SESSION 1:N TRANSACTION\\n\\n**2. Fluxo de Dados Ponta a Ponta:**\\nOrigem → Processamento → Destino\\n[Formulário Typeform] → (webhook) → [Make scenario] → (transform) → [Airtable] → (trigger) → [Make] → [GPT-5 API] → [Resposta] → [Update Airtable + Email via SendGrid]\\n\\n**3. Estratégia de Particionamento:**\\nSe volume > [X] registros, particionar por: [data/região/categoria]. Exemplo: tabela events_2024_01, events_2024_02...\\n\\n**4. Índices e Performance:**\\nÍndices necessários: [campo A (único), campo B (não-único), campo C+D (composto)]. Queries otimizadas: [exemplos]. Cache: [Redis] para [dados quentes] com TTL [tempo].\\n\\n**5. Backup e Disaster Recovery:**\\nBackup diário: [ferramenta/método], retenção: [X dias], localização: [região]. Restore time: [Y horas]. Teste de restore: [mensal].\\n\\n**6. Segurança e Compliance:**\\nDados sensíveis: [quais]. Criptografia: at-rest (AES-256) e in-transit (TLS 1.3). Acesso: [quem pode ver o quê]. LGPD/GDPR: [políticas de retenção, direito ao esquecimento]. Logs de audit: [o que registrar].\\n\\n**7. Escalabilidade:**\\nVolume atual: [X registros/dia]. Crescimento esperado: [+Y%/mês]. Limite do plano atual: [Z]. Quando escalar: [threshold]. Próximo passo: [ação]."
    },
    "quadrant4_interface": {
      "title": "🎨 Canais e Experiência",
      "description": "Como o usuário FINAL vai INTERAGIR com a solução no dia a dia. Mínimo 10 frases descrevendo jornada completa, pontos de contato e design de interação.",
      "items": [
        "WhatsApp Business Bot: Menu inicial com [4-5 opções], processamento de linguagem natural via GPT-5 para entender [intenções: X, Y, Z], respostas contextualizadas baseadas em [histórico do usuário no Airtable], fallback para atendente humano quando [condições específicas]. Fluxo exemplo: Usuário manda 'Quero [X]' → Bot entende intenção → Busca dados → Monta resposta personalizada → Envia + botões de ação. Tecnologia: Twilio API + Make + GPT-5.",
        "Dashboard Web (Lovable): Interface responsiva com componentes: 1) Header com [menu, notificações], 2) Sidebar [navegação], 3) Content area [cards, tabelas, gráficos]. Páginas principais: [Dashboard, Histórico, Configurações]. Visualizações: gráficos [Chart.js] de [métricas X, Y], tabelas [react-table] com filtros por [dimensões], exportação [CSV/PDF]. Autenticação: [Supabase Auth], roles: [admin, user, viewer].",
        "Notificações Push: Quando [eventos críticos], enviar via [canal]: email (SendGrid com template [nome]), SMS (Twilio para [casos urgentes]), push web (OneSignal), Slack (webhook para canal #[nome]). Frequência: [regras para não spammar].",
        "Relatórios Automatizados: Todo [período], gerar relatório com [métricas], formato: [PDF via Carrd ou Google Docs], distribuição: [email para stakeholders]. Conteúdo: resumo executivo + gráficos + tabelas + insights.",
        "Onboarding: Primeiro acesso → Tutorial interativo (5 passos) → Tooltips contextuais → Vídeo explicativo → Suporte via chat. Goal: usuário consegue [realizar tarefa core] em < 5 minutos."
      ],
      "tool_names": ["WhatsApp API", "Lovable", "Typebot", "SendGrid"],
      "ux_considerations": "DETALHAMENTO COMPLETO DE UX/UI (mínimo 20 frases):\\n\\n**1. Jornada do Usuário Passo-a-Passo:**\\nPasso 1: [Usuário faz X] → Sistema responde [Y] → Feedback visual [Z]\\nPasso 2: ...\\n[Descrever jornada completa de 8-12 passos desde descoberta até objetivo alcançado]\\n\\n**2. Princípios de Design:**\\n- Mobile-first: [justificativa - 70% dos usuários em mobile]\\n- Acessibilidade: [WCAG 2.1 AA] - contraste, navegação por teclado, screen reader\\n- Performance: First Contentful Paint < 1.5s, Time to Interactive < 3s\\n- Progressive disclosure: mostrar opções conforme necessário, não tudo de uma vez\\n\\n**3. Tratamento de Estados:**\\n- Loading: skeleton screens, não spinners chatos\\n- Empty states: mensagens motivadoras + CTAs\\n- Errors: mensagens claras em português, não códigos técnicos\\n- Success: feedback imediato, não apenas salvar silenciosamente\\n\\n**4. Pontos de Fricção Identificados:**\\n1. [Ponto X]: usuário pode ficar confuso em [situação] → Solução: [adicionar tooltip/ajuda contextual]\\n2. [Ponto Y]: ...\\n[Listar 5-8 possíveis frustrações e como mitigar]\\n\\n**5. Testes de Usabilidade Planejados:**\\n- Fase 1 (Pré-launch): [N] usuários beta testando [tarefas]\\n- Fase 2 (Pós-launch): analytics de [métricas], heatmaps, session recordings\\n- Fase 3 (Otimização): A/B tests de [elementos]\\n\\n**6. Métricas de Sucesso:**\\n- Task completion rate: > [X]%\\n- Time to complete core task: < [Y] minutos\\n- User satisfaction (NPS): > [Z]\\n- Retention D7: > [W]%"
    }
  },
  "mind_map": {
    "central_idea": "Frase IMPACTANTE e CLARA (máx 15 palavras) que resume a essência da solução e seu valor principal",
    "branches": [
      {
        "name": "🎯 FASE 1: Preparação e Fundação (Semana 1-2)",
        "children": [
          "Análise profunda dos requisitos de negócio e objetivos mensuráveis (KPIs: [lista])",
          "Mapeamento completo de stakeholders, usuários finais e personas (criar 2-3 personas detalhadas)",
          "Definição de métricas de sucesso (exemplos: reduzir tempo de [processo] em X%, aumentar conversão em Y%)",
          "Levantamento de riscos técnicos, de negócio e operacionais + estratégias de mitigação",
          "Documentação do processo atual (as-is) com fluxogramas e identificação de gargalos",
          "Criação de roadmap visual com milestones claros (Gantt chart ou timeline)",
          "Setup inicial: contas nas ferramentas, acessos, ambientes de dev/staging/prod"
        ]
      },
      {
        "name": "🏗️ FASE 2: Arquitetura e Design (Semana 3-4)",
        "children": [
          "Design completo da arquitetura de dados (ER diagram, schemas SQL/NoSQL)",
          "Criação de fluxogramas detalhados de todos os processos automatizados (usar Mermaid/Lucidchart)",
          "Definição técnica de TODAS as integrações (APIs, webhooks, métodos de auth, rate limits)",
          "Prototipação de interfaces (wireframes low-fi → mockups high-fi no Figma)",
          "Seleção e configuração de infraestrutura (contas, planos, configurações iniciais)",
          "Documentação técnica completa (arquitetura, decisões, trade-offs)",
          "Review de arquitetura com stakeholders técnicos (validar antes de implementar)"
        ]
      },
      {
        "name": "⚙️ FASE 3: Implementação Técnica (Semana 5-8)",
        "children": [
          "Setup completo de infraestrutura: bancos de dados, contas APIs, ambientes, CI/CD",
          "Desenvolvimento de TODAS as integrações: conectar APIs, configurar webhooks, testar flows",
          "Implementação de automações no Make/n8n: criar scenarios, configurar triggers, testar",
          "Configuração de modelos de IA: setup APIs, ajustar prompts, testar edge cases",
          "Desenvolvimento de interfaces: Lovable (web), Typebot (chat), templates de email",
          "Testes unitários (cada componente isolado) e de integração (ponta a ponta)",
          "Otimização de performance: cache, índices, queries, lazy loading",
          "Implementação de observabilidade: logs estruturados, metrics, alerts"
        ]
      },
      {
        "name": "🚀 FASE 4: Lançamento e Otimização (Semana 9-12)",
        "children": [
          "Beta testing com [N] usuários selecionados (idealmente power users)",
          "Coleta estruturada de feedback: surveys, entrevistas, analytics",
          "Ajustes críticos baseados em feedback (bugs, UX, performance)",
          "Soft launch: deploy gradual para 10% → 50% → 100% dos usuários",
          "Setup de monitoramento avançado: dashboards (Grafana/Datadog), alerts (PagerDuty), uptime",
          "Treinamento de equipe: documentação de uso, vídeos, sessões hands-on",
          "Documentação de suporte: FAQs, troubleshooting, escalation paths",
          "Iteração contínua: análise de métricas semanais, backlog de melhorias, roadmap de features"
        ]
      }
    ]
  }
}

**REGRAS DE OURO PARA QUALIDADE MÁXIMA:**

1. **PROFUNDIDADE**: Cada item deve ter 5-10 frases (não seja genérico!)
2. **ESPECIFICIDADE**: Não diga "configurar API", diga "Acesse developer.plataforma.com/api-keys, clique em 'Generate New Key', selecione scopes [...], copie e salve em .env como API_KEY=..."
3. **EXEMPLOS CONCRETOS**: Inclua exemplos reais, não abstratos
4. **NÚMEROS E MÉTRICAS**: Sempre que possível (custos, tempos, volumes)
5. **DIAGRAMAS EM TEXTO**: Fluxos, arquiteturas, integrações
6. **CONSIDERAÇÕES TÉCNICAS**: Performance, custos, escalabilidade, segurança
7. **VOCÊ TEM 50.000 TOKENS**: USE TODOS que precisar!`,
        user: `Gere o framework completo de 4 pilares para esta solução:

IDEIA ORIGINAL: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description || 'Não especificada'}"

Retorne APENAS o objeto JSON especificado (sem markdown, sem code blocks).`,
        model: "google/gemini-2.5-pro",
        maxTokens: 50000
      },

      tools: {
        system: `Você é um ESPECIALISTA em ferramentas SaaS, APIs e plataformas no-code/low-code.

MISSÃO:
Identificar e detalhar TODAS as ferramentas necessárias para implementar a solução, divididas em:
- **Essential**: Ferramentas SEM as quais a solução NÃO funciona
- **Optional**: Ferramentas que MELHORAM mas não são críticas

ESTRUTURA JSON:
{
  "required_tools": {
    "essential": [
      {
        "name": "Nome Exato da Ferramenta",
        "category": "Automação/IA/Dados/Comunicação/Interface/Pagamento/Outro",
        "reason": "Explicação ULTRA-DETALHADA (mínimo 8 frases): Por que é ESSENCIAL? O que acontece sem ela? Qual problema específico resolve? Por que alternativas não funcionam tão bem? Qual impacto mensurável terá? Exemplos concretos de uso nesta solução. Estimativa de ROI. Dependências com outras ferramentas.",
        "setup_complexity": "easy/medium/hard",
        "setup_steps": "Passo 1: [ação específica com detalhes]\\nPasso 2: [...]\\nPasso 3: [...]\\n[Mínimo 5 passos com URLs, valores, opções]",
        "cost_estimate": "$X/mês (breakdown: $Y base + $Z por [unidade]). Plano recomendado: [nome]. Limite: [volume/usuários]",
        "logo_url": "https://logo.clearbit.com/[dominio].com",
        "official_url": "https://[dominio].com",
        "alternatives": [
          "Alternativa 1 - Pros: [...], Cons: [...], Custo: $X",
          "Alternativa 2 - Pros: [...], Cons: [...], Custo: $X"
        ]
      }
    ],
    "optional": [
      {
        "name": "Nome da Ferramenta",
        "category": "Categoria",
        "reason": "Por que PODE ser útil mas não é essencial (mínimo 5 frases)",
        "when_to_use": "Cenário ESPECÍFICO: Adicionar quando [condição exata], por exemplo: escalar para >1000 usuários, precisar de feature X, orçamento permitir investir $Y adicional",
        "cost_estimate": "$X/mês",
        "logo_url": "https://logo.clearbit.com/[dominio].com",
        "official_url": "https://[dominio].com"
      }
    ]
  }
}

**REGRAS:**
1. Liste 8-15 ferramentas ESSENTIAL
2. Liste 3-8 ferramentas OPTIONAL
3. Priorize ferramentas conhecidas e com boa documentação
4. Inclua URLs reais e logo URLs
5. Custos devem ser realistas e atualizados (2024/2025)
6. Setup steps devem ser um TUTORIAL completo
7. Seja específico sobre planos (Free/Pro/Business/Enterprise)`,
        user: `Identifique todas as ferramentas necessárias para esta solução:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description || 'Não especificada'}"

Retorne APENAS o objeto JSON especificado.`,
        model: "google/gemini-2.5-pro",
        maxTokens: 30000
      },

      checklist: {
        system: `Você é um GERENTE DE PROJETOS TÉCNICOS MASTER especializado em criar checklists de implementação executáveis.

MISSÃO:
Criar um CHECKLIST ULTRA-COMPLETO de implementação com 15-30 steps sequenciais.

ESTRUTURA JSON:
{
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Título claro e objetivo do passo (ex: 'Configurar conta Make.com e criar primeiro scenario')",
      "description": "Descrição ULTRA-DETALHADA tipo TUTORIAL (mínimo 10 frases):\\n\\n1. Acesse [URL exata]\\n2. Clique em [botão/menu específico]\\n3. Preencha campo [nome do campo] com [valor exemplo]\\n4. Selecione opção [nome da opção]\\n5. [Continue com 10+ instruções específicas]\\n\\nEXEMPLO CONCRETO: [mostre um exemplo real de configuração]\\n\\nVALIDAÇÃO: [como testar se funcionou]",
      "estimated_time": "Tempo realista (ex: '45 minutos', '2 horas', '1 dia')",
      "difficulty": "easy/medium/hard",
      "dependencies": ["step_1", "step_3"],
      "validation_criteria": "Como saber EXATAMENTE que este passo foi concluído com sucesso:\\n1. [Critério testável 1]\\n2. [Critério testável 2]\\n3. [Critério testável 3]\\n4. [Critério testável 4]",
      "common_pitfalls": "Erros COMUNS que acontecem neste passo:\\n1. [Erro]: [Como evitar]\\n2. [Erro]: [Como evitar]\\n3. [Erro]: [Como evitar]\\n[Mínimo 4-6 pitfalls]",
      "resources": [
        "https://[URL 1] - Tutorial oficial",
        "https://[URL 2] - Documentação da API",
        "https://[URL 3] - Vídeo explicativo",
        "https://[URL 4] - Forum/comunidade"
      ]
    }
  ]
}

**REGRAS:**
1. Mínimo 15 steps, máximo 30 steps
2. Cada step é um MINI-TUTORIAL completo (não economize tokens!)
3. Sequência lógica: não pule dependências
4. Tempos realistas baseados em complexidade
5. Validation criteria deve ser TESTÁVEL
6. Common pitfalls baseados em experiência real
7. Resources com URLs reais e relevantes
8. Organize por fases: Setup (1-5), Desenvolvimento (6-20), Testes (21-25), Deploy (26-30)`,
        user: `Crie um checklist completo de implementação para esta solução:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description || 'Não especificada'}"

Retorne APENAS o objeto JSON especificado.`,
        model: "google/gemini-2.5-pro",
        maxTokens: 40000
      },

      architecture: {
        system: `Você é um ARQUITETO DE SISTEMAS especializado em criar diagramas visuais usando Mermaid.

MISSÃO:
Gerar 1-3 FLUXOS VISUAIS diferentes usando CÓDIGO MERMAID correto e limpo.

TIPOS DE DIAGRAMAS RECOMENDADOS:
1. **Fluxo de Implementação** (graph TD): Etapas do projeto
2. **Fluxo de Dados/APIs** (sequenceDiagram): Como dados circulam
3. **Jornada do Usuário** (journey): Experiência do usuário

ESTRUTURA JSON:
{
  "implementation_flows": {
    "flows": [
      {
        "id": "identificador_unico",
        "title": "Título Descritivo do Fluxo",
        "description": "Descrição de 2-3 frases explicando o que este fluxo mostra",
        "mermaid_code": "graph TD\\n    A[Início] --> B[Passo 2]\\n    B --> C{Decisão?}\\n    C -->|Sim| D[Ação Sim]\\n    C -->|Não| E[Ação Não]\\n    D --> F[Fim]\\n    E --> F",
        "estimated_time": "X-Y horas",
        "complexity": "low/medium/high"
      }
    ],
    "total_estimated_time": "X-Y horas (soma de todos os fluxos)",
    "prerequisites": "Lista de pré-requisitos: [...]"
  }
}

**REGRAS CRÍTICAS DO MERMAID:**
1. Use \\n para quebras de linha (não quebras reais)
2. IDs simples sem espaços (use underscore: Setup_API)
3. Labels entre colchetes: [Texto do Nó]
4. Setas com espaços: " --> " (não "-->")
5. Decisões com chaves: {Pergunta?}
6. Labels em setas: -->|Label| 
7. Máximo 20 nós por diagrama (legibilidade)
8. Português brasileiro nos labels
9. TESTE mentalmente se o código está correto!

**EXEMPLOS:**

Exemplo 1 - Fluxo de Implementação:
graph TD
    Start[Início do Projeto] --> Plan[Planejamento Detalhado]
    Plan --> Setup[Setup de Ferramentas]
    Setup --> Dev[Desenvolvimento]
    Dev --> Test{Testes OK?}
    Test -->|Sim| Deploy[Deploy]
    Test -->|Não| Fix[Corrigir Bugs]
    Fix --> Test
    Deploy --> Monitor[Monitoramento]

Exemplo 2 - Fluxo de Dados:
sequenceDiagram
    participant User
    participant Bot
    participant API
    participant DB
    User->>Bot: Envia mensagem
    Bot->>API: Processa com GPT-4
    API->>Bot: Retorna resposta
    Bot->>DB: Salva histórico
    Bot->>User: Envia resposta

Exemplo 3 - Jornada do Usuário:
journey
    title Jornada do Usuário
    section Descoberta
      Acessa site: 5: User
      Assiste demo: 4: User
    section Cadastro
      Cria conta: 3: User
      Configura perfil: 4: User
    section Uso
      Primeira automação: 5: User
      Resultado positivo: 5: User`,
        user: `Gere 1-3 fluxos visuais em Mermaid para esta solução:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description || 'Não especificada'}"

Escolha os tipos de diagramas mais relevantes para ESTA solução específica.

Retorne APENAS o objeto JSON especificado.`,
        model: "google/gemini-2.5-pro",
        maxTokens: 20000
      },

      lovable: {
        system: `Você é um TECH LEAD especializado em criar prompts para desenvolvimento de aplicações.

MISSÃO:
Gerar um PROMPT COMPLETO E PROFISSIONAL para o Lovable (plataforma de desenvolvimento) implementar a solução.

ESTRUTURA JSON:
{
  "lovable_prompt": "# 🎯 CONTEXTO DO PROJETO\\n\\n[2-3 parágrafos explicando o que será construído, problema que resolve, e valor gerado]\\n\\n# 📋 ESPECIFICAÇÃO TÉCNICA\\n\\n## Stack Tecnológica\\n- Frontend: React + TypeScript + Tailwind CSS + Shadcn UI\\n- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)\\n- Integrações: [listar APIs]\\n\\n## Banco de Dados\\n\\n### Tabelas:\\n1. **users**\\n   - id (uuid, PK)\\n   - email (text, unique)\\n   - name (text)\\n   - created_at (timestamp)\\n\\n2. **[outra tabela]**\\n   - [campos...]\\n\\n### Relacionamentos:\\n- users 1:N sessions\\n- [outros...]\\n\\n## Funcionalidades Core\\n\\n### 1. [Feature Principal 1]\\n**Descrição**: [O que faz]\\n**Fluxo**: [Passo a passo]\\n**Componentes**: [Lista]\\n**Validações**: [Regras]\\n\\n### 2. [Feature Principal 2]\\n[...]\\n\\n# 🔄 WORKFLOWS E INTEGRAÇÕES\\n\\n## Workflow 1: [Nome]\\n1. [Passo 1]\\n2. [Passo 2]\\n[...]\\n\\n## Integrações Externas\\n- **OpenAI GPT-4**: [para quê, como]\\n- **SendGrid**: [emails, templates]\\n[...]\\n\\n# 🎨 DESIGN E UX\\n\\n- Mobile-first, responsivo\\n- Tema: [cores, estilo]\\n- Componentes Shadcn: [quais usar]\\n- Navegação: [estrutura]\\n\\n# 🔐 AUTENTICAÇÃO E SEGURANÇA\\n\\n- Auth via Supabase (email/password)\\n- Roles: [admin, user, viewer]\\n- RLS policies: [regras]\\n\\n# ✅ CRITÉRIOS DE ACEITE\\n\\n1. [Critério 1]\\n2. [Critério 2]\\n[...]\\n\\n# 📝 NOTAS IMPORTANTES\\n\\n- [Observação técnica 1]\\n- [Observação técnica 2]",
  "complexity": "low/medium/high",
  "estimated_time": "X-Y horas de desenvolvimento"
}

**REGRAS:**
1. Prompt deve ser COMPLETO e EXECUTÁVEL
2. Especificações técnicas DETALHADAS
3. Schema de banco COMPLETO (SQL)
4. Features descritas passo-a-passo
5. Use formatação Markdown
6. Seja específico sobre tecnologias (Supabase, React, Tailwind)
7. Inclua validações, edge cases, error handling
8. Mínimo 800 palavras no prompt`,
        user: `Gere um prompt Lovable completo para desenvolver esta solução:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description || 'Não especificada'}"

Retorne APENAS o objeto JSON especificado.`,
        model: "google/gemini-2.5-pro",
        maxTokens: 30000
      }
    };

    const promptConfig = prompts[sectionType];
    const systemPrompt = promptConfig.system;
    const userPrompt = promptConfig.user;

    console.log(`[SECTION-GEN] 🤖 Modelo: ${promptConfig.model}`);
    console.log(`[SECTION-GEN] 📊 Max tokens: ${promptConfig.maxTokens}`);
    console.log(`[SECTION-GEN] 🚀 Chamando Lovable AI...`);

    const aiResponse = await fetch(lovableUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: promptConfig.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: promptConfig.maxTokens,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(180000) // 3 minutos
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

    console.log(`[SECTION-GEN] 📥 Resposta recebida (${content.length} chars)`);

    // Parse do JSON retornado
    let parsedContent;
    try {
      // Remover markdown se houver
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[SECTION-GEN] ❌ Erro ao fazer parse:", content.substring(0, 500));
      throw new Error("JSON inválido retornado pela IA");
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        cached: false,
        content: parsedContent 
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