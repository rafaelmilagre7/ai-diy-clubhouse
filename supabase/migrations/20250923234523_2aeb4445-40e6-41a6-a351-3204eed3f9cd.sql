-- ETAPA 1: Remover a função antiga que causa ambiguidade
-- Isso é necessário porque PostgreSQL não permite alterar nomes de parâmetros
DROP FUNCTION IF EXISTS public.can_access_benefit(uuid, uuid);

-- ETAPA 2: Criar a função corrigida com parâmetros renomeados
-- Esta correção resolve o erro "column reference 'tool_id' is ambiguous"
-- que impedia usuários como giuliano@curtinaz.com.br de acessar as seções
CREATE OR REPLACE FUNCTION public.can_access_benefit(p_user_id uuid, p_tool_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role_name text;
  is_restricted boolean := false;
BEGIN
  -- Verificar se usuário existe e obter role
  SELECT ur.name INTO user_role_name
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = p_user_id;
  
  -- Se não encontrou usuário, negar acesso
  IF user_role_name IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admins têm acesso total
  IF user_role_name = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Verificar se a ferramenta tem restrições de acesso
  SELECT EXISTS(
    SELECT 1 FROM benefit_access_control bac
    WHERE bac.tool_id = p_tool_id
  ) INTO is_restricted;
  
  -- Se ferramenta não tem restrições, todos podem acessar
  IF NOT is_restricted THEN
    RETURN true;
  END IF;
  
  -- Se ferramenta tem restrições, verificar se usuário tem acesso via role
  RETURN EXISTS(
    SELECT 1 
    FROM benefit_access_control bac
    INNER JOIN profiles p ON p.role_id = bac.role_id
    WHERE bac.tool_id = p_tool_id
    AND p.id = p_user_id
  );
END;
$function$;