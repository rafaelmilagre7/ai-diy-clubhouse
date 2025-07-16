-- FASE 1: Correção Crítica de RLS - Eliminar Recursão Infinita

-- 1. Remover função existente e recriar corretamente
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$$;

-- 2. Corrigir política recursiva em learning_courses
DROP POLICY IF EXISTS "learning_courses_select_policy" ON public.learning_courses;
DROP POLICY IF EXISTS "learning_courses_admin_policy" ON public.learning_courses;

-- Criar política simples para learning_courses
CREATE POLICY "learning_courses_public_select" 
ON public.learning_courses 
FOR SELECT 
USING (published = true OR is_user_admin(auth.uid()));

CREATE POLICY "learning_courses_admin_all" 
ON public.learning_courses 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- 3. Remover views Security Definer problemáticas
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;
DROP VIEW IF EXISTS public.user_engagement_score CASCADE;
DROP VIEW IF EXISTS public.users_with_roles CASCADE;

-- 4. Limpar políticas problemáticas em learning_progress
DROP POLICY IF EXISTS "Users can view their learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users can manage their learning progress" ON public.learning_progress;

-- Recriar políticas simples para learning_progress
CREATE POLICY "learning_progress_user_access" 
ON public.learning_progress 
FOR ALL 
USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- 5. Corrigir política em profiles que está causando recursão
DROP POLICY IF EXISTS "secure_profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_secure_select" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  is_user_admin(auth.uid())
);

-- 6. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'rls_recursion_fix',
  '{"message": "Corrigidas políticas RLS recursivas - Fase 1 completa", "phase": "1_critical_rls_fix", "timestamp": "' || now() || '"}'::jsonb,
  auth.uid()
);