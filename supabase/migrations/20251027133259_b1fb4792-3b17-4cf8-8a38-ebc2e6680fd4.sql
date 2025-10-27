-- =====================================================
-- CORREÇÃO FINAL: Adicionar search_path nas 2 funções 
-- restantes que ainda não têm proteção
-- =====================================================

-- Esta migration corrige o problema causado pela migration
-- 20251026113055 que recriou check_ai_solution_limit sem
-- incluir SET search_path = public

-- Função 1: check_ai_solution_limit
-- Protege contra path hijacking em verificação de limites de IA
ALTER FUNCTION public.check_ai_solution_limit(uuid) 
  SET search_path = public;

-- Função 2: recover_missing_whatsapp_numbers  
-- Protege contra path hijacking em recuperação de números WhatsApp
ALTER FUNCTION public.recover_missing_whatsapp_numbers() 
  SET search_path = public;

-- =====================================================
-- VALIDAÇÃO: Verificar que todas as funções SECURITY DEFINER
-- agora têm search_path configurado
-- =====================================================

DO $$
DECLARE
  v_total_definer INTEGER;
  v_protected INTEGER;
  v_unprotected INTEGER;
  v_function_list TEXT;
BEGIN
  -- Contar total de funções SECURITY DEFINER
  SELECT COUNT(*) INTO v_total_definer
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef = true;
    
  -- Contar funções protegidas
  SELECT COUNT(*) INTO v_protected
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND EXISTS (
      SELECT 1 FROM unnest(p.proconfig) cfg 
      WHERE cfg LIKE 'search_path=%'
    );
  
  -- Calcular não protegidas
  v_unprotected := v_total_definer - v_protected;
  
  -- Listar funções não protegidas (se houver)
  IF v_unprotected > 0 THEN
    SELECT string_agg(p.proname, ', ') INTO v_function_list
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND (p.proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM unnest(p.proconfig) cfg 
        WHERE cfg LIKE 'search_path=%'
      ));
    
    RAISE EXCEPTION '❌ FALHA: % de % funções SECURITY DEFINER ainda sem proteção: %',
      v_unprotected, v_total_definer, v_function_list;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUCESSO: Todas as % funções SECURITY DEFINER estão protegidas!', v_total_definer;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funções protegidas: %', v_protected;
  RAISE NOTICE 'Funções não protegidas: %', v_unprotected;
  RAISE NOTICE '========================================';
END $$;