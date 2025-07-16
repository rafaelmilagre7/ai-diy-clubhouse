-- CORREÇÃO CRÍTICA DE SEGURANÇA: FASE 1 - Corrigir RLS Policies e Security Definer Functions
-- =====================================================================================

-- 1. CORRIGIR FUNÇÕES SEM SET search_path TO ''
-- ===============================================

-- Corrigir todas as funções que não têm SET search_path configurado
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  is_admin_user boolean := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid())
    AND ur.name = 'admin'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$function$;

-- 2. REMOVER ACESSO ANÔNIMO DE TABELAS CRÍTICAS
-- =============================================

-- Remover políticas que permitem acesso anônimo à tabela onboarding_final
DROP POLICY IF EXISTS "onboarding_final_select_policy" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_update_policy" ON public.onboarding_final;

-- Criar políticas seguras apenas para usuários autenticados
CREATE POLICY "onboarding_final_secure_select_policy" ON public.onboarding_final
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      public.is_user_admin(auth.uid())
    )
  );

CREATE POLICY "onboarding_final_secure_update_policy" ON public.onboarding_final
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      public.is_user_admin(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      public.is_user_admin(auth.uid())
    )
  );

CREATE POLICY "onboarding_final_secure_insert_policy" ON public.onboarding_final
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      public.is_user_admin(auth.uid())
    )
  );

-- 3. CORRIGIR TABELA PROFILES - REMOVER ACESSO ANÔNIMO
-- ===================================================

-- Remover políticas antigas problemáticas
DROP POLICY IF EXISTS "profiles_admin_all_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_own_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_own_update" ON public.profiles;

-- Criar políticas seguras que exigem autenticação
CREATE POLICY "profiles_secure_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      public.is_user_admin(auth.uid())
    )
  );

CREATE POLICY "profiles_secure_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      public.is_user_admin(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      public.is_user_admin(auth.uid())
    )
  );

CREATE POLICY "profiles_secure_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      public.is_user_admin(auth.uid())
    )
  );

-- 4. CORRIGIR TABELA INVITES - RESTRINGIR ACESSO PÚBLICO
-- ======================================================

-- Remover política que permite validação pública de tokens
DROP POLICY IF EXISTS "Allow public invite token validation" ON public.invites;

-- Manter apenas acesso admin para gerenciamento de convites
-- As políticas de admin já existem e são seguras

-- 5. CORRIGIR EVENTOS - REMOVER "All can view events"
-- ==================================================

-- Remover política que permite visualização pública
DROP POLICY IF EXISTS "All can view events" ON public.events;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.events;

-- Criar política segura que exige autenticação
CREATE POLICY "events_secure_select_policy" ON public.events
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      -- Admin pode ver todos
      public.is_user_admin(auth.uid()) OR
      -- Usuários autenticados podem ver eventos através de controle de acesso
      id IN (
        SELECT e.id
        FROM public.events e
        LEFT JOIN public.event_access_control eac ON e.id = eac.event_id
        LEFT JOIN public.profiles p ON auth.uid() = p.id
        WHERE eac.role_id = p.role_id OR eac.role_id IS NULL
      )
    )
  );

-- 6. CORRIGIR BADGES - REMOVER ACESSO PÚBLICO TOTAL
-- =================================================

-- Remover políticas que permitem visualização pública
DROP POLICY IF EXISTS "Badges view policy" ON public.badges;
DROP POLICY IF EXISTS "Todos podem ver badges" ON public.badges;

-- Criar política segura que exige autenticação
CREATE POLICY "badges_secure_select_policy" ON public.badges
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 7. CORRIGIR FORUM_CATEGORIES - REMOVER ACESSO PÚBLICO
-- =====================================================

-- Remover política que permite acesso público
DROP POLICY IF EXISTS "forum_categories_select_policy" ON public.forum_categories;

-- Criar política segura que exige autenticação
CREATE POLICY "forum_categories_secure_select_policy" ON public.forum_categories
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- 8. CORRIGIR FORUM_TOPICS - RESTRINGIR ACESSO
-- =============================================

-- A política atual permite acesso público total, vamos restringir
DROP POLICY IF EXISTS "forum_topics_select_policy" ON public.forum_topics;

-- Criar política que exige autenticação
CREATE POLICY "forum_topics_secure_select_policy" ON public.forum_topics
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 9. CORRIGIR LEARNING COURSES - ACESSO PÚBLICO
-- =============================================

-- Remover políticas que permitem acesso público
DROP POLICY IF EXISTS "Users can view all courses" ON public.learning_courses;
DROP POLICY IF EXISTS "Users can view published courses" ON public.learning_courses;
DROP POLICY IF EXISTS "Usuários autenticados podem ver cursos publicados" ON public.learning_courses;

-- Criar política segura baseada em controle de acesso
CREATE POLICY "learning_courses_secure_select_policy" ON public.learning_courses
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_user_admin(auth.uid()) OR
      (published = true AND (
        -- Verifica se o usuário tem acesso ao curso
        id IN (
          SELECT lc.id
          FROM public.learning_courses lc
          LEFT JOIN public.course_access_control cac ON lc.id = cac.course_id
          LEFT JOIN public.profiles p ON auth.uid() = p.id
          WHERE cac.role_id = p.role_id OR cac.role_id IS NULL
        )
      ))
    )
  );

-- 10. ADICIONAR COMENTÁRIO DE AUDITORIA
-- =====================================

COMMENT ON POLICY "onboarding_final_secure_select_policy" ON public.onboarding_final 
IS 'FASE 1 SEGURANÇA: Política segura que exige autenticação para onboarding';

COMMENT ON POLICY "profiles_secure_select_policy" ON public.profiles 
IS 'FASE 1 SEGURANÇA: Política segura que exige autenticação para profiles';

COMMENT ON POLICY "events_secure_select_policy" ON public.events 
IS 'FASE 1 SEGURANÇA: Política segura que exige autenticação para events';

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_fix',
  'rls_policies_hardened',
  jsonb_build_object(
    'phase', 'FASE_1_CRITICA',
    'tables_secured', jsonb_build_array(
      'onboarding_final',
      'profiles', 
      'invites',
      'events',
      'badges',
      'forum_categories',
      'forum_topics',
      'learning_courses'
    ),
    'anonymous_access_removed', true,
    'functions_secured', jsonb_build_array('is_user_admin'),
    'timestamp', now()
  )
);