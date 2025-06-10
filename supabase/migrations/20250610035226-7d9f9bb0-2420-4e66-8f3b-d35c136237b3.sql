
-- CORREÇÃO CRÍTICA: SUBSTITUIR IMPLEMENTAÇÃO DA FUNÇÃO is_user_admin SEM RECURSÃO
-- ===============================================================================

-- PROBLEMA: Não podemos fazer DROP da função porque 15+ políticas RLS dependem dela
-- SOLUÇÃO: Substituir apenas a implementação, mantendo a assinatura da função

-- ETAPA 1: SUBSTITUIR IMPLEMENTAÇÃO SEM REMOVER A FUNÇÃO
-- ======================================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- NOVA IMPLEMENTAÇÃO: Usar user_metadata do JWT sem acessar tabela profiles
  -- Isso evita completamente a recursão infinita nas políticas RLS
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
  -- Verificação de segurança: apenas para o usuário autenticado atual
  WHERE user_id = auth.uid();
$$;

-- ETAPA 2: CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR ROLE ATUAL
-- ========================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'member'
  );
$$;

-- ETAPA 3: VERIFICAR SE A FUNÇÃO FOI ATUALIZADA CORRETAMENTE
-- =========================================================

-- Buscar a definição atual da função para confirmar a mudança
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_user_admin' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ETAPA 4: LISTAR POLÍTICAS QUE DEPENDEM DA FUNÇÃO
-- ================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE qual LIKE '%is_user_admin%'
ORDER BY tablename, policyname;

-- RESULTADO ESPERADO:
-- - Função is_user_admin mantém assinatura original
-- - Nova implementação usa apenas user_metadata do JWT  
-- - Sem acesso à tabela profiles (elimina recursão)
-- - Todas as 15+ políticas RLS continuam funcionando
-- - Performance melhorada (acesso direto ao JWT)

-- OBSERVAÇÕES IMPORTANTES:
-- 1. Esta abordagem resolve a recursão mantendo compatibilidade
-- 2. O user_metadata deve ser atualizado no login com o role do usuário
-- 3. Esta é a correção definitiva da CAUSA RAIZ do problema
