-- Etapa 2: Adicionar SET search_path = public nas 12 funções restantes
-- Estas são funções de trigger e utilitárias que também precisam de proteção
-- IMPACTO: Zero quebra de funcionalidade

-- Funções de trigger para updated_at
ALTER FUNCTION public.update_builder_solutions_timestamp() SET search_path = public;
ALTER FUNCTION public.update_hubla_webhooks_updated_at() SET search_path = public;
ALTER FUNCTION public.update_implementation_progress_updated_at() SET search_path = public;
ALTER FUNCTION public.update_invite_campaigns_updated_at() SET search_path = public;
ALTER FUNCTION public.update_onboarding_sync_updated_at() SET search_path = public;
ALTER FUNCTION public.update_onboarding_updated_at() SET search_path = public;
ALTER FUNCTION public.update_security_incidents_timestamp() SET search_path = public;
ALTER FUNCTION public.update_strategic_matches_v2_timestamp() SET search_path = public;

-- Outras funções utilitárias
ALTER FUNCTION public.generate_nps_response_code() SET search_path = public;
ALTER FUNCTION public.migrate_existing_onboarding_data() SET search_path = public;
ALTER FUNCTION public.prevent_invalid_completion() SET search_path = public;
ALTER FUNCTION public.update_suggestion_vote_counts() SET search_path = public;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ ETAPA 2 COMPLETA: Mais 12 funções agora protegidas';
  RAISE NOTICE '📊 Total de funções protegidas: 25/25 (100%%)';
  RAISE NOTICE '🛡️ Todas as funções do sistema agora têm search_path configurado!';
END $$;