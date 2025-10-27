-- ============================================
-- TABELA AI_PROMPTS - Gerenciamento de Prompts de IA
-- ============================================

-- Criar tabela ai_prompts
CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  prompt_content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('builder', 'networking', 'learning', 'general')),
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash-lite',
  temperature DECIMAL(3,2),
  max_tokens INTEGER,
  timeout_seconds INTEGER NOT NULL DEFAULT 15,
  retry_attempts INTEGER NOT NULL DEFAULT 2,
  response_format JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS POLICIES - Apenas admins podem gerenciar
-- ============================================

ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Admins podem fazer tudo
CREATE POLICY "ai_prompts_admin_full_access"
ON public.ai_prompts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ai_prompts_key ON public.ai_prompts(key);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON public.ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_active ON public.ai_prompts(is_active);

-- ============================================
-- TRIGGER PARA UPDATED_AT E VERSIONING
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Incrementar versão apenas se o conteúdo do prompt mudou
  IF OLD.prompt_content IS DISTINCT FROM NEW.prompt_content OR 
     OLD.model IS DISTINCT FROM NEW.model OR
     OLD.temperature IS DISTINCT FROM NEW.temperature OR
     OLD.max_tokens IS DISTINCT FROM NEW.max_tokens THEN
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_ai_prompts_updated_at
  BEFORE UPDATE ON public.ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ai_prompts_updated_at();

-- ============================================
-- POPULAR COM PROMPTS INICIAIS DO BUILDER
-- ============================================

-- 1. Validação de Viabilidade de Ideia
INSERT INTO public.ai_prompts (
  key,
  name,
  description,
  prompt_content,
  category,
  model,
  temperature,
  max_tokens,
  timeout_seconds,
  retry_attempts,
  response_format
) VALUES (
  'validate_idea_feasibility',
  'Validação de Viabilidade de Ideia',
  'Valida a viabilidade técnica de uma ideia de automação ou solução digital',
  'Você é um consultor especializado em automação de processos e soluções digitais. Sua função é avaliar ideias de forma direta e eficiente.

**INSTRUÇÕES CRÍTICAS:**

1. Seja EXTREMAMENTE objetivo e direto
2. Responda em português brasileiro
3. Avalie a viabilidade técnica da ideia apresentada
4. Identifique oportunidades e desafios principais
5. Retorne APENAS JSON válido, sem markdown, sem explicações adicionais

**FORMATO DE RESPOSTA (JSON):**
```json
{
  "is_feasible": boolean,
  "feasibility_score": number (0-100),
  "viability_summary": "string (máximo 2 frases)",
  "key_opportunities": ["string", "string", "string"],
  "main_challenges": ["string", "string"],
  "recommended_next_steps": ["string", "string", "string"]
}
```

**CRITÉRIOS DE AVALIAÇÃO:**
- **is_feasible**: true se a ideia é tecnicamente viável
- **feasibility_score**: 0-30 (baixa), 31-60 (média), 61-100 (alta)
- **viability_summary**: Resumo objetivo em máximo 2 frases
- **key_opportunities**: Máximo 3 oportunidades principais
- **main_challenges**: Máximo 2 desafios principais
- **recommended_next_steps**: Máximo 3 próximos passos recomendados

**IMPORTANTE:**
- Retorne APENAS o objeto JSON, sem ```json ou qualquer outro texto
- Seja direto e prático
- Foque em viabilidade técnica real',
  'builder',
  'google/gemini-2.5-flash-lite',
  0.3,
  1000,
  15,
  2,
  '{"type": "json_object"}'::jsonb
);

-- 2. Análise de Perguntas sobre Ideia
INSERT INTO public.ai_prompts (
  key,
  name,
  description,
  prompt_content,
  category,
  model,
  temperature,
  max_tokens,
  timeout_seconds,
  retry_attempts
) VALUES (
  'analyze_idea_questions',
  'Análise de Perguntas sobre Ideia',
  'Analisa as respostas do usuário sobre sua ideia para refinar o entendimento',
  'Você é um consultor especializado em automação. Analise as respostas do usuário sobre sua ideia e identifique:

1. Pontos fortes da ideia
2. Áreas que precisam de mais detalhamento
3. Possíveis problemas ou desafios
4. Recomendações de refinamento

Seja objetivo e construtivo. Responda em português brasileiro.',
  'builder',
  'google/gemini-2.5-flash-lite',
  0.5,
  1500,
  20,
  2
);

-- 3. Geração de Solução Completa
INSERT INTO public.ai_prompts (
  key,
  name,
  description,
  prompt_content,
  category,
  model,
  temperature,
  max_tokens,
  timeout_seconds,
  retry_attempts
) VALUES (
  'generate_builder_solution',
  'Geração de Solução Completa',
  'Gera uma solução completa com arquitetura, fluxos e checklist de implementação',
  'Você é um arquiteto de soluções especializado em automação e desenvolvimento de software. Com base na ideia e nas respostas do usuário, crie uma solução completa que inclua:

1. **Título da Solução**: Nome claro e descritivo
2. **Descrição Curta**: Resumo em 1-2 frases
3. **Fluxo de Implementação**: Passo a passo estruturado em módulos
4. **Arquitetura de Dados**: Estrutura de dados necessária
5. **Integrações de APIs**: APIs e serviços necessários
6. **Checklist de Deploy**: Lista de verificação para implantação
7. **Insights de Arquitetura**: Considerações técnicas importantes
8. **Stack Técnica**: Tecnologias recomendadas
9. **Jornada do Usuário**: Fluxo de experiência do usuário
10. **Prompt para Lovable**: Instruções detalhadas para implementação

Seja técnico, detalhado e prático. Retorne em formato JSON estruturado. Responda em português brasileiro.',
  'builder',
  'google/gemini-2.5-pro',
  0.7,
  8000,
  30,
  3
);

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE public.ai_prompts IS 'Armazena prompts de IA e suas configurações técnicas para diferentes funcionalidades da plataforma';
COMMENT ON COLUMN public.ai_prompts.key IS 'Identificador único do prompt (usado no código)';
COMMENT ON COLUMN public.ai_prompts.category IS 'Categoria do prompt: builder, networking, learning, general';
COMMENT ON COLUMN public.ai_prompts.model IS 'Modelo de IA a ser usado (ex: google/gemini-2.5-flash-lite, gpt-4o)';
COMMENT ON COLUMN public.ai_prompts.temperature IS 'Criatividade do modelo (0.0-1.0, onde 0 é determinístico e 1 é criativo)';
COMMENT ON COLUMN public.ai_prompts.timeout_seconds IS 'Timeout em segundos para a requisição de IA';
COMMENT ON COLUMN public.ai_prompts.retry_attempts IS 'Número de tentativas em caso de falha';
COMMENT ON COLUMN public.ai_prompts.version IS 'Versão do prompt (incrementa automaticamente ao editar)';