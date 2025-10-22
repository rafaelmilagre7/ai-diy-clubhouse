-- SCRIPT DE VALIDAÇÃO DE SEGURANÇA COMPLETO
-- Execute após implementar todas as fases

-- ========================================
-- 1. Verificar RLS em tabelas críticas
-- ========================================
SELECT 
  '❌ CRÍTICO: Tabela sem RLS' as status,
  tablename
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates')
AND rowsecurity = false

UNION ALL

SELECT 
  '✅ OK: RLS habilitado' as status,
  tablename
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates')
AND rowsecurity = true;

-- ========================================
-- 2. Verificar políticas RLS criadas
-- ========================================
SELECT 
  '✅ Política encontrada' as status,
  tablename,
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN 'Tem condição USING'
    ELSE 'Sem condição'
  END as tem_condicao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates')
ORDER BY tablename, policyname;

-- ========================================
-- 3. Verificar search_path em funções SECURITY DEFINER
-- ========================================
SELECT 
  p.proname as funcao,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ Protegida'
    ELSE '❌ VULNERÁVEL'
  END as status_search_path,
  'SECURITY DEFINER' as tipo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true
ORDER BY 
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN 1
    ELSE 0
  END,
  p.proname;

-- ========================================
-- 4. Verificar views SECURITY DEFINER
-- ========================================
SELECT 
  '⚠️ View SECURITY DEFINER' as status,
  viewname,
  viewowner
FROM pg_views 
WHERE schemaname = 'public' 
AND definition LIKE '%SECURITY DEFINER%';

-- ========================================
-- 5. Resumo de segurança
-- ========================================
SELECT 
  'RLS Habilitado' as metrica,
  COUNT(*) FILTER (WHERE rowsecurity = true) as valor,
  'tabelas críticas' as unidade
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates')

UNION ALL

SELECT 
  'Políticas RLS',
  COUNT(*),
  'políticas'
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates')

UNION ALL

SELECT 
  'Funções Protegidas',
  COUNT(*) FILTER (WHERE pg_get_functiondef(p.oid) LIKE '%SET search_path%'),
  'funções SECURITY DEFINER'
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true;

-- ========================================
-- 6. Checklist final
-- ========================================
DO $$
DECLARE
  v_rls_count integer;
  v_policy_count integer;
  v_function_count integer;
  v_total_definer_functions integer;
BEGIN
  -- Contar RLS
  SELECT COUNT(*) INTO v_rls_count
  FROM pg_tables 
  WHERE schemaname = 'public'
  AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates')
  AND rowsecurity = true;
  
  -- Contar políticas
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('networking_opportunities_backup', 'learning_certificate_templates');
  
  -- Contar funções protegidas
  SELECT 
    COUNT(*) FILTER (WHERE pg_get_functiondef(p.oid) LIKE '%SET search_path%'),
    COUNT(*)
  INTO v_function_count, v_total_definer_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prosecdef = true;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CHECKLIST DE SEGURANÇA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '[%] RLS habilitado: % de 2 tabelas', 
    CASE WHEN v_rls_count = 2 THEN '✅' ELSE '❌' END, v_rls_count;
  RAISE NOTICE '[%] Políticas RLS: % políticas criadas', 
    CASE WHEN v_policy_count >= 3 THEN '✅' ELSE '❌' END, v_policy_count;
  RAISE NOTICE '[%] Funções protegidas: % de % funções', 
    CASE WHEN v_function_count = v_total_definer_functions THEN '✅' ELSE '❌' END, 
    v_function_count, v_total_definer_functions;
  RAISE NOTICE '========================================';
  
  IF v_rls_count = 2 AND v_policy_count >= 3 AND v_function_count = v_total_definer_functions THEN
    RAISE NOTICE '🎉 TODAS AS VERIFICAÇÕES PASSARAM!';
  ELSE
    RAISE NOTICE '⚠️  Algumas verificações falharam. Revise acima.';
  END IF;
END $$;
