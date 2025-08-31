-- PLANO DE CORREÇÃO DEFINITIVO: Corrigir can_access_learning_content e Políticas RLS

-- ===== ETAPA 1: Corrigir função can_access_learning_content =====
CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role_name text;
  user_permissions jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE '[can_access_learning_content] Verificando acesso para usuário: %', target_user_id;
  
  -- Buscar role e permissões do usuário
  SELECT ur.name, ur.permissions INTO user_role_name, user_permissions
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Log das informações encontradas
  RAISE NOTICE '[can_access_learning_content] Role: %, Permissions: %', user_role_name, user_permissions;
  
  -- Se não encontrou usuário, negar acesso
  IF user_role_name IS NULL THEN
    RAISE NOTICE '[can_access_learning_content] Usuário não encontrado - negando acesso';
    RETURN false;
  END IF;
  
  -- CORREÇÃO PRINCIPAL: Admin tem acesso total
  IF user_role_name = 'admin' THEN
    RAISE NOTICE '[can_access_learning_content] Admin detectado - liberando acesso';
    RETURN true;
  END IF;
  
  -- CORREÇÃO: Verificar permissão "all" como global
  IF user_permissions ? 'all' AND (user_permissions->>'all')::boolean = true THEN
    RAISE NOTICE '[can_access_learning_content] Permissão global "all" detectada - liberando acesso';
    RETURN true;
  END IF;
  
  -- Verificar permissão específica de learning
  IF user_permissions ? 'learning' AND (user_permissions->>'learning')::boolean = true THEN
    RAISE NOTICE '[can_access_learning_content] Permissão "learning" detectada - liberando acesso';
    RETURN true;
  END IF;
  
  -- Fallback: verificar por outras permissões de formação
  IF user_permissions ? 'formacao' AND (user_permissions->>'formacao')::boolean = true THEN
    RAISE NOTICE '[can_access_learning_content] Permissão "formacao" detectada - liberando acesso';
    RETURN true;
  END IF;
  
  -- Negar acesso se não encontrou permissões
  RAISE NOTICE '[can_access_learning_content] Nenhuma permissão encontrada - negando acesso';
  RETURN false;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[can_access_learning_content] ERRO: %', SQLERRM;
    RETURN false;
END;
$$;

-- ===== ETAPA 2: Limpar e recriar políticas RLS simplificadas =====

-- Remover todas as políticas conflitantes de learning_lessons
DROP POLICY IF EXISTS "learning_lessons_secure_access" ON learning_lessons;
DROP POLICY IF EXISTS "Users can view published lessons" ON learning_lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_select_policy" ON learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_admin_access" ON learning_lessons;

-- Criar política única e simples para SELECT em learning_lessons
CREATE POLICY "learning_lessons_unified_select" ON learning_lessons
  FOR SELECT
  USING (
    (published = true AND can_access_learning_content(auth.uid())) 
    OR is_user_admin_secure(auth.uid())
  );

-- Política para INSERT/UPDATE/DELETE (apenas admins)
CREATE POLICY "learning_lessons_admin_modify" ON learning_lessons
  FOR ALL
  USING (is_user_admin_secure(auth.uid()))
  WITH CHECK (is_user_admin_secure(auth.uid()));

-- Remover todas as políticas conflitantes de learning_lesson_videos  
DROP POLICY IF EXISTS "learning_lesson_videos_secure_access" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Users can view lesson videos" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Admins can manage lesson videos" ON learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_select_policy" ON learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_admin_access" ON learning_lesson_videos;

-- Criar política única e simples para SELECT em learning_lesson_videos
CREATE POLICY "learning_lesson_videos_unified_select" ON learning_lesson_videos
  FOR SELECT
  USING (
    can_access_learning_content(auth.uid()) 
    OR is_user_admin_secure(auth.uid())
  );

-- Política para INSERT/UPDATE/DELETE (apenas admins)
CREATE POLICY "learning_lesson_videos_admin_modify" ON learning_lesson_videos
  FOR ALL
  USING (is_user_admin_secure(auth.uid()))
  WITH CHECK (is_user_admin_secure(auth.uid()));

-- ===== ETAPA 3: Corrigir outras tabelas relacionadas =====

-- learning_modules - Simplificar políticas
DROP POLICY IF EXISTS "learning_modules_secure_access" ON learning_modules;
DROP POLICY IF EXISTS "Users can view published modules" ON learning_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON learning_modules;

CREATE POLICY "learning_modules_unified_select" ON learning_modules
  FOR SELECT
  USING (
    (published = true AND can_access_learning_content(auth.uid())) 
    OR is_user_admin_secure(auth.uid())
  );

CREATE POLICY "learning_modules_admin_modify" ON learning_modules
  FOR ALL
  USING (is_user_admin_secure(auth.uid()))
  WITH CHECK (is_user_admin_secure(auth.uid()));

-- learning_courses - Simplificar políticas
DROP POLICY IF EXISTS "learning_courses_secure_access" ON learning_courses;
DROP POLICY IF EXISTS "Users can view published courses" ON learning_courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON learning_courses;

CREATE POLICY "learning_courses_unified_select" ON learning_courses
  FOR SELECT
  USING (
    (published = true AND can_access_learning_content(auth.uid())) 
    OR is_user_admin_secure(auth.uid())
  );

CREATE POLICY "learning_courses_admin_modify" ON learning_courses
  FOR ALL
  USING (is_user_admin_secure(auth.uid()))
  WITH CHECK (is_user_admin_secure(auth.uid()));

-- ===== ETAPA 4: Adicionar função de teste rápido =====
CREATE OR REPLACE FUNCTION public.test_learning_access_debug()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  user_info record;
  access_result boolean;
  result jsonb;
BEGIN
  current_user_id := auth.uid();
  
  -- Buscar informações do usuário
  SELECT 
    p.id, 
    p.email, 
    ur.name as role_name, 
    ur.permissions
  INTO user_info
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = current_user_id;
  
  -- Testar a função de acesso
  SELECT can_access_learning_content(current_user_id) INTO access_result;
  
  result := jsonb_build_object(
    'user_id', current_user_id,
    'user_email', user_info.email,
    'user_role', user_info.role_name,
    'user_permissions', user_info.permissions,
    'can_access_learning', access_result,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;