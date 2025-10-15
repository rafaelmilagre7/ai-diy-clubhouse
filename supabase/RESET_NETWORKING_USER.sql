-- ============================================
-- RESET COMPLETO DO NETWORKING PARA USUÁRIO
-- ============================================
-- 
-- IMPORTANTE: Substitua 'SEU_EMAIL@dominio.com' pelo email real do usuário
-- 
-- Este script vai:
-- 1. Deletar todos os matches estratégicos do usuário
-- 2. Deletar notificações de conexão
-- 3. Resetar última data de geração de matches
-- 4. Criar log de auditoria da operação
--
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/sql/new
--
-- ============================================

DO $$
DECLARE
  target_user_id uuid;
  deleted_matches integer;
  deleted_notifications integer;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'SEU_EMAIL@dominio.com'; -- 🔴 SUBSTITUIR PELO EMAIL REAL
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com email: SEU_EMAIL@dominio.com';
  END IF;
  
  RAISE NOTICE '🔍 Usuário encontrado: %', target_user_id;
  
  -- 1. Deletar todos os matches estratégicos
  DELETE FROM public.strategic_matches_v2
  WHERE user_id = target_user_id;
  
  GET DIAGNOSTICS deleted_matches = ROW_COUNT;
  RAISE NOTICE '✅ Deletados % matches estratégicos', deleted_matches;
  
  -- 2. Deletar notificações de conexão
  DELETE FROM public.connection_notifications
  WHERE user_id = target_user_id;
  
  GET DIAGNOSTICS deleted_notifications = ROW_COUNT;
  RAISE NOTICE '✅ Deletadas % notificações', deleted_notifications;
  
  -- 3. Resetar preferências de networking (último match gerado)
  UPDATE public.networking_preferences
  SET last_match_generated = NULL,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  RAISE NOTICE '✅ Preferências de networking resetadas';
  
  -- 4. Log da operação de reset
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    target_user_id,
    'networking_reset',
    'complete_user_reset',
    jsonb_build_object(
      'deleted_matches', deleted_matches,
      'deleted_notifications', deleted_notifications,
      'reset_timestamp', now(),
      'reason', 'Testing new AI-powered copy with onboarding data'
    ),
    'info'
  );
  
  RAISE NOTICE '✅ Log de auditoria criado';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎉 RESET CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE 'Agora vá para /networking e clique em "Gerar novas conexões"';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
END $$;


-- ============================================
-- OPCIONAL: VERIFICAR DADOS DE ONBOARDING
-- ============================================
-- Execute este query para verificar se o usuário tem dados de onboarding
-- completos antes de gerar novos matches:

-- SELECT 
--   user_id,
--   goals_info->>'main_objective' as objetivo,
--   goals_info->>'area_to_impact' as area_impacto,
--   goals_info->>'expected_result_90_days' as resultado_esperado,
--   ai_experience->>'ai_knowledge_level' as nivel_ia,
--   ai_experience->>'ai_main_challenge' as desafio_ia,
--   business_info->>'business_sector' as setor,
--   business_info->>'position' as cargo
-- FROM onboarding_final
-- WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email = 'SEU_EMAIL@dominio.com'
-- );


-- ============================================
-- OPCIONAL: CONTAR MATCHES ATUAIS
-- ============================================
-- Execute este query ANTES do reset para ver quantos matches serão deletados:

-- SELECT COUNT(*) as total_matches
-- FROM strategic_matches_v2
-- WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email = 'SEU_EMAIL@dominio.com'
-- );
