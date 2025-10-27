-- ============================================
-- FUNÇÃO SECURITY DEFINER PARA BUSCAR TEMPLATES DE CHECKLIST
-- Resolve erro 500 causado por problemas de RLS
-- ============================================

-- Criar função para buscar template de checklist (bypassa RLS)
CREATE OR REPLACE FUNCTION get_checklist_template(
  p_solution_id uuid,
  p_checklist_type text DEFAULT 'implementation'
)
RETURNS TABLE (
  id uuid,
  solution_id uuid,
  checklist_type text,
  checklist_data jsonb,
  is_template boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Buscando template para solution_id: %, tipo: %', p_solution_id, p_checklist_type;
  
  RETURN QUERY
  SELECT 
    uc.id,
    uc.solution_id,
    uc.checklist_type,
    uc.checklist_data,
    uc.is_template,
    uc.created_at,
    uc.updated_at
  FROM unified_checklists uc
  WHERE uc.solution_id = p_solution_id
    AND uc.checklist_type = p_checklist_type
    AND uc.is_template = true
  ORDER BY uc.created_at DESC
  LIMIT 1;
END;
$$;

-- Dar permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION get_checklist_template TO authenticated;

-- Adicionar comentário
COMMENT ON FUNCTION get_checklist_template IS 'Busca template de checklist usando SECURITY DEFINER para bypassar RLS';

-- ============================================
-- VERIFICAR E CORRIGIR POLÍTICAS RLS
-- ============================================

-- Garantir que RLS está habilitado
ALTER TABLE unified_checklists ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura para usuários autenticados (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'unified_checklists' 
    AND policyname = 'Usuários podem ler checklists de suas soluções'
  ) THEN
    CREATE POLICY "Usuários podem ler checklists de suas soluções"
    ON unified_checklists
    FOR SELECT
    TO authenticated
    USING (
      solution_id IN (
        SELECT id FROM solutions WHERE user_id = auth.uid()
      )
      OR
      solution_id IN (
        SELECT id FROM ai_generated_solutions WHERE user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
      )
    );
  END IF;
END $$;