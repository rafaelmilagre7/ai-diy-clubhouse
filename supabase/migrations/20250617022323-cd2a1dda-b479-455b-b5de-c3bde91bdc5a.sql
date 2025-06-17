
-- Migração RLS FASE 2 - CORREÇÃO DE TIPO DE DADOS
-- Corrige o erro de tipos na tabela users e aplica as políticas corretas

-- ========================================
-- ETAPA 1: HABILITAR RLS NAS TABELAS CRÍTICAS
-- ========================================

-- Tabelas com RLS desabilitado mas com políticas existentes
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_nps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_tools_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.networking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ETAPA 2: INVESTIGAR ESTRUTURA DA TABELA USERS
-- ========================================

-- Primeiro, vamos verificar se a tabela users existe e qual é sua estrutura
-- Se a tabela users usar uma coluna bigint como ID, precisamos ajustar

-- Verificar se a tabela users existe
DO $$
DECLARE
  users_table_exists boolean;
  users_id_type text;
BEGIN
  -- Verificar se a tabela existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) INTO users_table_exists;
  
  IF users_table_exists THEN
    -- Verificar o tipo da coluna id
    SELECT data_type INTO users_id_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'id';
    
    RAISE NOTICE 'Tabela users existe com coluna id do tipo: %', users_id_type;
    
    -- Habilitar RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas baseadas no tipo correto
    IF users_id_type = 'bigint' THEN
      -- Para bigint, usar cast ou comparação diferente
      CREATE POLICY "Users can view own data or admins can view all" ON public.users
        FOR SELECT USING (
          auth.uid()::text = id::text OR 
          EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.user_roles ur ON p.role_id = ur.id
            WHERE p.id = auth.uid() AND ur.name = 'admin'
          )
        );

      CREATE POLICY "Users can update own data or admins can update all" ON public.users
        FOR UPDATE USING (
          auth.uid()::text = id::text OR 
          EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.user_roles ur ON p.role_id = ur.id
            WHERE p.id = auth.uid() AND ur.name = 'admin'
          )
        );
    ELSE
      -- Para uuid, usar comparação direta
      CREATE POLICY "Users can view own data or admins can view all" ON public.users
        FOR SELECT USING (
          auth.uid() = id OR 
          EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.user_roles ur ON p.role_id = ur.id
            WHERE p.id = auth.uid() AND ur.name = 'admin'
          )
        );

      CREATE POLICY "Users can update own data or admins can update all" ON public.users
        FOR UPDATE USING (
          auth.uid() = id OR 
          EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.user_roles ur ON p.role_id = ur.id
            WHERE p.id = auth.uid() AND ur.name = 'admin'
          )
        );
    END IF;
  ELSE
    RAISE NOTICE 'Tabela users não existe - pulando políticas para users';
  END IF;
END $$;

-- ========================================
-- ETAPA 3: OUTRAS TABELAS SEM PROTEÇÃO
-- ========================================

-- Tabela permission_audit_logs (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permission_audit_logs') THEN
    ALTER TABLE public.permission_audit_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Only admins can view audit logs" ON public.permission_audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );

    CREATE POLICY "System can create audit logs" ON public.permission_audit_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Tabela solution_metrics (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solution_metrics') THEN
    ALTER TABLE public.solution_metrics ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view solution metrics" ON public.solution_metrics
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.solutions s
          WHERE s.id = solution_id AND s.published = true
        ) OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );

    CREATE POLICY "Only admins can manage solution metrics" ON public.solution_metrics
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
  END IF;
END $$;

-- Tabela solution_resources (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solution_resources') THEN
    ALTER TABLE public.solution_resources ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view published solution resources" ON public.solution_resources
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.solutions s
          WHERE s.id = solution_id AND s.published = true
        ) OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );

    CREATE POLICY "Only admins can manage solution resources" ON public.solution_resources
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );

    CREATE POLICY "Only admins can update solution resources" ON public.solution_resources
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
  END IF;
END $$;

-- Tabela suggestion_comment_votes (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suggestion_comment_votes') THEN
    ALTER TABLE public.suggestion_comment_votes ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage own suggestion comment votes" ON public.suggestion_comment_votes
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Tabela suggestion_notifications (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suggestion_notifications') THEN
    ALTER TABLE public.suggestion_notifications ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own suggestion notifications" ON public.suggestion_notifications
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "System can create suggestion notifications" ON public.suggestion_notifications
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- ETAPA 4: FUNÇÃO DE VALIDAÇÃO DE SEGURANÇA
-- ========================================

CREATE OR REPLACE FUNCTION public.validate_complete_rls_security()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policy_count bigint,
  security_status text,
  risk_level text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.tablename::text,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count,
    CASE 
      WHEN t.rowsecurity = true AND COUNT(p.policyname) > 0 THEN '✅ PROTEGIDO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN '⚠️ RLS DESABILITADO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN '🔴 SEM PROTEÇÃO'
      WHEN t.rowsecurity = true AND COUNT(p.policyname) = 0 THEN '🟡 RLS SEM POLÍTICAS'
      ELSE '❓ VERIFICAR'
    END as security_status,
    CASE 
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN 'CRÍTICO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN 'ALTO'
      WHEN t.rowsecurity = true AND COUNT(p.policyname) = 0 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END as risk_level
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE '%backup%'
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY 
    CASE 
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN 1
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN 2
      WHEN t.rowsecurity = true AND COUNT(p.policyname) = 0 THEN 3
      ELSE 4
    END,
    t.tablename;
$$;

-- ========================================
-- ETAPA 5: FUNÇÃO DE MONITORAMENTO
-- ========================================

CREATE OR REPLACE FUNCTION public.log_rls_violation_attempt(
  p_table_name text,
  p_operation text,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log tentativas de violação de RLS
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    COALESCE(p_user_id, auth.uid()),
    'rls_violation_attempt',
    p_operation,
    p_table_name,
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'timestamp', NOW(),
      'auth_user_id', auth.uid(),
      'provided_user_id', p_user_id
    ),
    'high'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Falhar silenciosamente para não quebrar operações
    NULL;
END;
$$;

-- Comentários de documentação
COMMENT ON FUNCTION public.validate_complete_rls_security() IS 
'Função para validar o status completo de segurança RLS em todas as tabelas públicas';

COMMENT ON FUNCTION public.log_rls_violation_attempt(text, text, uuid) IS 
'Função para registrar tentativas de violação de políticas RLS';
