-- ========================================================================
-- CORREÇÃO DE SEGURANÇA: Broken Access Control em profiles
-- Relatório externo: CVSS 6.5 - Exposição de PII de todos os usuários
-- ========================================================================

-- 1. REMOVER POLICY INSEGURA
-- A policy antiga permitia que qualquer usuário autenticado visse todos os perfis
DROP POLICY IF EXISTS "profiles_select_own_or_public" ON public.profiles;

-- 2. CRIAR POLICY RESTRITIVA
-- Permite apenas:
-- - Ver próprio perfil
-- - Admins veem todos
-- - Ver perfis de conexões aceitas
CREATE POLICY "profiles_select_restricted" ON public.profiles
  FOR SELECT 
  USING (
    -- Usuário vê apenas seu próprio perfil
    auth.uid() = id 
    OR 
    -- Admins veem todos os perfis
    is_user_admin_secure(auth.uid())
    OR
    -- Usuário vê perfis de conexões aceitas (mutual)
    EXISTS (
      SELECT 1 FROM member_connections mc
      WHERE mc.status = 'accepted'
        AND (
          (mc.requester_id = auth.uid() AND mc.recipient_id = profiles.id)
          OR 
          (mc.recipient_id = auth.uid() AND mc.requester_id = profiles.id)
        )
    )
  );

-- 3. CRIAR VIEW SEGURA PARA COMUNIDADE
-- Expõe apenas dados não-sensíveis para features públicas (fórum, posts)
CREATE OR REPLACE VIEW profiles_community_public AS
SELECT 
  id,
  name,
  avatar_url,
  created_at
FROM profiles
WHERE available_for_networking = true;

-- Permitir acesso autenticado à view
GRANT SELECT ON profiles_community_public TO authenticated;

-- 4. ADICIONAR COMENTÁRIOS DE DOCUMENTAÇÃO
COMMENT ON POLICY "profiles_select_restricted" ON public.profiles IS 
'Política de segurança restritiva: usuários veem apenas próprio perfil, admins veem todos, e perfis de conexões aceitas. Corrige vulnerabilidade CVSS 6.5 de exposição de PII.';

COMMENT ON VIEW profiles_community_public IS 
'View segura para comunidade/fórum: expõe apenas nome e avatar, sem dados sensíveis (email, telefone, empresa).';

-- 5. CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR VISIBILIDADE DE PERFIL
CREATE OR REPLACE FUNCTION can_view_full_profile(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Próprio usuário
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Admin
  IF is_user_admin_secure(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Conexão aceita
  IF EXISTS (
    SELECT 1 FROM member_connections mc
    WHERE mc.status = 'accepted'
      AND (
        (mc.requester_id = auth.uid() AND mc.recipient_id = target_user_id)
        OR 
        (mc.recipient_id = auth.uid() AND mc.requester_id = target_user_id)
      )
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION can_view_full_profile IS 
'Verifica se o usuário atual tem permissão para ver o perfil completo de outro usuário.';