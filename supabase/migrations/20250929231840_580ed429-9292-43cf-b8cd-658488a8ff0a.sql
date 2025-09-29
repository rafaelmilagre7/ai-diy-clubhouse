-- ============================================
-- FASE 1: Corrigir Função SQL de Estatísticas
-- ============================================
-- Problema: A função antiga usava master_email que está vazio
-- Solução: Contar masters através da tabela organizations

CREATE OR REPLACE FUNCTION public.get_user_stats_corrected()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_users integer;
  masters integer;
  onboarding_completed_count integer;
  onboarding_pending_count integer;
BEGIN
  -- Total de usuários
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- ✅ NOVA LÓGICA CORRETA: Masters = usuários que são master_user_id em organizations
  SELECT COUNT(DISTINCT o.master_user_id) INTO masters
  FROM public.organizations o
  INNER JOIN public.profiles p ON p.id = o.master_user_id
  WHERE o.master_user_id IS NOT NULL;
  
  -- Onboarding completo
  SELECT COUNT(*) INTO onboarding_completed_count
  FROM public.profiles WHERE onboarding_completed = true;
  
  -- Onboarding pendente
  SELECT COUNT(*) INTO onboarding_pending_count
  FROM public.profiles WHERE onboarding_completed = false OR onboarding_completed IS NULL;
  
  RETURN jsonb_build_object(
    'total_users', total_users,
    'masters', masters,
    'onboarding_completed', onboarding_completed_count,
    'onboarding_pending', onboarding_pending_count
  );
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.get_user_stats_corrected() IS 
'Retorna estatísticas de usuários, contando masters pela tabela organizations ao invés do campo master_email (que estava vazio)';