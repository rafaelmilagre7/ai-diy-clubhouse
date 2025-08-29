-- ⚡ OTIMIZAÇÃO DE EXCLUSÃO DE CONVITES - Soft Delete (Versão Simplificada)

-- 1️⃣ Adicionar coluna para Soft Delete
ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- 2️⃣ Criar índices básicos para performance (sem CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_invites_deleted_at 
ON public.invites (deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invites_active 
ON public.invites (created_at DESC) 
WHERE deleted_at IS NULL;

-- 3️⃣ Função para soft delete rápido
CREATE OR REPLACE FUNCTION public.soft_delete_invite_fast(p_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record record;
  v_is_admin boolean := false;
  v_user_id uuid := auth.uid();
BEGIN
  -- Verificar se é admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = v_user_id AND ur.name = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado'
    );
  END IF;
  
  -- Buscar convite
  SELECT email INTO invite_record
  FROM public.invites
  WHERE id = p_invite_id AND deleted_at IS NULL;
  
  IF invite_record.email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite não encontrado'
    );
  END IF;
  
  -- Soft Delete
  UPDATE public.invites 
  SET deleted_at = now()
  WHERE id = p_invite_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite removido',
    'email', invite_record.email
  );
END;
$function$;