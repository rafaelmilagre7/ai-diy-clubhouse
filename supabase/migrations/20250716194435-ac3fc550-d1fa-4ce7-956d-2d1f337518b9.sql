-- FASE 1: Correção Crítica de RLS - Usar CASCADE para remover dependências

-- 1. Remover função com todas as dependências e recriar
DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;

-- 2. Recriar função is_user_admin com search_path seguro
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

-- 3. Recriar políticas essenciais removidas pelo CASCADE
-- Profiles
CREATE POLICY "profiles_secure_select" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "profiles_secure_update" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "profiles_secure_insert" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid() OR is_user_admin(auth.uid()));

-- User Roles
CREATE POLICY "user_roles_admin_only" 
ON public.user_roles 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Onboarding Final
CREATE POLICY "onboarding_final_user_access" 
ON public.onboarding_final 
FOR ALL 
USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- Learning Courses
CREATE POLICY "learning_courses_public_select" 
ON public.learning_courses 
FOR SELECT 
USING (published = true OR is_user_admin(auth.uid()));

CREATE POLICY "learning_courses_admin_manage" 
ON public.learning_courses 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Learning Progress
CREATE POLICY "learning_progress_user_access" 
ON public.learning_progress 
FOR ALL 
USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- Forum básico
CREATE POLICY "forum_topics_basic_access" 
ON public.forum_topics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "forum_posts_basic_access" 
ON public.forum_posts 
FOR SELECT 
USING (NOT is_hidden OR user_id = auth.uid() OR is_user_admin(auth.uid()));

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'rls_cascade_rebuild',
  '{"message": "Políticas RLS recriadas após CASCADE - Sistema estabilizado", "phase": "1_critical_rls_fix_complete", "timestamp": "' || now() || '"}'::jsonb,
  auth.uid()
);