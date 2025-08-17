-- 🔒 CORREÇÃO CRÍTICA DE SEGURANÇA: RLS para Comentários de Usuários
-- Remove políticas inseguras e implementa controle de acesso adequado

-- ==========================================
-- 1. LEARNING COMMENTS - Corrigir políticas
-- ==========================================

-- Remover políticas inseguras existentes
DROP POLICY IF EXISTS "Usuários autenticados podem ver comentários" ON public.learning_comments;
DROP POLICY IF EXISTS "Users can view comments" ON public.learning_comments;

-- Nova política segura: apenas usuários autenticados podem ver comentários não ocultos
CREATE POLICY "learning_comments_authenticated_view" ON public.learning_comments
FOR SELECT TO authenticated
USING ((NOT is_hidden) OR (auth.uid() = user_id) OR is_user_admin_secure(auth.uid()));

-- ==========================================
-- 2. SOLUTION COMMENTS - Corrigir políticas
-- ==========================================

-- Remover política insegura que permite acesso sem autenticação
DROP POLICY IF EXISTS "Anyone can view solution comments" ON public.solution_comments;

-- Nova política segura: apenas usuários autenticados
CREATE POLICY "solution_comments_authenticated_view" ON public.solution_comments
FOR SELECT TO authenticated  
USING ((NOT is_hidden) OR (auth.uid() = user_id) OR is_user_admin_secure(auth.uid()));

-- ==========================================
-- 3. SUGGESTION COMMENTS - Corrigir políticas
-- ==========================================

-- Remover políticas inseguras
DROP POLICY IF EXISTS "Anyone can view comments" ON public.suggestion_comments;
DROP POLICY IF EXISTS "Todos podem visualizar comentários públicos" ON public.suggestion_comments;

-- Nova política segura: apenas usuários autenticados
CREATE POLICY "suggestion_comments_authenticated_view" ON public.suggestion_comments
FOR SELECT TO authenticated
USING ((NOT is_hidden) OR (auth.uid() = user_id) OR is_user_admin_secure(auth.uid()));

-- ==========================================
-- 4. TOOL COMMENTS - Corrigir políticas  
-- ==========================================

-- Remover política insegura
DROP POLICY IF EXISTS "Qualquer pessoa pode ver comentários" ON public.tool_comments;

-- Nova política segura: apenas usuários autenticados
CREATE POLICY "tool_comments_authenticated_view" ON public.tool_comments
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- ==========================================
-- 5. VERIFICAÇÕES DE SEGURANÇA ADICIONAIS
-- ==========================================

-- Garantir que todas as tabelas tenham RLS habilitado
ALTER TABLE public.learning_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_comments ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.suggestion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_comments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. LOG DE AUDITORIA DA CORREÇÃO
-- ==========================================

-- Registrar a correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type, 
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'comment_tables_rls_secured', 
  jsonb_build_object(
    'tables_secured', ARRAY['learning_comments', 'solution_comments', 'suggestion_comments', 'tool_comments'],
    'vulnerability_type', 'unauthorized_data_access',
    'fix_applied', 'authentication_required_policies',
    'timestamp', now()
  ),
  'high'
);