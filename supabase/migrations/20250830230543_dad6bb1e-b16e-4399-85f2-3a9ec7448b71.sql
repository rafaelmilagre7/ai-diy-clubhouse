-- Remover função com CASCADE para eliminar dependências
DROP FUNCTION IF EXISTS public.can_access_learning_content(uuid) CASCADE;

-- Recriar a função com verificação dinâmica de permissões
CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_permissions jsonb;
  has_learning_access boolean := false;
BEGIN
  -- Buscar permissões do usuário através da tabela user_roles
  SELECT ur.permissions INTO user_permissions
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Se não encontrou permissões, negar acesso
  IF user_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se tem permissão de learning
  has_learning_access := COALESCE((user_permissions->>'learning')::boolean, false);
  
  -- Log adicional para auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    target_user_id,
    'learning_access_check',
    'can_access_learning_content',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'permissions', user_permissions,
      'access_granted', has_learning_access,
      'function_version', 'dynamic_permissions_v2'
    ),
    'info'
  );
  
  RETURN has_learning_access;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      target_user_id,
      'learning_access_error',
      'can_access_learning_content_error',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'error', SQLERRM,
        'function_version', 'dynamic_permissions_v2'
      ),
      'error'
    );
    
    RETURN false;
END;
$function$;

-- Comentário explicativo da mudança
COMMENT ON FUNCTION public.can_access_learning_content(uuid) IS 
'Verifica se usuário pode acessar conteúdo de aprendizado baseado em permissões dinâmicas (permissions.learning = true) ao invés de roles hardcoded. Atualizada para corrigir acesso de usuários hands_on.';

-- Recriar políticas RLS que foram removidas pelo CASCADE

-- Política para storage - learning_materials
CREATE POLICY learning_materials_authenticated_select
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'learning_materials' 
  AND can_access_learning_content(auth.uid())
);

-- Política para storage - learning_videos
CREATE POLICY learning_videos_content_access
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'learning_videos' 
  AND can_access_learning_content(auth.uid())
);

-- Política para unified_checklists
CREATE POLICY "Club members can view checklist templates"
ON unified_checklists FOR SELECT 
TO authenticated
USING (
  is_template = true 
  AND can_access_learning_content(auth.uid())
);

-- Política para learning_lesson_videos
CREATE POLICY learning_lesson_videos_user_read
ON learning_lesson_videos FOR SELECT 
TO authenticated
USING (can_access_learning_content(auth.uid()));