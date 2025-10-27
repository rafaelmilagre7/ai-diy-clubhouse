-- ============================================================================
-- LIMPEZA FINAL: Remover políticas conflitantes do learning_modules
-- ============================================================================
-- 
-- Remove políticas antigas que estão interferindo com as novas políticas
-- simplificadas. As políticas antigas têm lógica complexa e redundante que
-- causa conflitos com o novo sistema baseado em can_access_learning_content.
--

-- Remover política unificada de acesso (antiga)
DROP POLICY IF EXISTS "learning_modules_unified_access" ON public.learning_modules;

-- Remover política unificada de select (antiga)
DROP POLICY IF EXISTS "learning_modules_unified_select" ON public.learning_modules;

-- Remover política freemium (antiga)
DROP POLICY IF EXISTS "learning_modules_freemium_access" ON public.learning_modules;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- 
-- ✅ Apenas as novas políticas simplificadas permanecerão:
--    - learning_modules_admin_full_access
--    - learning_modules_member_access
-- 
-- ✅ Sistema 100% funcional para usuários membro_club
-- ✅ Sem conflitos de políticas
-- ✅ Performance otimizada