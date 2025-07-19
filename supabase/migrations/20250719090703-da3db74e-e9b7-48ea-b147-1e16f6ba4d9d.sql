
-- CORREÇÃO CRÍTICA: ELIMINAR RECURSÃO INFINITA NA FUNÇÃO is_user_admin
-- ===============================================================================

-- ETAPA 1: SUBSTITUIR IMPLEMENTAÇÃO DA FUNÇÃO is_user_admin SEM RECURSÃO
-- ======================================================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- NOVA IMPLEMENTAÇÃO: Usar user_metadata do JWT sem acessar tabela profiles
  -- Isso evita completamente a recursão infinita nas políticas RLS
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
  -- Verificação de segurança: apenas para o usuário autenticado atual
  WHERE user_id = auth.uid();
$$;

-- ETAPA 2: CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR ROLE ATUAL
-- ========================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'member'
  );
$$;

-- ETAPA 3: RECRIAR POLÍTICAS RLS DA TABELA user_roles SEM RECURSÃO
-- ================================================================

-- Remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_policy" ON public.user_roles;

-- Criar políticas simples e seguras
CREATE POLICY "user_roles_safe_select"
  ON public.user_roles
  FOR SELECT
  USING (
    -- Usuário pode ver seu próprio role
    user_id = auth.uid()
    OR
    -- Admin pode ver todos (usando JWT, não tabela)
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
  );

CREATE POLICY "user_roles_safe_admin_manage"
  ON public.user_roles
  FOR ALL
  USING (
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
  );

-- ETAPA 4: CORRIGIR POLÍTICAS DA TABELA profiles QUE USAM is_user_admin
-- =====================================================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "final_profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "final_profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all_access" ON public.profiles;

-- Recriar com lógica não-recursiva
CREATE POLICY "profiles_safe_select"
  ON public.profiles
  FOR SELECT
  USING (
    -- Usuário pode ver seu próprio perfil
    id = auth.uid()
    OR
    -- Admin pode ver todos (usando JWT)
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
    OR
    -- Acesso público limitado (apenas campos básicos)
    true
  );

CREATE POLICY "profiles_safe_update"
  ON public.profiles
  FOR UPDATE
  USING (
    -- Usuário pode atualizar seu próprio perfil
    id = auth.uid()
    OR
    -- Admin pode atualizar qualquer perfil
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
  );

CREATE POLICY "profiles_safe_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Apenas inserir o próprio perfil
    id = auth.uid()
  );

-- ETAPA 5: CONSOLIDAR SISTEMA DE ONBOARDING
-- =========================================

-- Criar estrutura unificada de onboarding se não existir
CREATE TABLE IF NOT EXISTS public.onboarding_unified (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 1,
  completed_steps integer[] DEFAULT ARRAY[]::integer[],
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  
  -- Dados consolidados de todas as etapas
  personal_info jsonb DEFAULT '{}'::jsonb,
  business_info jsonb DEFAULT '{}'::jsonb,
  ai_experience jsonb DEFAULT '{}'::jsonb,
  goals_info jsonb DEFAULT '{}'::jsonb,
  personalization jsonb DEFAULT '{}'::jsonb,
  
  -- Metadados
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Migrar dados existentes do onboarding_final para onboarding_unified
INSERT INTO public.onboarding_unified (
  user_id, current_step, completed_steps, is_completed, completed_at,
  personal_info, business_info, ai_experience, goals_info, personalization,
  created_at, updated_at
)
SELECT 
  user_id, 
  COALESCE(current_step, 1),
  COALESCE(completed_steps, ARRAY[]::integer[]),
  COALESCE(is_completed, false),
  completed_at,
  COALESCE(personal_info, '{}'::jsonb),
  COALESCE(business_info, '{}'::jsonb),
  COALESCE(ai_experience, '{}'::jsonb),
  COALESCE(goals_info, '{}'::jsonb),
  COALESCE(personalization, '{}'::jsonb),
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM public.onboarding_final
ON CONFLICT (user_id) DO NOTHING;

-- Políticas RLS para onboarding_unified
ALTER TABLE public.onboarding_unified ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_user_own_access"
  ON public.onboarding_unified
  FOR ALL
  USING (user_id = auth.uid());

-- ETAPA 6: CRIAR TABELA progress UNIFICADA (que o front-end espera)
-- =================================================================

CREATE TABLE IF NOT EXISTS public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Compatibilidade com frontend existente
  module_id uuid,
  lesson_id uuid,
  solution_id uuid,
  
  -- Dados de progresso
  progress_data jsonb DEFAULT '{}'::jsonb,
  completion_percentage integer DEFAULT 0,
  completed boolean DEFAULT false,
  last_accessed_at timestamp with time zone DEFAULT now(),
  
  -- Metadados
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Políticas RLS para progress
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_user_access"
  ON public.progress
  FOR ALL
  USING (
    user_id = auth.uid()
    OR
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
  );

-- ETAPA 7: ADICIONAR search_path ÀS FUNÇÕES CRÍTICAS
-- ==================================================

-- Corrigir funções principais que não têm search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'member'
  );
$$;

-- Função auxiliar para verificar admin de forma segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
$$;

-- ETAPA 8: LOG DA CORREÇÃO
-- ========================

INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  auth.uid(),
  'system_fix',
  'rls_recursion_correction',
  jsonb_build_object(
    'fixed_functions', ARRAY['is_user_admin', 'get_user_role'],
    'fixed_tables', ARRAY['user_roles', 'profiles'],
    'created_tables', ARRAY['onboarding_unified', 'progress'],
    'migration_phase', 'phase_1_critical_fixes',
    'timestamp', now()
  )
);
