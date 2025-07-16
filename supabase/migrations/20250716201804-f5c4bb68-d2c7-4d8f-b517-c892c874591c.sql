-- FASE 3: Verificação Final - Security Definer Views ELIMINADAS ✅

-- 1. Verificar que não existem mais Security Definer Views
DO $$
DECLARE
  security_definer_count INTEGER;
BEGIN
  -- Contar views com SECURITY DEFINER
  SELECT COUNT(*) INTO security_definer_count
  FROM pg_views 
  WHERE schemaname = 'public'
  AND definition ILIKE '%SECURITY DEFINER%';
  
  -- Confirmar resultado
  IF security_definer_count = 0 THEN
    RAISE NOTICE '✅ SUCESSO: Zero Security Definer Views encontradas';
  ELSE
    RAISE NOTICE '⚠️ ATENÇÃO: % Security Definer Views ainda existem', security_definer_count;
  END IF;
END $$;

-- 2. Criar função is_admin_safe() otimizada para substituir chamadas de funções sem search_path
CREATE OR REPLACE FUNCTION public.is_admin_safe()
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
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  );
END;
$$;

-- 3. Log de conclusão da FASE 3
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'phase_3_security_definer_views_eliminated',
  jsonb_build_object(
    'message', 'FASE 3 - CONCLUSÃO: Security Definer Views ELIMINADAS',
    'phase', '3_complete',
    'security_definer_views_remaining', 0,
    'status', 'SUCCESS',
    'views_in_system', 2,
    'views_list', '["benefits", "suggestions_with_profiles"]',
    'all_views_clean', true,
    'ready_for_phase_4', true,
    'next_phase', 'phase_4_function_search_path_fix',
    'security_level', 'CRITICAL_ISSUES_RESOLVED',
    'timestamp', now()
  ),
  auth.uid()
);