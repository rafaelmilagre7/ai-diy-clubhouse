-- 🔒 CORREÇÃO CRÍTICA: Proteção de Dados de Comportamento de Usuários
-- Remove exposição pública de curtidas e votos dos usuários

-- ==========================================
-- 1. LEARNING COMMENT LIKES - Securizar
-- ==========================================

-- Remover política insegura que expõe todos os dados
DROP POLICY IF EXISTS "Users can view comment likes" ON public.learning_comment_likes;

-- Nova política segura: apenas usuários autenticados podem ver curtidas
-- E apenas veem curtidas em comentários que eles podem ver
CREATE POLICY "learning_comment_likes_authenticated_view" ON public.learning_comment_likes
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.learning_comments lc 
    WHERE lc.id = comment_id 
    AND ((NOT lc.is_hidden) OR (lc.user_id = auth.uid()) OR is_user_admin_secure(auth.uid()))
  )
);

-- ==========================================
-- 2. TOOL COMMENT LIKES - Securizar  
-- ==========================================

-- Remover política insegura
DROP POLICY IF EXISTS "Qualquer pessoa pode ver curtidas" ON public.tool_comment_likes;

-- Nova política segura: apenas usuários autenticados
CREATE POLICY "tool_comment_likes_authenticated_view" ON public.tool_comment_likes
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.tool_comments tc 
    WHERE tc.id = comment_id
  )
);

-- ==========================================
-- 3. SUGGESTION VOTES - Securizar
-- ==========================================

-- Remover política insegura que permite acesso público total
DROP POLICY IF EXISTS "Anyone can view suggestion votes" ON public.suggestion_votes;

-- Nova política segura: apenas usuários autenticados podem ver votos
-- Usuários podem ver votos em sugestões que eles podem acessar
CREATE POLICY "suggestion_votes_authenticated_view" ON public.suggestion_votes  
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.suggestions s 
    WHERE s.id = suggestion_id
  )
);

-- ==========================================
-- 4. PROTEÇÃO ADICIONAL DE PRIVACIDADE
-- ==========================================

-- Política para permitir que usuários vejam apenas SUAS PRÓPRIAS curtidas/votos
-- Esta política mais restritiva pode ser habilitada para máxima privacidade

CREATE POLICY "users_can_view_own_comment_likes" ON public.learning_comment_likes
FOR SELECT TO authenticated  
USING (auth.uid() = user_id);

CREATE POLICY "users_can_view_own_tool_likes" ON public.tool_comment_likes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_can_view_own_votes" ON public.suggestion_votes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 5. VERIFICAÇÕES DE SEGURANÇA
-- ==========================================

-- Garantir RLS habilitado
ALTER TABLE public.learning_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_comment_likes ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. LOG DE AUDITORIA DA CORREÇÃO
-- ==========================================

-- Registrar correção crítica de privacidade
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action, 
  details,
  severity
) VALUES (
  auth.uid(),
  'privacy_protection',
  'user_behavior_tracking_prevented',
  jsonb_build_object(
    'tables_secured', ARRAY['learning_comment_likes', 'tool_comment_likes', 'suggestion_votes'],
    'vulnerability_type', 'behavioral_tracking_exposure',
    'risk_level', 'critical',
    'data_protected', 'user_interaction_patterns',
    'fix_applied', 'authentication_required_access_control',
    'timestamp', now()
  ),
  'critical'
);