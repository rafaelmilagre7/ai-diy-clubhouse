-- ==========================================
-- PAPÉIS CONFUSOS - SOLUÇÃO GRADUAL E SEGURA
-- Criar fonte única da verdade sem quebrar sistema
-- ==========================================

-- 1. CORRIGIR AUDIT LOGS RLS (que está causando erros)
DROP POLICY IF EXISTS "audit_logs_secure_insert" ON audit_logs;
CREATE POLICY "audit_logs_service_role_insert" ON audit_logs
FOR INSERT 
WITH CHECK (
  (auth.role() = 'service_role') OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 2. GARANTIR QUE TODOS OS USUÁRIOS TENHAM ROLE_ID
DO $$
DECLARE
    profiles_without_role_id integer;
    admin_role_id uuid;
    member_role_id uuid;
BEGIN
    -- Contar usuários sem role_id
    SELECT COUNT(*) INTO profiles_without_role_id
    FROM profiles WHERE role_id IS NULL;
    
    RAISE NOTICE 'Usuários sem role_id: %', profiles_without_role_id;
    
    IF profiles_without_role_id > 0 THEN
        -- Buscar roles existentes
        SELECT id INTO admin_role_id FROM user_roles WHERE name = 'admin' LIMIT 1;
        SELECT id INTO member_role_id FROM user_roles WHERE name IN ('member', 'membro', 'membro_club') LIMIT 1;
        
        -- Criar role member se não existir
        IF member_role_id IS NULL THEN
            INSERT INTO user_roles (name, description, permissions) 
            VALUES ('member', 'Membro padrão', '{"basic": true}'::jsonb)
            RETURNING id INTO member_role_id;
        END IF;
        
        -- Migrar baseado no campo 'role' existente
        UPDATE profiles 
        SET role_id = CASE 
            WHEN role = 'admin' AND admin_role_id IS NOT NULL THEN admin_role_id
            ELSE member_role_id
        END
        WHERE role_id IS NULL;
        
        RAISE NOTICE 'Migração concluída. Usuários atualizados: %', profiles_without_role_id;
    END IF;
END $$;

-- 3. CRIAR NOVA FUNÇÃO QUE USA APENAS ROLE_ID (sem substituir a existente ainda)
CREATE OR REPLACE FUNCTION public.is_admin_via_role_table()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  );
$$;

-- 4. FUNÇÃO PARA OBTER ROLE ATUAL VIA TABELA DE ROLES
CREATE OR REPLACE FUNCTION public.get_user_role_via_table()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- 5. FUNÇÃO PARA VALIDAR CONSISTÊNCIA ENTRE OS DOIS SISTEMAS
CREATE OR REPLACE FUNCTION public.validate_role_consistency()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    inconsistent_count integer;
    missing_role_id integer;
    orphaned_role_ids integer;
    result jsonb;
BEGIN
    -- Contar inconsistências entre 'role' e 'role_id'
    SELECT COUNT(*) INTO inconsistent_count
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.role IS DISTINCT FROM ur.name;
    
    -- Contar perfis sem role_id
    SELECT COUNT(*) INTO missing_role_id
    FROM profiles WHERE role_id IS NULL;
    
    -- Contar role_ids órfãos
    SELECT COUNT(*) INTO orphaned_role_ids
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.role_id IS NOT NULL AND ur.id IS NULL;
    
    result := jsonb_build_object(
        'total_profiles', (SELECT COUNT(*) FROM profiles),
        'inconsistent_roles', inconsistent_count,
        'missing_role_id', missing_role_id,
        'orphaned_role_ids', orphaned_role_ids,
        'is_consistent', (inconsistent_count = 0 AND missing_role_id = 0 AND orphaned_role_ids = 0),
        'validation_time', now()
    );
    
    -- Log da validação
    INSERT INTO audit_logs (
        user_id, event_type, action, details, severity
    ) VALUES (
        auth.uid(), 'role_validation', 'consistency_check', result,
        CASE WHEN inconsistent_count > 0 OR missing_role_id > 0 OR orphaned_role_ids > 0 
             THEN 'warning' ELSE 'info' END
    );
    
    RETURN result;
END;
$$;

-- 6. EXECUTAR VALIDAÇÃO INICIAL
SELECT public.validate_role_consistency();

-- 7. LOG DA MIGRAÇÃO
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'role_system_preparation_completed',
  jsonb_build_object(
    'migration_phase', 'preparation',
    'actions', ARRAY[
      'fixed_audit_logs_rls_violations',
      'ensured_all_users_have_role_id',
      'created_role_table_functions',
      'created_consistency_validator'
    ],
    'status', 'ready_for_gradual_migration',
    'next_steps', ARRAY[
      'gradually_replace_policies',
      'remove_role_field_when_safe',
      'consolidate_to_single_source_of_truth'
    ],
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;