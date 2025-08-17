-- 🔒 CORREÇÃO CRÍTICA: Proteção de Conteúdo Educacional Premium (Corrigida)
-- Remove acesso não autorizado a cursos, módulos e lições premium

-- ==========================================
-- 1. LEARNING LESSONS - Remover políticas vulneráveis
-- ==========================================

-- Remover política que permite acesso a todas as lições publicadas
DROP POLICY IF EXISTS "learning_lessons_unified_access" ON public.learning_lessons;

-- Remover política redundante/conflitante
DROP POLICY IF EXISTS "Usuários autenticados podem ver aulas de módulos publicados" ON public.learning_lessons;

-- Nova política segura: apenas usuários com acesso autorizado ao curso
CREATE POLICY "learning_lessons_secure_access" ON public.learning_lessons
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Admins têm acesso total
    is_user_admin_secure(auth.uid())
    OR
    -- Autores do curso têm acesso
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      JOIN public.learning_courses lc ON lm.course_id = lc.id
      WHERE lm.id = module_id AND lc.created_by = auth.uid()
    )
    OR  
    -- Usuários com acesso explícito ao curso via enrollment
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      JOIN public.user_course_access uca ON lm.course_id = uca.course_id
      WHERE lm.id = module_id 
      AND uca.user_id = auth.uid()
      AND uca.access_type = 'granted'
      AND (uca.expires_at IS NULL OR uca.expires_at > now())
    )
  )
  AND published = true
);

-- ==========================================  
-- 2. LEARNING MODULES - Remover políticas vulneráveis
-- ==========================================

-- Remover política que permite acesso a todos os módulos publicados
DROP POLICY IF EXISTS "learning_modules_unified_access" ON public.learning_modules;

-- Remover política redundante/conflitante
DROP POLICY IF EXISTS "Usuários autenticados podem ver módulos de cursos publicados" ON public.learning_modules;

-- Nova política segura: apenas usuários com acesso autorizado
CREATE POLICY "learning_modules_secure_access" ON public.learning_modules
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Admins têm acesso total
    is_user_admin_secure(auth.uid())
    OR
    -- Autores do curso têm acesso  
    EXISTS (
      SELECT 1 FROM public.learning_courses lc
      WHERE lc.id = course_id AND lc.created_by = auth.uid()
    )
    OR
    -- Usuários com acesso explícito via enrollment
    EXISTS (
      SELECT 1 FROM public.user_course_access uca
      WHERE uca.course_id = learning_modules.course_id
      AND uca.user_id = auth.uid() 
      AND uca.access_type = 'granted'
      AND (uca.expires_at IS NULL OR uca.expires_at > now())
    )
  )
  AND published = true
);

-- ==========================================
-- 3. PROTEÇÃO USER COURSE ACCESS
-- ==========================================

-- Garantir que a tabela de acesso tem RLS habilitado
ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "users_can_view_own_course_access" ON public.user_course_access;
DROP POLICY IF EXISTS "admins_can_grant_course_access" ON public.user_course_access;
DROP POLICY IF EXISTS "admins_can_modify_course_access" ON public.user_course_access;

-- Política para usuários verem apenas seus próprios acessos
CREATE POLICY "users_can_view_own_course_access" ON public.user_course_access
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR is_user_admin_secure(auth.uid()));

-- Política para inserção (apenas admins podem conceder acesso)
CREATE POLICY "admins_can_grant_course_access" ON public.user_course_access
FOR INSERT TO authenticated  
WITH CHECK (is_user_admin_secure(auth.uid()));

-- Política para atualização (apenas admins)
CREATE POLICY "admins_can_modify_course_access" ON public.user_course_access
FOR UPDATE TO authenticated
USING (is_user_admin_secure(auth.uid()));

-- ==========================================
-- 4. VERIFICAÇÕES DE SEGURANÇA
-- ==========================================

-- Garantir RLS habilitado em todas as tabelas
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. LOG DE AUDITORIA CRÍTICA
-- ==========================================

-- Registrar correção de exposição de conteúdo premium
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details, 
  severity
) VALUES (
  auth.uid(),
  'content_protection',
  'premium_content_access_secured',
  jsonb_build_object(
    'tables_secured', ARRAY['learning_lessons', 'learning_modules', 'learning_courses', 'user_course_access'],
    'vulnerability_type', 'unauthorized_premium_content_access',
    'risk_level', 'critical',
    'data_protected', 'educational_content_titles_descriptions_structure',
    'fix_applied', 'enrollment_based_access_control',
    'policies_removed', ARRAY['learning_lessons_unified_access', 'learning_modules_unified_access'],
    'policies_added', ARRAY['learning_lessons_secure_access', 'learning_modules_secure_access'],
    'timestamp', now()
  ),
  'critical'
);