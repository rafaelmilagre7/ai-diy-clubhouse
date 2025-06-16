
-- Migração de Correção de Segurança RLS - Versão Corrigida
-- Corrige apenas as tabelas que existem no banco de dados

-- FUNÇÃO AUXILIAR: Verificar se tabela existe antes de modificar
CREATE OR REPLACE FUNCTION enable_rls_if_exists(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) THEN
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', $1);
    RAISE NOTICE 'RLS habilitado para tabela: %', $1;
  ELSE
    RAISE NOTICE 'Tabela não encontrada, pulando: %', $1;
  END IF;
END;
$$;

-- FASE 1: Habilitar RLS nas tabelas que existem
SELECT enable_rls_if_exists('users');
SELECT enable_rls_if_exists('suggestion_notifications');
SELECT enable_rls_if_exists('suggestion_votes');
SELECT enable_rls_if_exists('suggestions');
SELECT enable_rls_if_exists('tools');
SELECT enable_rls_if_exists('trusted_domains');
SELECT enable_rls_if_exists('user_badges');
SELECT enable_rls_if_exists('user_onboarding');

-- FASE 2: Habilitar RLS nas tabelas com políticas existentes
SELECT enable_rls_if_exists('solution_comments');
SELECT enable_rls_if_exists('progress');
SELECT enable_rls_if_exists('profiles');
SELECT enable_rls_if_exists('permission_definitions');
SELECT enable_rls_if_exists('permission_audit_logs');
SELECT enable_rls_if_exists('solutions');
SELECT enable_rls_if_exists('solution_tools_reference');
SELECT enable_rls_if_exists('referrals');
SELECT enable_rls_if_exists('role_permissions');
SELECT enable_rls_if_exists('user_roles');
SELECT enable_rls_if_exists('onboarding');
SELECT enable_rls_if_exists('onboarding_progress');

-- FASE 3: Criar políticas apenas para tabelas que existem

-- Políticas para users (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE POLICY "Only admins can manage users" ON public.users
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
    RAISE NOTICE 'Políticas criadas para: users';
  END IF;
END;
$$;

-- Políticas para suggestion_notifications (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suggestion_notifications') THEN
    CREATE POLICY "Users can view own suggestion notifications" ON public.suggestion_notifications
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can manage own suggestion notifications" ON public.suggestion_notifications
      FOR ALL USING (auth.uid() = user_id);
    RAISE NOTICE 'Políticas criadas para: suggestion_notifications';
  END IF;
END;
$$;

-- Políticas para suggestion_votes (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suggestion_votes') THEN
    CREATE POLICY "Users can manage own votes" ON public.suggestion_votes
      FOR ALL USING (auth.uid() = user_id);
    RAISE NOTICE 'Políticas criadas para: suggestion_votes';
  END IF;
END;
$$;

-- Políticas para suggestions (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suggestions') THEN
    CREATE POLICY "Anyone can view suggestions" ON public.suggestions
      FOR SELECT USING (true);
    
    CREATE POLICY "Users can create suggestions" ON public.suggestions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can edit own suggestions" ON public.suggestions
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Only admins can delete suggestions" ON public.suggestions
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
    RAISE NOTICE 'Políticas criadas para: suggestions';
  END IF;
END;
$$;

-- Políticas para tools (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tools') THEN
    CREATE POLICY "Anyone can view tools" ON public.tools
      FOR SELECT USING (true);
    
    CREATE POLICY "Only admins can manage tools" ON public.tools
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
    
    CREATE POLICY "Only admins can update tools" ON public.tools
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
    RAISE NOTICE 'Políticas criadas para: tools';
  END IF;
END;
$$;

-- Políticas para trusted_domains (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trusted_domains') THEN
    CREATE POLICY "Only admins can manage trusted domains" ON public.trusted_domains
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
    RAISE NOTICE 'Políticas criadas para: trusted_domains';
  END IF;
END;
$$;

-- Políticas para user_badges (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_badges') THEN
    CREATE POLICY "Users can view own badges" ON public.user_badges
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "System can assign badges" ON public.user_badges
      FOR INSERT WITH CHECK (true);
    RAISE NOTICE 'Políticas criadas para: user_badges';
  END IF;
END;
$$;

-- Políticas para user_onboarding (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_onboarding') THEN
    CREATE POLICY "Users can manage own onboarding" ON public.user_onboarding
      FOR ALL USING (auth.uid() = user_id);
    RAISE NOTICE 'Políticas criadas para: user_onboarding';
  END IF;
END;
$$;

-- FASE 4: Função de logs de auditoria (já existe, vamos recriar se necessário)
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir log de auditoria apenas se o usuário estiver autenticado
  IF auth.uid() IS NOT NULL THEN
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'data_access',
        p_operation,
        p_resource_id,
        jsonb_build_object(
          'table_name', p_table_name,
          'operation', p_operation,
          'timestamp', NOW()
        ),
        'low'
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Falhar silenciosamente para não interromper operações principais
        NULL;
    END;
  END IF;
END;
$$;

-- Limpeza: Remover função auxiliar
DROP FUNCTION IF EXISTS enable_rls_if_exists(text);

-- Comentários de documentação
COMMENT ON FUNCTION public.log_security_access(text, text, text) IS 
'Função para registrar acessos de segurança sem interromper operações principais';
